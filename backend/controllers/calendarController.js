const BaseController = require('./BaseController');
const { google } = require('googleapis');

class CalendarController extends BaseController {
    
    constructor() {
        super();
        this.calendar = null;
        this.oauth2Client = null;
        this.setupGoogleCalendar();
    }

    /**
     * Initialize Google Calendar API
     */
    setupGoogleCalendar() {
        try {
            // Initialize OAuth2 client
            this.oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/calendar/callback'
            );

            // Set credentials if available
            if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
                this.oauth2Client.setCredentials({
                    access_token: process.env.GOOGLE_ACCESS_TOKEN,
                    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
                });
            }

            // Initialize Calendar API
            this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
            
            console.log('Google Calendar API initialized');
        } catch (error) {
            console.log('Google Calendar API not configured, using local data:', error.message);
        }
    }

    /**
     * Get OAuth authorization URL
     */
    async getAuthUrl(req, res) {
        try {
            if (!this.oauth2Client) {
                return this.sendError(res, 'Google Calendar API not configured', 500);
            }

            const scopes = [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events'
            ];

            const authUrl = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                prompt: 'consent'
            });

            this.sendSuccess(res, { authUrl }, 'Authorization URL generated');
        } catch (error) {
            this.sendError(res, 'Failed to generate auth URL', 500, error);
        }
    }

    /**
     * Handle OAuth callback
     */
    async handleCallback(req, res) {
        try {
            const { code } = req.query;
            
            if (!code) {
                return this.sendValidationError(res, { message: 'Authorization code is required' });
            }

            if (!this.oauth2Client) {
                return this.sendError(res, 'Google Calendar API not configured', 500);
            }

            // Exchange code for tokens
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);

            // Store tokens (in production, save to database)
            console.log('Tokens received:', {
                access_token: tokens.access_token ? 'present' : 'missing',
                refresh_token: tokens.refresh_token ? 'present' : 'missing'
            });

            // Redirect to success page
            res.redirect('/admin-upload.html?calendar=connected');
        } catch (error) {
            this.sendError(res, 'Failed to handle OAuth callback', 500, error);
        }
    }

    /**
     * Get calendar events
     */
    async getEvents(req, res) {
        try {
            const { 
                timeMin = new Date().toISOString(),
                timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                maxResults = 50
            } = req.query;

            let events = [];

            // Try to fetch from Google Calendar if configured
            if (this.calendar && this.oauth2Client.credentials.access_token) {
                try {
                    const response = await this.calendar.events.list({
                        calendarId: 'primary',
                        timeMin,
                        timeMax,
                        maxResults: parseInt(maxResults),
                        singleEvents: true,
                        orderBy: 'startTime'
                    });

                    events = response.data.items.map(event => ({
                        id: event.id,
                        title: event.summary,
                        description: event.description || '',
                        start: event.start.dateTime || event.start.date,
                        end: event.end.dateTime || event.end.date,
                        location: event.location || '',
                        status: event.status,
                        source: 'google'
                    }));
                } catch (apiError) {
                    console.log('Google Calendar API error, using sample data:', apiError.message);
                }
            }

            // If no Google Calendar events or API not configured, use sample data
            if (events.length === 0) {
                events = this.getSampleEvents();
            }

            this.sendSuccess(res, { events, source: events[0]?.source || 'sample' }, 'Events retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve events', 500, error);
        }
    }

    /**
     * Create a new calendar event
     */
    async createEvent(req, res) {
        try {
            const { title, description, start, end, location } = req.body;

            if (!title || !start || !end) {
                return this.sendValidationError(res, { 
                    message: 'Title, start time, and end time are required' 
                });
            }

            let eventResult = null;

            // Try to create in Google Calendar if configured
            if (this.calendar && this.oauth2Client.credentials.access_token) {
                try {
                    const event = {
                        summary: title,
                        description: description || '',
                        location: location || '',
                        start: {
                            dateTime: start,
                            timeZone: 'America/New_York'
                        },
                        end: {
                            dateTime: end,
                            timeZone: 'America/New_York'
                        }
                    };

                    const response = await this.calendar.events.insert({
                        calendarId: 'primary',
                        resource: event
                    });

                    eventResult = {
                        id: response.data.id,
                        title: response.data.summary,
                        start: response.data.start.dateTime,
                        end: response.data.end.dateTime,
                        source: 'google'
                    };
                } catch (apiError) {
                    console.log('Google Calendar API error:', apiError.message);
                }
            }

            // If Google Calendar creation failed or not configured, create local event
            if (!eventResult) {
                eventResult = {
                    id: Date.now().toString(),
                    title,
                    description,
                    start,
                    end,
                    location,
                    source: 'local'
                };
            }

            this.sendSuccess(res, { event: eventResult }, 'Event created successfully');
        } catch (error) {
            this.sendError(res, 'Failed to create event', 500, error);
        }
    }

    /**
     * Check availability for a specific date/time
     */
    async checkAvailability(req, res) {
        try {
            const { date, startTime, endTime } = req.query;

            if (!date) {
                return this.sendValidationError(res, { message: 'Date is required' });
            }

            // Convert to ISO format for comparison
            const checkStart = new Date(`${date}T${startTime || '00:00:00'}`).toISOString();
            const checkEnd = new Date(`${date}T${endTime || '23:59:59'}`).toISOString();

            let isAvailable = true;
            let conflictingEvents = [];

            // Check Google Calendar if configured
            if (this.calendar && this.oauth2Client.credentials.access_token) {
                try {
                    const response = await this.calendar.events.list({
                        calendarId: 'primary',
                        timeMin: checkStart,
                        timeMax: checkEnd,
                        singleEvents: true
                    });

                    conflictingEvents = response.data.items.filter(event => {
                        const eventStart = new Date(event.start.dateTime || event.start.date);
                        const eventEnd = new Date(event.end.dateTime || event.end.date);
                        const requestStart = new Date(checkStart);
                        const requestEnd = new Date(checkEnd);

                        return (eventStart < requestEnd && eventEnd > requestStart);
                    });

                    isAvailable = conflictingEvents.length === 0;
                } catch (apiError) {
                    console.log('Google Calendar API error, checking sample data:', apiError.message);
                    // Fall back to sample data check
                    const sampleEvents = this.getSampleEvents();
                    conflictingEvents = sampleEvents.filter(event => {
                        return event.date === date && !event.isAvailable;
                    });
                    isAvailable = conflictingEvents.length === 0;
                }
            } else {
                // Check sample data
                const sampleEvents = this.getSampleEvents();
                conflictingEvents = sampleEvents.filter(event => {
                    return event.date === date && !event.isAvailable;
                });
                isAvailable = conflictingEvents.length === 0;
            }

            this.sendSuccess(res, { 
                isAvailable, 
                date, 
                conflictingEvents: conflictingEvents.length,
                message: isAvailable ? 'Date is available' : 'Date has conflicts'
            }, 'Availability checked successfully');
        } catch (error) {
            this.sendError(res, 'Failed to check availability', 500, error);
        }
    }

    /**
     * Get calendar statistics
     */
    async getCalendarStats(req, res) {
        try {
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            let totalEvents = 0;
            let upcomingEvents = 0;
            let availableDates = 0;

            // Get events for stats
            if (this.calendar && this.oauth2Client.credentials.access_token) {
                try {
                    const response = await this.calendar.events.list({
                        calendarId: 'primary',
                        timeMin: now.toISOString(),
                        timeMax: thirtyDaysFromNow.toISOString(),
                        singleEvents: true
                    });

                    totalEvents = response.data.items.length;
                    upcomingEvents = response.data.items.filter(event => {
                        const eventDate = new Date(event.start.dateTime || event.start.date);
                        return eventDate > now;
                    }).length;
                } catch (apiError) {
                    console.log('Google Calendar API error, using sample data for stats');
                }
            }

            // Fall back to sample data if needed
            if (totalEvents === 0) {
                const sampleEvents = this.getSampleEvents();
                totalEvents = sampleEvents.length;
                upcomingEvents = sampleEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate > now && !event.isAvailable;
                }).length;
                availableDates = sampleEvents.filter(event => event.isAvailable).length;
            }

            const stats = {
                totalEvents,
                upcomingEvents,
                availableDates,
                nextAvailableDate: this.getNextAvailableDate(),
                calendarSource: this.oauth2Client?.credentials?.access_token ? 'google' : 'sample'
            };

            this.sendSuccess(res, stats, 'Calendar statistics retrieved');
        } catch (error) {
            this.sendError(res, 'Failed to get calendar statistics', 500, error);
        }
    }

    /**
     * Get sample events for development/fallback
     */
    getSampleEvents() {
        return [
            {
                id: '1',
                title: 'Wedding Reception - Sarah & Mike',
                date: '2024-09-15',
                time: '18:00',
                endTime: '23:00',
                type: 'wedding',
                status: 'confirmed',
                venue: 'Malibu Beach Resort',
                location: 'Malibu, CA',
                description: 'Oceanfront wedding reception with DJ entertainment',
                isAvailable: false,
                source: 'sample'
            },
            {
                id: '2',
                title: 'Corporate Event - Tech Conference',
                date: '2024-09-22',
                time: '19:00',
                endTime: '22:00',
                type: 'corporate',
                status: 'confirmed',
                venue: 'Downtown Convention Center',
                location: 'Los Angeles, CA',
                description: 'Annual tech conference after-party',
                isAvailable: false,
                source: 'sample'
            },
            {
                id: '3',
                title: 'Available for Booking',
                date: '2024-09-14',
                time: '18:00',
                endTime: '23:59',
                type: 'available',
                status: 'available',
                venue: '',
                location: '',
                description: 'Available for private events',
                isAvailable: true,
                source: 'sample'
            },
            {
                id: '4',
                title: 'Available for Booking',
                date: '2024-09-21',
                time: '18:00',
                endTime: '23:59',
                type: 'available',
                status: 'available',
                venue: '',
                location: '',
                description: 'Available for private events',
                isAvailable: true,
                source: 'sample'
            }
        ];
    }

    /**
     * Get next available date
     */
    getNextAvailableDate() {
        const sampleEvents = this.getSampleEvents();
        const availableEvent = sampleEvents.find(event => event.isAvailable);
        return availableEvent ? availableEvent.date : null;
    }
}

module.exports = CalendarController;
