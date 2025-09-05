/**
 * DJ Nuff Jamz Analytics & Tracking System
 * Comprehensive analytics tracking for user interactions and conversions
 */

class DJAnalytics {
    constructor() {
        this.isGALoaded = false;
        this.events = [];
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            pageViews: 0,
            events: 0
        };
        
        this.init();
    }

    /**
     * Initialize analytics system
     */
    init() {
        this.setupGoogleAnalytics();
        this.setupEventTracking();
        this.trackPageView();
        this.setupPerformanceTracking();
        this.setupConversionTracking();
    }

    /**
     * Setup Google Analytics 4
     */
    setupGoogleAnalytics() {
        // Check if GA_MEASUREMENT_ID is available
        const measurementId = window.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'; // Placeholder
        
        if (measurementId !== 'G-XXXXXXXXXX') {
            // Load Google Analytics 4
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            
            gtag('js', new Date());
            gtag('config', measurementId, {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                    'custom_parameter_1': 'dj_service_type',
                    'custom_parameter_2': 'event_type'
                }
            });

            this.isGALoaded = true;
            console.log('Google Analytics 4 initialized');
        } else {
            console.log('Google Analytics not configured - using local tracking');
            this.isGALoaded = false;
        }
    }

    /**
     * Setup event tracking for user interactions
     */
    setupEventTracking() {
        // Track booking form interactions
        this.trackFormInteractions();
        
        // Track music player interactions
        this.trackMusicPlayerEvents();
        
        // Track gallery interactions
        this.trackGalleryEvents();
        
        // Track calendar interactions
        this.trackCalendarEvents();
        
        // Track contact form interactions
        this.trackContactFormEvents();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track time on page
        this.trackTimeOnPage();
    }

    /**
     * Track page views
     */
    trackPageView() {
        this.sessionData.pageViews++;
        
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };

        this.trackEvent('page_view', pageData);
    }

    /**
     * Track booking form interactions
     */
    trackFormInteractions() {
        // Track form start
        document.addEventListener('focusin', (e) => {
            if (e.target.closest('#booking-form')) {
                this.trackEvent('form_start', {
                    form_name: 'booking_form',
                    field_name: e.target.name || e.target.id
                });
            }
        });

        // Track form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'booking-form') {
                const formData = new FormData(e.target);
                this.trackEvent('form_submit', {
                    form_name: 'booking_form',
                    event_type: formData.get('eventType'),
                    guest_count: formData.get('guestCount'),
                    budget: formData.get('budget')
                });
            }
        });

        // Track form abandonment
        let formStarted = false;
        document.addEventListener('focusin', (e) => {
            if (e.target.closest('#booking-form') && !formStarted) {
                formStarted = true;
                setTimeout(() => {
                    if (formStarted && !document.querySelector('#booking-form').submitted) {
                        this.trackEvent('form_abandon', {
                            form_name: 'booking_form',
                            time_spent: Date.now() - this.sessionData.startTime
                        });
                    }
                }, 30000); // Track abandonment after 30 seconds
            }
        });
    }

    /**
     * Track music player events
     */
    trackMusicPlayerEvents() {
        document.addEventListener('click', (e) => {
            // Track play/pause
            if (e.target.closest('.play-btn, .pause-btn')) {
                this.trackEvent('music_interaction', {
                    action: 'play_pause',
                    track_title: document.getElementById('current-track-title')?.textContent
                });
            }
            
            // Track track changes
            if (e.target.closest('.next-btn, .prev-btn')) {
                this.trackEvent('music_interaction', {
                    action: 'track_change',
                    direction: e.target.closest('.next-btn') ? 'next' : 'previous'
                });
            }
        });
    }

    /**
     * Track gallery interactions
     */
    trackGalleryEvents() {
        document.addEventListener('click', (e) => {
            // Track gallery image clicks
            if (e.target.closest('.gallery-item')) {
                this.trackEvent('gallery_interaction', {
                    action: 'image_click',
                    image_category: e.target.dataset.category || 'unknown'
                });
            }
            
            // Track filter usage
            if (e.target.closest('.filter-btn')) {
                this.trackEvent('gallery_interaction', {
                    action: 'filter_change',
                    filter: e.target.dataset.filter
                });
            }
        });
    }

    /**
     * Track calendar interactions
     */
    trackCalendarEvents() {
        document.addEventListener('click', (e) => {
            // Track calendar date clicks
            if (e.target.closest('.calendar-day')) {
                this.trackEvent('calendar_interaction', {
                    action: 'date_click',
                    date: e.target.dataset.date,
                    availability: e.target.classList.contains('available') ? 'available' : 'unavailable'
                });
            }
            
            // Track month navigation
            if (e.target.closest('#prevMonth, #nextMonth')) {
                this.trackEvent('calendar_interaction', {
                    action: 'month_navigation',
                    direction: e.target.closest('#nextMonth') ? 'next' : 'previous'
                });
            }
        });
    }

    /**
     * Track contact form events
     */
    trackContactFormEvents() {
        document.addEventListener('submit', (e) => {
            if (e.target.closest('.contact-form')) {
                this.trackEvent('contact_form_submit', {
                    form_type: 'contact'
                });
            }
        });
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !tracked.has(milestone)) {
                        tracked.add(milestone);
                        this.trackEvent('scroll_depth', {
                            percent: milestone,
                            page_path: window.location.pathname
                        });
                    }
                });
            }
        });
    }

    /**
     * Track time on page
     */
    trackTimeOnPage() {
        let startTime = Date.now();
        let isActive = true;

        // Track when user becomes inactive
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isActive = false;
                const timeSpent = Date.now() - startTime;
                this.trackEvent('time_on_page', {
                    duration: Math.round(timeSpent / 1000),
                    page_path: window.location.pathname
                });
            } else {
                isActive = true;
                startTime = Date.now();
            }
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            if (isActive) {
                const timeSpent = Date.now() - startTime;
                this.trackEvent('time_on_page', {
                    duration: Math.round(timeSpent / 1000),
                    page_path: window.location.pathname
                });
            }
        });
    }

    /**
     * Setup conversion tracking
     */
    setupConversionTracking() {
        // Track successful booking submissions
        document.addEventListener('bookingSuccess', (e) => {
            this.trackConversion('booking_completed', {
                event_type: e.detail.eventType,
                value: e.detail.budget || 0,
                currency: 'USD'
            });
        });

        // Track contact form completions
        document.addEventListener('contactSuccess', (e) => {
            this.trackConversion('contact_completed', {
                contact_type: e.detail.type || 'general'
            });
        });

        // Track phone number clicks (call conversions)
        document.addEventListener('click', (e) => {
            if (e.target.closest('a[href^="tel:"]')) {
                this.trackConversion('phone_call', {
                    phone_number: e.target.href.replace('tel:', '')
                });
            }
        });

        // Track email clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('a[href^="mailto:"]')) {
                this.trackConversion('email_click', {
                    email: e.target.href.replace('mailto:', '')
                });
            }
        });
    }

    /**
     * Track performance metrics
     */
    setupPerformanceTracking() {
        // Track Core Web Vitals
        if ('web-vital' in window) {
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS((metric) => this.trackEvent('web_vital', { name: 'CLS', value: metric.value }));
                getFID((metric) => this.trackEvent('web_vital', { name: 'FID', value: metric.value }));
                getFCP((metric) => this.trackEvent('web_vital', { name: 'FCP', value: metric.value }));
                getLCP((metric) => this.trackEvent('web_vital', { name: 'LCP', value: metric.value }));
                getTTFB((metric) => this.trackEvent('web_vital', { name: 'TTFB', value: metric.value }));
            });
        }

        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                this.trackEvent('page_performance', {
                    load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                    first_byte: Math.round(perfData.responseStart - perfData.fetchStart)
                });
            }, 0);
        });
    }

    /**
     * Track custom events
     */
    trackEvent(eventName, parameters = {}) {
        this.sessionData.events++;
        
        const eventData = {
            event_name: eventName,
            timestamp: new Date().toISOString(),
            session_id: this.sessionData.sessionId,
            ...parameters
        };

        // Send to Google Analytics if available
        if (this.isGALoaded && window.gtag) {
            window.gtag('event', eventName, parameters);
        }

        // Store locally for custom analytics
        this.events.push(eventData);
        
        // Send to backend analytics endpoint
        this.sendToBackend(eventData);
        
        console.log('Analytics Event:', eventData);
    }

    /**
     * Track conversions
     */
    trackConversion(conversionName, parameters = {}) {
        const conversionData = {
            conversion_name: conversionName,
            timestamp: new Date().toISOString(),
            session_id: this.sessionData.sessionId,
            ...parameters
        };

        // Send to Google Analytics as conversion
        if (this.isGALoaded && window.gtag) {
            window.gtag('event', 'conversion', {
                send_to: window.GA_MEASUREMENT_ID,
                event_category: 'conversion',
                event_label: conversionName,
                ...parameters
            });
        }

        // Track as regular event too
        this.trackEvent('conversion', conversionData);
    }

    /**
     * Send analytics data to backend
     */
    async sendToBackend(eventData) {
        try {
            // Wait for API config to be available
            if (typeof API === 'undefined') return;

            await API.post(`${API_CONFIG.ENDPOINTS.ANALYTICS}/track`, eventData);
        } catch (error) {
            // Fail silently - analytics shouldn't break the site
            console.log('❌ Analytics backend error:', error.message);
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get analytics summary
     */
    getAnalyticsSummary() {
        return {
            session: this.sessionData,
            totalEvents: this.events.length,
            eventTypes: [...new Set(this.events.map(e => e.event_name))],
            lastEvent: this.events[this.events.length - 1]
        };
    }

    /**
     * Export analytics data
     */
    exportData() {
        return {
            session: this.sessionData,
            events: this.events,
            summary: this.getAnalyticsSummary()
        };
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.djAnalytics = new DJAnalytics();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DJAnalytics;
}
