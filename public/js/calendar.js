/**
 * DJ Nuff Jamz Calendar System
 * A responsive calendar widget for displaying availability and upcoming gigs
 */

class DJCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        this.events = [];
        this.isLoading = false;
        
        // Sample events for development (will be replaced by API data)
        this.sampleEvents = [
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
                price: 2500,
                isAvailable: false
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
                price: 1800,
                isAvailable: false
            },
            {
                id: '3',
                title: 'Birthday Party - Sweet 16',
                date: '2024-09-28',
                time: '16:00',
                endTime: '21:00',
                type: 'birthday',
                status: 'pending',
                venue: 'Private Residence',
                location: 'Beverly Hills, CA',
                description: 'Sweet 16 birthday celebration',
                price: 1200,
                isAvailable: false
            },
            {
                id: '4',
                title: 'Available for Booking',
                date: '2024-09-14',
                time: '18:00',
                endTime: '23:59',
                type: 'available',
                status: 'available',
                venue: '',
                location: '',
                description: 'Available for private events',
                price: 0,
                isAvailable: true
            },
            {
                id: '5',
                title: 'Available for Booking',
                date: '2024-09-21',
                time: '18:00',
                endTime: '23:59',
                type: 'available',
                status: 'available',
                venue: '',
                location: '',
                description: 'Available for private events',
                price: 0,
                isAvailable: true
            }
        ];
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }

    init() {
        this.createCalendarHTML();
        this.loadEvents();
        this.renderCalendar();
        this.bindEvents();
    }

    createCalendarHTML() {
        const calendarSection = document.getElementById('calendar');
        if (!calendarSection) return;

        calendarSection.innerHTML = `
            <div class="calendar-container">
                <!-- Calendar Header -->
                <div class="calendar-header mb-6">
                    <h2 class="text-2xl font-bold text-center mb-4">Availability Calendar</h2>
                    <p class="text-gray-400 text-center mb-6">Check availability and upcoming gigs</p>
                </div>

                <!-- Calendar Controls -->
                <div class="calendar-controls flex justify-between items-center mb-6">
                    <button id="prevMonth" class="btn-secondary">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <h3 id="currentMonth" class="text-xl font-semibold text-white"></h3>
                    <button id="nextMonth" class="btn-secondary">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>

                <!-- Calendar Grid -->
                <div class="calendar-grid bg-slate-800 rounded-lg p-4 mb-6">
                    <!-- Day Headers -->
                    <div class="calendar-days-header grid grid-cols-7 gap-2 mb-4">
                        ${this.dayNames.map(day => 
                            `<div class="day-header text-center text-sm font-medium text-gray-400 py-2">${day}</div>`
                        ).join('')}
                    </div>
                    
                    <!-- Calendar Days -->
                    <div id="calendarDays" class="calendar-days grid grid-cols-7 gap-2">
                        <!-- Days will be generated by JavaScript -->
                    </div>
                </div>

                <!-- Legend -->
                <div class="calendar-legend grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="legend-item flex items-center">
                        <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span class="text-sm text-gray-300">Available</span>
                    </div>
                    <div class="legend-item flex items-center">
                        <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                        <span class="text-sm text-gray-300">Booked</span>
                    </div>
                    <div class="legend-item flex items-center">
                        <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                        <span class="text-sm text-gray-300">Pending</span>
                    </div>
                    <div class="legend-item flex items-center">
                        <div class="w-4 h-4 bg-gray-600 rounded mr-2"></div>
                        <span class="text-sm text-gray-300">Unavailable</span>
                    </div>
                </div>

                <!-- Upcoming Events -->
                <div class="upcoming-events">
                    <h3 class="text-xl font-semibold mb-4">Upcoming Events</h3>
                    <div id="upcomingEventsList" class="space-y-4">
                        <!-- Events will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Event Details Modal -->
                <div id="eventModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                    <div class="bg-slate-800 rounded-lg max-w-md w-full p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h3 id="eventModalTitle" class="text-xl font-semibold text-white"></h3>
                            <button id="closeEventModal" class="text-gray-400 hover:text-white">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div id="eventModalContent" class="space-y-3">
                            <!-- Event details will be populated by JavaScript -->
                        </div>
                        <div class="mt-6 flex space-x-3">
                            <button id="bookEventBtn" class="btn-primary flex-1 hidden">Book This Date</button>
                            <button id="closeModalBtn" class="btn-secondary flex-1">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadEvents() {
        // In production, this would fetch from Google Calendar API
        // For now, we'll use sample data
        this.events = this.sampleEvents;
        
        // Try to load from backend API as well
        this.loadEventsFromAPI();
    }

    async loadEventsFromAPI() {
        try {
            const response = await fetch('/api/booking');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Convert booking data to calendar events
                    const apiEvents = data.data.map(booking => ({
                        id: booking._id,
                        title: `${booking.eventType} - ${booking.clientName}`,
                        date: booking.eventDate.split('T')[0],
                        time: booking.eventTime || '18:00',
                        endTime: booking.endTime || '23:00',
                        type: booking.eventType,
                        status: booking.status,
                        venue: booking.venue || '',
                        location: booking.location || '',
                        description: booking.specialRequests || '',
                        price: booking.budget || 0,
                        isAvailable: false
                    }));
                    
                    // Merge with sample events
                    this.events = [...this.sampleEvents, ...apiEvents];
                }
            }
        } catch (error) {
            console.log('Could not load events from API, using sample data');
        }
    }

    renderCalendar() {
        const monthElement = document.getElementById('currentMonth');
        const daysElement = document.getElementById('calendarDays');
        
        if (!monthElement || !daysElement) return;

        // Update month display
        monthElement.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;

        // Calculate calendar days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();

        let daysHTML = '';

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            const dateString = this.formatDate(currentDate);
            const dayEvents = this.getEventsForDate(dateString);
            
            let dayClass = 'calendar-day';
            let eventIndicator = '';
            
            // Add classes based on date status
            if (this.isSameDate(currentDate, today)) {
                dayClass += ' today';
            }
            
            if (currentDate < today) {
                dayClass += ' past';
            }

            // Add event indicators
            if (dayEvents.length > 0) {
                const event = dayEvents[0]; // Primary event for the day
                switch (event.status) {
                    case 'available':
                        dayClass += ' available';
                        eventIndicator = '<div class="event-dot bg-green-500"></div>';
                        break;
                    case 'confirmed':
                        dayClass += ' booked';
                        eventIndicator = '<div class="event-dot bg-blue-500"></div>';
                        break;
                    case 'pending':
                        dayClass += ' pending';
                        eventIndicator = '<div class="event-dot bg-yellow-500"></div>';
                        break;
                    default:
                        dayClass += ' unavailable';
                        eventIndicator = '<div class="event-dot bg-gray-600"></div>';
                }
            }

            daysHTML += `
                <div class="${dayClass}" data-date="${dateString}">
                    <span class="day-number">${day}</span>
                    ${eventIndicator}
                </div>
            `;
        }

        daysElement.innerHTML = daysHTML;
        this.renderUpcomingEvents();
    }

    renderUpcomingEvents() {
        const upcomingList = document.getElementById('upcomingEventsList');
        if (!upcomingList) return;

        const today = new Date();
        const upcomingEvents = this.events
            .filter(event => new Date(event.date) >= today && event.status !== 'available')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        if (upcomingEvents.length === 0) {
            upcomingList.innerHTML = '<p class="text-gray-400">No upcoming events scheduled.</p>';
            return;
        }

        upcomingList.innerHTML = upcomingEvents.map(event => `
            <div class="event-card bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors" data-event-id="${event.id}">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-white">${event.title}</h4>
                    <span class="status-badge status-${event.status} text-xs px-2 py-1 rounded">${event.status}</span>
                </div>
                <div class="text-sm text-gray-300 space-y-1">
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        ${this.formatDisplayDate(event.date)} at ${event.time}
                    </div>
                    ${event.venue ? `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            ${event.venue}${event.location ? `, ${event.location}` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Month navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });

        // Day clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-day')) {
                const dayElement = e.target.closest('.calendar-day');
                const dateString = dayElement.dataset.date;
                if (dateString) {
                    this.showEventDetails(dateString);
                }
            }

            if (e.target.closest('.event-card')) {
                const eventCard = e.target.closest('.event-card');
                const eventId = eventCard.dataset.eventId;
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.showEventModal(event);
                }
            }
        });

        // Modal events
        document.getElementById('closeEventModal')?.addEventListener('click', () => {
            this.hideEventModal();
        });

        document.getElementById('closeModalBtn')?.addEventListener('click', () => {
            this.hideEventModal();
        });

        document.getElementById('bookEventBtn')?.addEventListener('click', () => {
            this.handleBooking();
        });

        // Close modal on outside click
        document.getElementById('eventModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.hideEventModal();
            }
        });
    }

    showEventDetails(dateString) {
        const events = this.getEventsForDate(dateString);
        if (events.length > 0) {
            this.showEventModal(events[0]);
        } else {
            // Show availability for booking
            const event = {
                title: 'Available for Booking',
                date: dateString,
                time: 'Flexible',
                type: 'available',
                status: 'available',
                description: 'This date is available for private events. Contact us to book!',
                isAvailable: true
            };
            this.showEventModal(event);
        }
    }

    showEventModal(event) {
        const modal = document.getElementById('eventModal');
        const title = document.getElementById('eventModalTitle');
        const content = document.getElementById('eventModalContent');
        const bookBtn = document.getElementById('bookEventBtn');

        if (!modal || !title || !content || !bookBtn) return;

        title.textContent = event.title;
        
        let contentHTML = `
            <div class="space-y-3">
                <div class="flex items-center text-gray-300">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>${this.formatDisplayDate(event.date)}</span>
                </div>
                
                <div class="flex items-center text-gray-300">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>${event.time}${event.endTime ? ` - ${event.endTime}` : ''}</span>
                </div>
                
                <div class="flex items-center text-gray-300">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span class="status-badge status-${event.status} px-2 py-1 rounded text-xs">${event.status}</span>
                </div>
        `;

        if (event.venue) {
            contentHTML += `
                <div class="flex items-center text-gray-300">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>${event.venue}${event.location ? `, ${event.location}` : ''}</span>
                </div>
            `;
        }

        if (event.description) {
            contentHTML += `
                <div class="mt-4 p-3 bg-slate-700 rounded">
                    <p class="text-gray-300">${event.description}</p>
                </div>
            `;
        }

        contentHTML += '</div>';
        content.innerHTML = contentHTML;

        // Show/hide book button based on availability
        if (event.isAvailable) {
            bookBtn.classList.remove('hidden');
            bookBtn.textContent = 'Book This Date';
        } else {
            bookBtn.classList.add('hidden');
        }

        modal.classList.remove('hidden');
    }

    hideEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleBooking() {
        // Redirect to booking form or show booking modal
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
            this.hideEventModal();
        }
    }

    getEventsForDate(dateString) {
        return this.events.filter(event => event.date === dateString);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatDisplayDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    // Google Calendar API integration methods (to be implemented)
    async setupGoogleCalendarAPI() {
        // This would set up Google Calendar API credentials
        // For now, we'll use local data
        console.log('Google Calendar API setup - using local data for development');
    }

    async fetchGoogleCalendarEvents() {
        // This would fetch events from Google Calendar
        // For now, return sample data
        return this.sampleEvents;
    }

    async syncWithGoogleCalendar(event) {
        // This would sync new bookings with Google Calendar
        console.log('Syncing event with Google Calendar:', event);
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new DJCalendar();
    calendar.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DJCalendar;
}
