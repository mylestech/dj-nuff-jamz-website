const BaseController = require('./BaseController');
const fs = require('fs').promises;
const path = require('path');

class AnalyticsController extends BaseController {
    
    constructor() {
        super();
        this.analyticsData = [];
        this.sessionsData = new Map();
        this.setupAnalyticsStorage();
    }

    /**
     * Setup analytics data storage
     */
    async setupAnalyticsStorage() {
        try {
            const analyticsDir = path.join(__dirname, '../data/analytics');
            await fs.mkdir(analyticsDir, { recursive: true });
            
            // Load existing analytics data
            await this.loadAnalyticsData();
        } catch (error) {
            console.error('Failed to setup analytics storage:', error.message);
        }
    }

    /**
     * Load existing analytics data
     */
    async loadAnalyticsData() {
        try {
            const dataFile = path.join(__dirname, '../data/analytics/events.json');
            const data = await fs.readFile(dataFile, 'utf8');
            this.analyticsData = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, start with empty array
            this.analyticsData = [];
        }
    }

    /**
     * Save analytics data to file
     */
    async saveAnalyticsData() {
        try {
            const dataFile = path.join(__dirname, '../data/analytics/events.json');
            await fs.writeFile(dataFile, JSON.stringify(this.analyticsData, null, 2));
        } catch (error) {
            console.error('Failed to save analytics data:', error.message);
        }
    }

    /**
     * Track analytics event
     */
    async trackEvent(req, res) {
        try {
            const eventData = {
                ...req.body,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
                id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            // Store event
            this.analyticsData.push(eventData);
            
            // Update session data
            if (eventData.session_id) {
                if (!this.sessionsData.has(eventData.session_id)) {
                    this.sessionsData.set(eventData.session_id, {
                        session_id: eventData.session_id,
                        start_time: eventData.timestamp,
                        events: [],
                        page_views: 0,
                        conversions: 0
                    });
                }
                
                const session = this.sessionsData.get(eventData.session_id);
                session.events.push(eventData);
                session.last_activity = eventData.timestamp;
                
                if (eventData.event_name === 'page_view') {
                    session.page_views++;
                }
                
                if (eventData.event_name === 'conversion') {
                    session.conversions++;
                }
            }

            // Save to file periodically (every 10 events)
            if (this.analyticsData.length % 10 === 0) {
                await this.saveAnalyticsData();
            }

            this.sendSuccess(res, { tracked: true, event_id: eventData.id }, 'Event tracked successfully');
        } catch (error) {
            this.sendError(res, 'Failed to track event', 500, error);
        }
    }

    /**
     * Get analytics dashboard data
     */
    async getDashboard(req, res) {
        try {
            const { timeframe = '7d' } = req.query;
            const now = new Date();
            let startDate;

            // Calculate date range
            switch (timeframe) {
                case '24h':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            // Filter events by timeframe
            const filteredEvents = this.analyticsData.filter(event => 
                new Date(event.timestamp) >= startDate
            );

            // Calculate metrics
            const metrics = this.calculateMetrics(filteredEvents);
            const chartData = this.generateChartData(filteredEvents, timeframe);
            const topPages = this.getTopPages(filteredEvents);
            const topEvents = this.getTopEvents(filteredEvents);
            const conversionFunnel = this.getConversionFunnel(filteredEvents);

            const dashboardData = {
                timeframe,
                period: {
                    start: startDate.toISOString(),
                    end: now.toISOString()
                },
                metrics,
                charts: chartData,
                topPages,
                topEvents,
                conversionFunnel,
                realTime: this.getRealTimeData()
            };

            this.sendSuccess(res, dashboardData, 'Analytics dashboard data retrieved');
        } catch (error) {
            this.sendError(res, 'Failed to get analytics dashboard', 500, error);
        }
    }

    /**
     * Calculate key metrics
     */
    calculateMetrics(events) {
        const pageViews = events.filter(e => e.event_name === 'page_view').length;
        const uniqueSessions = new Set(events.map(e => e.session_id)).size;
        const conversions = events.filter(e => e.event_name === 'conversion').length;
        const bounceRate = this.calculateBounceRate(events);
        const avgSessionDuration = this.calculateAvgSessionDuration(events);

        return {
            pageViews,
            uniqueVisitors: uniqueSessions,
            conversions,
            conversionRate: uniqueSessions > 0 ? ((conversions / uniqueSessions) * 100).toFixed(2) : 0,
            bounceRate: bounceRate.toFixed(2),
            avgSessionDuration: Math.round(avgSessionDuration)
        };
    }

    /**
     * Calculate bounce rate
     */
    calculateBounceRate(events) {
        const sessions = {};
        
        events.forEach(event => {
            if (!sessions[event.session_id]) {
                sessions[event.session_id] = [];
            }
            sessions[event.session_id].push(event);
        });

        const totalSessions = Object.keys(sessions).length;
        const bouncedSessions = Object.values(sessions).filter(
            sessionEvents => sessionEvents.filter(e => e.event_name === 'page_view').length === 1
        ).length;

        return totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
    }

    /**
     * Calculate average session duration
     */
    calculateAvgSessionDuration(events) {
        const sessions = {};
        
        events.forEach(event => {
            if (!sessions[event.session_id]) {
                sessions[event.session_id] = {
                    start: event.timestamp,
                    end: event.timestamp
                };
            } else {
                if (new Date(event.timestamp) > new Date(sessions[event.session_id].end)) {
                    sessions[event.session_id].end = event.timestamp;
                }
            }
        });

        const durations = Object.values(sessions).map(session => 
            new Date(session.end) - new Date(session.start)
        );

        return durations.length > 0 ? 
            durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 1000 : 0;
    }

    /**
     * Generate chart data
     */
    generateChartData(events, timeframe) {
        const pageViewEvents = events.filter(e => e.event_name === 'page_view');
        const conversionEvents = events.filter(e => e.event_name === 'conversion');

        // Group by time intervals
        const intervals = this.getTimeIntervals(timeframe);
        const pageViewsChart = this.groupEventsByTime(pageViewEvents, intervals);
        const conversionsChart = this.groupEventsByTime(conversionEvents, intervals);

        return {
            pageViews: pageViewsChart,
            conversions: conversionsChart,
            events: this.getEventTypesChart(events)
        };
    }

    /**
     * Get time intervals for charting
     */
    getTimeIntervals(timeframe) {
        const intervals = [];
        const now = new Date();
        let intervalSize, intervalCount;

        switch (timeframe) {
            case '24h':
                intervalSize = 60 * 60 * 1000; // 1 hour
                intervalCount = 24;
                break;
            case '7d':
                intervalSize = 24 * 60 * 60 * 1000; // 1 day
                intervalCount = 7;
                break;
            case '30d':
                intervalSize = 24 * 60 * 60 * 1000; // 1 day
                intervalCount = 30;
                break;
            case '90d':
                intervalSize = 7 * 24 * 60 * 60 * 1000; // 1 week
                intervalCount = 13;
                break;
            default:
                intervalSize = 24 * 60 * 60 * 1000;
                intervalCount = 7;
        }

        for (let i = intervalCount - 1; i >= 0; i--) {
            intervals.push(new Date(now.getTime() - i * intervalSize));
        }

        return intervals;
    }

    /**
     * Group events by time intervals
     */
    groupEventsByTime(events, intervals) {
        return intervals.map(interval => {
            const nextInterval = new Date(interval.getTime() + (intervals[1] ? intervals[1].getTime() - intervals[0].getTime() : 24 * 60 * 60 * 1000));
            const count = events.filter(event => {
                const eventTime = new Date(event.timestamp);
                return eventTime >= interval && eventTime < nextInterval;
            }).length;

            return {
                time: interval.toISOString(),
                count
            };
        });
    }

    /**
     * Get event types chart data
     */
    getEventTypesChart(events) {
        const eventCounts = {};
        events.forEach(event => {
            eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
        });

        return Object.entries(eventCounts).map(([name, count]) => ({
            name,
            count
        }));
    }

    /**
     * Get top pages
     */
    getTopPages(events) {
        const pageViews = events.filter(e => e.event_name === 'page_view');
        const pageCounts = {};

        pageViews.forEach(event => {
            const page = event.page_path || '/';
            pageCounts[page] = (pageCounts[page] || 0) + 1;
        });

        return Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([page, views]) => ({ page, views }));
    }

    /**
     * Get top events
     */
    getTopEvents(events) {
        const eventCounts = {};
        events.forEach(event => {
            if (event.event_name !== 'page_view') {
                eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
            }
        });

        return Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([event, count]) => ({ event, count }));
    }

    /**
     * Get conversion funnel data
     */
    getConversionFunnel(events) {
        const sessions = {};
        
        events.forEach(event => {
            if (!sessions[event.session_id]) {
                sessions[event.session_id] = [];
            }
            sessions[event.session_id].push(event.event_name);
        });

        const funnelSteps = [
            { name: 'Visited Site', event: 'page_view' },
            { name: 'Viewed Services', event: 'services_view' },
            { name: 'Started Booking', event: 'form_start' },
            { name: 'Completed Booking', event: 'conversion' }
        ];

        return funnelSteps.map(step => {
            const count = Object.values(sessions).filter(sessionEvents => 
                sessionEvents.includes(step.event)
            ).length;
            
            return {
                step: step.name,
                count,
                percentage: Object.keys(sessions).length > 0 ? 
                    ((count / Object.keys(sessions).length) * 100).toFixed(1) : 0
            };
        });
    }

    /**
     * Get real-time data
     */
    getRealTimeData() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentEvents = this.analyticsData.filter(event => 
            new Date(event.timestamp) >= fiveMinutesAgo
        );

        const activeSessions = new Set(recentEvents.map(e => e.session_id)).size;
        const recentPageViews = recentEvents.filter(e => e.event_name === 'page_view').length;

        return {
            activeUsers: activeSessions,
            pageViewsLast5Min: recentPageViews,
            topPagesNow: this.getTopPages(recentEvents).slice(0, 5)
        };
    }

    /**
     * Get SEO metrics
     */
    async getSEOMetrics(req, res) {
        try {
            // This would integrate with Google Search Console API in production
            const seoMetrics = {
                searchConsole: {
                    impressions: 15420,
                    clicks: 892,
                    ctr: 5.8,
                    avgPosition: 12.3
                },
                pagespeed: {
                    desktop: 94,
                    mobile: 87,
                    lcp: 1.2,
                    fid: 45,
                    cls: 0.08
                },
                keywords: [
                    { keyword: 'DJ NYC', position: 8, impressions: 3200, clicks: 156 },
                    { keyword: 'Wedding DJ New York', position: 5, impressions: 1800, clicks: 124 },
                    { keyword: 'Corporate Event DJ', position: 12, impressions: 950, clicks: 67 },
                    { keyword: 'Afrobeats DJ NYC', position: 3, impressions: 720, clicks: 89 }
                ]
            };

            this.sendSuccess(res, seoMetrics, 'SEO metrics retrieved');
        } catch (error) {
            this.sendError(res, 'Failed to get SEO metrics', 500, error);
        }
    }

    /**
     * Export analytics data
     */
    async exportData(req, res) {
        try {
            const { format = 'json', timeframe = '30d' } = req.query;
            
            // Filter data by timeframe
            const now = new Date();
            const startDate = new Date(now.getTime() - (timeframe === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000);
            
            const filteredData = this.analyticsData.filter(event => 
                new Date(event.timestamp) >= startDate
            );

            if (format === 'csv') {
                const csv = this.convertToCSV(filteredData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-${timeframe}.csv"`);
                res.send(csv);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-${timeframe}.json"`);
                this.sendSuccess(res, filteredData, 'Analytics data exported');
            }
        } catch (error) {
            this.sendError(res, 'Failed to export analytics data', 500, error);
        }
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }
}

module.exports = AnalyticsController;
