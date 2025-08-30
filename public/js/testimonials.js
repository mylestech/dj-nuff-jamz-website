/**
 * DJ Nuff Jamz Testimonials Component
 * Animated testimonials display with scrolling effects
 */

class TestimonialsComponent {
    constructor() {
        this.testimonials = [];
        this.currentIndex = 0;
        this.isPlaying = true;
        this.animationSpeed = 5000; // 5 seconds per testimonial
        this.intervalId = null;
        this.container = null;
        this.initialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        } catch (error) {
            console.error('Failed to initialize testimonials:', error);
        }
    }

    async setup() {
        try {
            // Find testimonials container
            this.container = document.getElementById('testimonials-container');
            if (!this.container) {
                console.warn('Testimonials container not found');
                return;
            }

            // Load testimonials data
            await this.loadTestimonials();
            
            // Create testimonials UI
            this.createTestimonialsUI();
            
            // Start animation
            this.startAnimation();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('Testimonials component initialized successfully');
        } catch (error) {
            console.error('Failed to setup testimonials:', error);
            this.loadFallbackTestimonials();
        }
    }

    async loadTestimonials() {
        try {
            const response = await fetch('/api/testimonials/featured?limit=8');
            if (response.ok) {
                const data = await response.json();
                this.testimonials = data.data || [];
            } else {
                throw new Error('Failed to fetch testimonials');
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            this.loadFallbackTestimonials();
        }

        // Ensure we have at least some testimonials
        if (this.testimonials.length === 0) {
            this.loadFallbackTestimonials();
        }
    }

    loadFallbackTestimonials() {
        this.testimonials = [
            {
                _id: '1',
                clientName: 'Adebayo Industries',
                clientTitle: 'CEO',
                companyName: 'Adebayo Corp',
                testimonial: 'DJ Nuff Jamz made our corporate event absolutely amazing! The music selection was perfect and kept everyone dancing all night. Professional service from start to finish.',
                rating: 5,
                eventType: 'corporate',
                displayLocation: 'Lagos, Nigeria',
                clientLogo: '/images/clients/adebayo-logo.png'
            },
            {
                _id: '2',
                clientName: 'Kemi & Tunde',
                clientTitle: 'Newlyweds',
                testimonial: 'Our wedding was perfect thanks to DJ Nuff Jamz. He understood exactly what we wanted and delivered beyond our expectations. Every guest was on the dance floor!',
                rating: 5,
                eventType: 'wedding',
                displayLocation: 'Abuja, Nigeria'
            },
            {
                _id: '3',
                clientName: 'Lagos Business Summit',
                clientTitle: 'Event Coordinator',
                companyName: 'LBS Events',
                testimonial: 'Professional, punctual, and absolutely fantastic! DJ Nuff Jamz brought the perfect energy to our business summit after-party. Highly recommended!',
                rating: 5,
                eventType: 'corporate',
                displayLocation: 'Lagos, Nigeria',
                clientLogo: '/images/clients/lbs-logo.png'
            },
            {
                _id: '4',
                clientName: 'Funmi Okafor',
                clientTitle: 'Birthday Celebrant',
                testimonial: 'My 30th birthday party was unforgettable! DJ Nuff Jamz played all my favorite Afrobeats and had everyone dancing. The best DJ in Lagos!',
                rating: 5,
                eventType: 'private_party',
                displayLocation: 'Lagos, Nigeria'
            }
        ];
    }

    createTestimonialsUI() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="testimonials-wrapper">
                <div class="testimonials-header text-center mb-12">
                    <h2 class="text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
                    <p class="text-xl text-gray-300">Real experiences from real events across Nigeria</p>
                </div>
                
                <div class="testimonials-carousel-container relative">
                    <div class="testimonials-carousel" id="testimonials-carousel">
                        ${this.testimonials.map((testimonial, index) => this.createTestimonialCard(testimonial, index)).join('')}
                    </div>
                    
                    <div class="testimonials-controls flex justify-center items-center mt-8 space-x-4">
                        <button id="testimonials-prev" class="control-btn bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        
                        <button id="testimonials-play-pause" class="control-btn bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors duration-200">
                            <svg class="w-6 h-6 play-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6l5-3-5-3z"></path>
                            </svg>
                            <svg class="w-6 h-6 pause-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path>
                            </svg>
                        </button>
                        
                        <button id="testimonials-next" class="control-btn bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="testimonials-indicators flex justify-center mt-6 space-x-2" id="testimonials-indicators">
                        ${this.testimonials.map((_, index) => `
                            <button class="indicator w-3 h-3 rounded-full transition-all duration-200 ${index === 0 ? 'bg-blue-600' : 'bg-gray-600'}" 
                                    data-index="${index}"></button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="testimonials-stats mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div class="stat-item">
                        <div class="text-3xl font-bold text-blue-400 mb-2">${this.testimonials.length}+</div>
                        <div class="text-gray-300">Happy Clients</div>
                    </div>
                    <div class="stat-item">
                        <div class="text-3xl font-bold text-green-400 mb-2">5.0</div>
                        <div class="text-gray-300">Average Rating</div>
                    </div>
                    <div class="stat-item">
                        <div class="text-3xl font-bold text-purple-400 mb-2">100%</div>
                        <div class="text-gray-300">Satisfaction Rate</div>
                    </div>
                </div>
            </div>
        `;

        // Add CSS for animations
        this.addTestimonialStyles();
    }

    createTestimonialCard(testimonial, index) {
        const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
        const isActive = index === this.currentIndex;
        
        return `
            <div class="testimonial-card ${isActive ? 'active' : ''}" data-index="${index}">
                <div class="testimonial-content bg-slate-800 rounded-lg p-8 mx-4 shadow-xl border border-slate-700 hover:border-blue-500 transition-all duration-300">
                    <div class="testimonial-header flex items-center mb-6">
                        ${testimonial.clientLogo ? `
                            <img src="${testimonial.clientLogo}" alt="${testimonial.companyName || testimonial.clientName}" 
                                 class="client-logo w-12 h-12 rounded-full mr-4 object-cover"
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="client-info">
                            <h4 class="client-name text-lg font-semibold text-white">${testimonial.clientName}</h4>
                            <p class="client-title text-sm text-gray-400">
                                ${testimonial.clientTitle}${testimonial.companyName ? ` • ${testimonial.companyName}` : ''}
                            </p>
                            <p class="client-location text-xs text-gray-500">${testimonial.displayLocation}</p>
                        </div>
                    </div>
                    
                    <div class="testimonial-text mb-6">
                        <p class="text-gray-300 text-lg leading-relaxed italic">
                            "${testimonial.testimonial}"
                        </p>
                    </div>
                    
                    <div class="testimonial-footer flex justify-between items-center">
                        <div class="rating text-yellow-400 text-xl">
                            ${stars}
                        </div>
                        <div class="event-type">
                            <span class="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                                ${this.formatEventType(testimonial.eventType)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatEventType(eventType) {
        const types = {
            'wedding': 'Wedding',
            'corporate': 'Corporate Event',
            'private_party': 'Private Party',
            'club': 'Club Event',
            'festival': 'Festival',
            'other': 'Special Event'
        };
        return types[eventType] || 'Event';
    }

    addTestimonialStyles() {
        if (document.getElementById('testimonials-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'testimonials-styles';
        styles.textContent = `
            .testimonials-carousel-container {
                overflow: hidden;
                position: relative;
            }
            
            .testimonials-carousel {
                display: flex;
                transition: transform 0.5s ease-in-out;
                will-change: transform;
            }
            
            .testimonial-card {
                min-width: 100%;
                opacity: 0.7;
                transform: scale(0.95);
                transition: all 0.5s ease-in-out;
            }
            
            .testimonial-card.active {
                opacity: 1;
                transform: scale(1);
            }
            
            .testimonial-content {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }
            
            .testimonial-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .testimonial-card.active .testimonial-content::before {
                opacity: 1;
            }
            
            .client-logo {
                border: 2px solid #3b82f6;
                transition: transform 0.3s ease;
            }
            
            .testimonial-card.active .client-logo {
                transform: scale(1.1);
            }
            
            .control-btn {
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .control-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            
            .indicator {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .indicator:hover {
                transform: scale(1.2);
            }
            
            .stat-item {
                animation: fadeInUp 0.6s ease-out;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            .testimonial-card.active .testimonial-content {
                animation: pulse 2s ease-in-out infinite;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .testimonials-header h2 {
                    font-size: 2rem;
                }
                
                .testimonials-header p {
                    font-size: 1rem;
                }
                
                .testimonial-content {
                    padding: 1.5rem;
                    margin: 0 0.5rem;
                }
                
                .testimonials-stats {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
            }
            
            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .testimonials-carousel,
                .testimonial-card,
                .control-btn,
                .indicator {
                    transition: none;
                }
                
                .testimonial-card.active .testimonial-content {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    setupEventListeners() {
        // Control buttons
        const prevBtn = document.getElementById('testimonials-prev');
        const nextBtn = document.getElementById('testimonials-next');
        const playPauseBtn = document.getElementById('testimonials-play-pause');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousTestimonial());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextTestimonial());
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToTestimonial(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.initialized) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousTestimonial();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextTestimonial();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
            }
        });
        
        // Pause on hover
        const carousel = document.getElementById('testimonials-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => {
                if (this.isPlaying) {
                    this.pauseAnimation();
                }
            });
            
            carousel.addEventListener('mouseleave', () => {
                if (this.isPlaying) {
                    this.startAnimation();
                }
            });
        }
        
        // Touch/swipe support for mobile
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const carousel = document.getElementById('testimonials-carousel');
        if (!carousel) return;
        
        let startX = 0;
        let endX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            const threshold = 50; // Minimum swipe distance
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextTestimonial();
                } else {
                    this.previousTestimonial();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }

    startAnimation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.nextTestimonial();
        }, this.animationSpeed);
    }

    pauseAnimation() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    togglePlayPause() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            this.isPlaying = false;
            this.pauseAnimation();
            if (playIcon) playIcon.classList.remove('hidden');
            if (pauseIcon) pauseIcon.classList.add('hidden');
        } else {
            this.isPlaying = true;
            this.startAnimation();
            if (playIcon) playIcon.classList.add('hidden');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
        }
    }

    nextTestimonial() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.updateCarousel();
    }

    previousTestimonial() {
        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.updateCarousel();
    }

    goToTestimonial(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const carousel = document.getElementById('testimonials-carousel');
        const indicators = document.querySelectorAll('.indicator');
        const cards = document.querySelectorAll('.testimonial-card');
        
        if (carousel) {
            carousel.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
        
        // Update active states
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === this.currentIndex);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('bg-blue-600', index === this.currentIndex);
            indicator.classList.toggle('bg-gray-600', index !== this.currentIndex);
        });
    }

    // Public methods for external control
    play() {
        if (!this.isPlaying) {
            this.togglePlayPause();
        }
    }

    pause() {
        if (this.isPlaying) {
            this.togglePlayPause();
        }
    }

    destroy() {
        this.pauseAnimation();
        this.initialized = false;
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        
        // Remove styles
        const styles = document.getElementById('testimonials-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('Testimonials component destroyed');
    }
}

// Auto-initialize when DOM is ready
let testimonialsComponent;
document.addEventListener('DOMContentLoaded', () => {
    testimonialsComponent = new TestimonialsComponent();
});

// Export for manual initialization if needed
window.TestimonialsComponent = TestimonialsComponent;
