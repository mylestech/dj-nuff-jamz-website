/**
 * Multi-Step Booking Form Component
 * Handles event booking with progressive form sections
 */

class BookingForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {
            // Event Details
            eventType: '',
            eventDate: '',
            eventLocation: '',
            guestCount: '',
            budget: '',
            
            // Client Information
            name: '',
            email: '',
            phone: '',
            contactMethod: 'email',
            
            // Additional Details
            musicPreferences: '',
            specialRequests: '',
            
            // Internal
            submittedAt: null,
            lastSaved: null
        };
        this.isSubmitting = false;
        this.autoSaveTimer = null;
        this.validationErrors = {};
    }

    /**
     * Initialize the booking form
     */
    init() {
        this.renderForm();
        this.attachEventListeners();
        this.loadSavedData();
        this.setupAutoSave();
    }

    /**
     * Render the complete booking form
     */
    renderForm() {
        const bookingSection = document.getElementById('booking');
        if (!bookingSection) return;

        bookingSection.innerHTML = `
            <div class="container-custom">
                <div class="text-center mb-12">
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
                        Book Your <span class="hero-gradient">Event</span>
                    </h2>
                    <p class="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Tell us about your event and we'll create the perfect musical experience for you.
                    </p>
                    ${this.renderProgressIndicator()}
                </div>

                <div class="max-w-4xl mx-auto">
                    <div class="card bg-slate-800/50 border border-slate-700">
                        <form id="booking-form" class="space-y-8">
                            ${this.renderCurrentStep()}
                            ${this.renderFormNavigation()}
                        </form>
                    </div>
                    
                    ${this.renderAutoSaveIndicator()}
                </div>
            </div>
        `;
    }

    /**
     * Render progress indicator
     */
    renderProgressIndicator() {
        const steps = [
            { number: 1, title: 'Event Details', icon: '📅' },
            { number: 2, title: 'Your Information', icon: '👤' },
            { number: 3, title: 'Preferences', icon: '🎵' },
            { number: 4, title: 'Review & Submit', icon: '✅' }
        ];

        return `
            <div class="flex justify-center mb-8">
                <div class="flex items-center space-x-4 md:space-x-8">
                    ${steps.map((step, index) => `
                        <div class="flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}">
                            <div class="flex flex-col items-center">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-300 ${
                                    step.number === this.currentStep 
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900' 
                                        : step.number < this.currentStep 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-slate-700 text-gray-400'
                                }">
                                    ${step.number < this.currentStep ? '✓' : step.number === this.currentStep ? step.icon : step.number}
                                </div>
                                <span class="text-xs text-center max-w-20 ${
                                    step.number === this.currentStep ? 'text-yellow-400 font-semibold' : 'text-gray-400'
                                }">${step.title}</span>
                            </div>
                            ${index < steps.length - 1 ? `
                                <div class="hidden md:block flex-1 h-0.5 mx-4 ${
                                    step.number < this.currentStep ? 'bg-green-600' : 'bg-slate-700'
                                }"></div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render the current step content
     */
    renderCurrentStep() {
        switch (this.currentStep) {
            case 1: return this.renderEventDetailsStep();
            case 2: return this.renderClientInfoStep();
            case 3: return this.renderPreferencesStep();
            case 4: return this.renderReviewStep();
            default: return this.renderEventDetailsStep();
        }
    }

    /**
     * Step 1: Event Details
     */
    renderEventDetailsStep() {
        return `
            <div class="space-y-6" data-step="1">
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-bold text-gray-100 mb-2">Tell us about your event</h3>
                    <p class="text-gray-400">We'll use this information to provide the best entertainment experience</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Event Type -->
                    <div class="space-y-2">
                        <label for="eventType" class="block text-sm font-medium text-gray-300">
                            Event Type <span class="text-red-400">*</span>
                        </label>
                        <select id="eventType" name="eventType" required 
                                class="form-input ${this.getValidationClass('eventType')}"
                                value="${this.formData.eventType}">
                            <option value="">Select event type</option>
                            <option value="wedding">Wedding</option>
                            <option value="corporate">Corporate Event</option>
                            <option value="private-party">Private Party</option>
                            <option value="birthday">Birthday Party</option>
                            <option value="anniversary">Anniversary</option>
                            <option value="other">Other</option>
                        </select>
                        ${this.renderFieldError('eventType')}
                    </div>

                    <!-- Event Date -->
                    <div class="space-y-2">
                        <label for="eventDate" class="block text-sm font-medium text-gray-300">
                            Event Date <span class="text-red-400">*</span>
                        </label>
                        <input type="date" id="eventDate" name="eventDate" required
                               class="form-input ${this.getValidationClass('eventDate')}"
                               value="${this.formData.eventDate}"
                               min="${this.getTomorrowDate()}">
                        ${this.renderFieldError('eventDate')}
                    </div>

                    <!-- Guest Count -->
                    <div class="space-y-2">
                        <label for="guestCount" class="block text-sm font-medium text-gray-300">
                            Number of Guests <span class="text-red-400">*</span>
                        </label>
                        <select id="guestCount" name="guestCount" required
                                class="form-input ${this.getValidationClass('guestCount')}"
                                value="${this.formData.guestCount}">
                            <option value="">Select guest count</option>
                            <option value="1-25">1-25 people</option>
                            <option value="26-50">26-50 people</option>
                            <option value="51-100">51-100 people</option>
                            <option value="101-200">101-200 people</option>
                            <option value="201-500">201-500 people</option>
                            <option value="500+">500+ people</option>
                        </select>
                        ${this.renderFieldError('guestCount')}
                    </div>

                    <!-- Budget Range -->
                    <div class="space-y-2">
                        <label for="budget" class="block text-sm font-medium text-gray-300">
                            Budget Range
                        </label>
                        <select id="budget" name="budget"
                                class="form-input ${this.getValidationClass('budget')}"
                                value="${this.formData.budget}">
                            <option value="">Select budget range</option>
                            <option value="under-1000">Under $1,000</option>
                            <option value="1000-2500">$1,000 - $2,500</option>
                            <option value="2500-5000">$2,500 - $5,000</option>
                            <option value="5000-10000">$5,000 - $10,000</option>
                            <option value="10000+">$10,000+</option>
                            <option value="discuss">Prefer to discuss</option>
                        </select>
                        ${this.renderFieldError('budget')}
                    </div>
                </div>

                <!-- Event Location -->
                <div class="space-y-2">
                    <label for="eventLocation" class="block text-sm font-medium text-gray-300">
                        Event Location <span class="text-red-400">*</span>
                    </label>
                    <input type="text" id="eventLocation" name="eventLocation" required
                           placeholder="e.g., The Plaza Hotel, 768 5th Ave, New York, NY"
                           class="form-input ${this.getValidationClass('eventLocation')}"
                           value="${this.formData.eventLocation}">
                    <p class="text-sm text-gray-500">Include venue name and full address</p>
                    ${this.renderFieldError('eventLocation')}
                </div>
            </div>
        `;
    }

    /**
     * Step 2: Client Information
     */
    renderClientInfoStep() {
        return `
            <div class="space-y-6" data-step="2">
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-bold text-gray-100 mb-2">Your contact information</h3>
                    <p class="text-gray-400">So we can get back to you with a personalized quote</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Full Name -->
                    <div class="space-y-2">
                        <label for="name" class="block text-sm font-medium text-gray-300">
                            Full Name <span class="text-red-400">*</span>
                        </label>
                        <input type="text" id="name" name="name" required
                               placeholder="Your full name"
                               class="form-input ${this.getValidationClass('name')}"
                               value="${this.formData.name}">
                        ${this.renderFieldError('name')}
                    </div>

                    <!-- Email -->
                    <div class="space-y-2">
                        <label for="email" class="block text-sm font-medium text-gray-300">
                            Email Address <span class="text-red-400">*</span>
                        </label>
                        <input type="email" id="email" name="email" required
                               placeholder="your.email@example.com"
                               class="form-input ${this.getValidationClass('email')}"
                               value="${this.formData.email}">
                        ${this.renderFieldError('email')}
                    </div>

                    <!-- Phone -->
                    <div class="space-y-2">
                        <label for="phone" class="block text-sm font-medium text-gray-300">
                            Phone Number <span class="text-red-400">*</span>
                        </label>
                        <input type="tel" id="phone" name="phone" required
                               placeholder="(555) 123-4567"
                               class="form-input ${this.getValidationClass('phone')}"
                               value="${this.formData.phone}">
                        ${this.renderFieldError('phone')}
                    </div>

                    <!-- Preferred Contact Method -->
                    <div class="space-y-2">
                        <label for="contactMethod" class="block text-sm font-medium text-gray-300">
                            Preferred Contact Method
                        </label>
                        <select id="contactMethod" name="contactMethod"
                                class="form-input ${this.getValidationClass('contactMethod')}"
                                value="${this.formData.contactMethod}">
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="both">Both</option>
                        </select>
                        ${this.renderFieldError('contactMethod')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Step 3: Music Preferences
     */
    renderPreferencesStep() {
        return `
            <div class="space-y-6" data-step="3">
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-bold text-gray-100 mb-2">Tell us about your music style</h3>
                    <p class="text-gray-400">This helps us create the perfect playlist for your event</p>
                </div>

                <!-- Music Preferences -->
                <div class="space-y-2">
                    <label for="musicPreferences" class="block text-sm font-medium text-gray-300">
                        Music Preferences
                    </label>
                    <textarea id="musicPreferences" name="musicPreferences" rows="4"
                              placeholder="e.g., Love Afrobeats and modern hip-hop, some classic R&B for dinner, high energy dancehall for dancing..."
                              class="form-input resize-none ${this.getValidationClass('musicPreferences')}">${this.formData.musicPreferences}</textarea>
                    <p class="text-sm text-gray-500">Tell us about genres you love, specific artists, or the vibe you're going for</p>
                    ${this.renderFieldError('musicPreferences')}
                </div>

                <!-- Special Requests -->
                <div class="space-y-2">
                    <label for="specialRequests" class="block text-sm font-medium text-gray-300">
                        Special Requests & Additional Notes
                    </label>
                    <textarea id="specialRequests" name="specialRequests" rows="4"
                              placeholder="e.g., Need wireless microphone for speeches, fog machine for first dance, specific songs for special moments, cultural music requirements..."
                              class="form-input resize-none ${this.getValidationClass('specialRequests')}">${this.formData.specialRequests}</textarea>
                    <p class="text-sm text-gray-500">Equipment needs, special moments, cultural requirements, or anything else we should know</p>
                    ${this.renderFieldError('specialRequests')}
                </div>

                <!-- Music Style Suggestions -->
                <div class="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                    <h4 class="text-lg font-semibold text-gray-100 mb-4">Our Specialties</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-2xl mb-2">🎵</div>
                            <span class="text-sm text-gray-300">Afrobeats</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">🎤</div>
                            <span class="text-sm text-gray-300">Hip-Hop</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">💃</div>
                            <span class="text-sm text-gray-300">R&B</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">🌴</div>
                            <span class="text-sm text-gray-300">Reggae</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">💑</div>
                            <span class="text-sm text-gray-300">Love Songs</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">🎉</div>
                            <span class="text-sm text-gray-300">Pop Hits</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">🏢</div>
                            <span class="text-sm text-gray-300">Corporate</span>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl mb-2">🌍</div>
                            <span class="text-sm text-gray-300">World Music</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Step 4: Review & Submit
     */
    renderReviewStep() {
        return `
            <div class="space-y-8" data-step="4">
                <div class="text-center mb-8">
                    <h3 class="text-2xl font-bold text-gray-100 mb-2">Review your booking request</h3>
                    <p class="text-gray-400">Please review all details before submitting</p>
                </div>

                <div class="space-y-6">
                    <!-- Event Details Review -->
                    <div class="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                        <h4 class="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                            📅 Event Details
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-gray-400">Event Type:</span>
                                <span class="text-gray-100 ml-2">${this.getEventTypeLabel(this.formData.eventType)}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Date:</span>
                                <span class="text-gray-100 ml-2">${this.formatDate(this.formData.eventDate)}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Guests:</span>
                                <span class="text-gray-100 ml-2">${this.formData.guestCount}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Budget:</span>
                                <span class="text-gray-100 ml-2">${this.getBudgetLabel(this.formData.budget)}</span>
                            </div>
                            <div class="md:col-span-2">
                                <span class="text-gray-400">Location:</span>
                                <span class="text-gray-100 ml-2">${this.formData.eventLocation}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Info Review -->
                    <div class="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                        <h4 class="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                            👤 Contact Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-gray-400">Name:</span>
                                <span class="text-gray-100 ml-2">${this.formData.name}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Email:</span>
                                <span class="text-gray-100 ml-2">${this.formData.email}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Phone:</span>
                                <span class="text-gray-100 ml-2">${this.formData.phone}</span>
                            </div>
                            <div>
                                <span class="text-gray-400">Contact Method:</span>
                                <span class="text-gray-100 ml-2">${this.formData.contactMethod}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Preferences Review -->
                    <div class="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                        <h4 class="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                            🎵 Music & Preferences
                        </h4>
                        <div class="space-y-3 text-sm">
                            ${this.formData.musicPreferences ? `
                                <div>
                                    <span class="text-gray-400 block mb-1">Music Preferences:</span>
                                    <p class="text-gray-100 leading-relaxed">${this.formData.musicPreferences}</p>
                                </div>
                            ` : ''}
                            ${this.formData.specialRequests ? `
                                <div>
                                    <span class="text-gray-400 block mb-1">Special Requests:</span>
                                    <p class="text-gray-100 leading-relaxed">${this.formData.specialRequests}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Submission Notice -->
                    <div class="bg-blue-600/20 border border-blue-500/30 rounded-lg p-6">
                        <div class="flex items-start space-x-3">
                            <div class="text-blue-400 text-xl">ℹ️</div>
                            <div class="flex-1">
                                <h5 class="text-blue-300 font-semibold mb-2">What happens next?</h5>
                                <ul class="text-blue-100 text-sm space-y-1">
                                    <li>• We'll review your event details within 24 hours</li>
                                    <li>• You'll receive a personalized quote via ${this.formData.contactMethod}</li>
                                    <li>• We'll schedule a call to discuss your vision in detail</li>
                                    <li>• Once confirmed, we'll send a contract and secure your date</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render form navigation buttons
     */
    renderFormNavigation() {
        const isFirstStep = this.currentStep === 1;
        const isLastStep = this.currentStep === this.totalSteps;
        
        return `
            <div class="flex justify-between items-center pt-8 border-t border-slate-700">
                <button type="button" id="prev-step" 
                        class="btn-secondary ${isFirstStep ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${isFirstStep ? 'disabled' : ''}>
                    ← Previous
                </button>
                
                <div class="text-sm text-gray-400">
                    Step ${this.currentStep} of ${this.totalSteps}
                </div>
                
                <button type="button" id="next-step" 
                        class="btn-accent ${this.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${this.isSubmitting ? 'disabled' : ''}>
                    ${isLastStep ? (this.isSubmitting ? 'Submitting...' : 'Submit Request') : 'Next →'}
                </button>
            </div>
        `;
    }

    /**
     * Render auto-save indicator
     */
    renderAutoSaveIndicator() {
        return `
            <div class="text-center mt-6">
                <div id="autosave-indicator" class="inline-flex items-center text-sm text-gray-500">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Form auto-saved</span>
                </div>
            </div>
        `;
    }

    // Utility methods for rendering
    getValidationClass(field) {
        return this.validationErrors[field] ? 'border-red-500' : '';
    }

    renderFieldError(field) {
        return this.validationErrors[field] ? 
            `<p class="text-red-400 text-sm mt-1">${this.validationErrors[field]}</p>` : '';
    }

    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    getEventTypeLabel(value) {
        const labels = {
            'wedding': 'Wedding',
            'corporate': 'Corporate Event',
            'private-party': 'Private Party',
            'birthday': 'Birthday Party',
            'anniversary': 'Anniversary',
            'other': 'Other'
        };
        return labels[value] || value;
    }

    getBudgetLabel(value) {
        const labels = {
            'under-1000': 'Under $1,000',
            '1000-2500': '$1,000 - $2,500',
            '2500-5000': '$2,500 - $5,000',
            '5000-10000': '$5,000 - $10,000',
            '10000+': '$10,000+',
            'discuss': 'Prefer to discuss'
        };
        return labels[value] || value;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    /**
     * Attach event listeners for form navigation and input handling
     */
    attachEventListeners() {
        // Navigation buttons
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNextStep();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePrevStep();
            });
        }

        // Form input listeners for auto-save
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('input', (e) => {
                this.handleInputChange(e);
                this.clearFieldError(e.target.name);
            });
            
            form.addEventListener('change', (e) => {
                this.handleInputChange(e);
                this.scheduleAutoSave();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.closest('#booking-form')) {
                e.preventDefault();
                this.handleNextStep();
            }
            
            if (e.key === 'Escape') {
                this.clearValidationErrors();
            }
        });
    }

    /**
     * Handle input changes and update form data
     */
    handleInputChange(event) {
        const { name, value } = event.target;
        if (name && this.formData.hasOwnProperty(name)) {
            this.formData[name] = value;
        }
    }

    /**
     * Handle next step navigation
     */
    async handleNextStep() {
        if (this.isSubmitting) return;

        // Validate current step
        const isValid = this.validateCurrentStep();
        if (!isValid) {
            this.showValidationErrors();
            return;
        }

        // Save current step data
        this.saveCurrentStepData();

        if (this.currentStep === this.totalSteps) {
            // Submit form
            await this.submitForm();
        } else {
            // Move to next step
            this.nextStep();
        }
    }

    /**
     * Handle previous step navigation
     */
    handlePrevStep() {
        if (this.currentStep > 1) {
            this.prevStep();
        }
    }
    /**
     * Move to next step
     */
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.renderForm();
            this.attachEventListeners();
            this.restoreFormData();
            this.scrollToForm();
            this.trackStepChange();
        }
    }

    /**
     * Move to previous step
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderForm();
            this.attachEventListeners();
            this.restoreFormData();
            this.scrollToForm();
            this.trackStepChange();
        }
    }

    /**
     * Save current step form data
     */
    saveCurrentStepData() {
        const form = document.getElementById('booking-form');
        if (!form) return;

        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
            if (this.formData.hasOwnProperty(key)) {
                this.formData[key] = value;
            }
        }
    }

    /**
     * Restore form data to current step inputs
     */
    restoreFormData() {
        const form = document.getElementById('booking-form');
        if (!form) return;

        Object.keys(this.formData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && this.formData[key]) {
                input.value = this.formData[key];
            }
        });
    }

    /**
     * Validate current step
     */
    validateCurrentStep() {
        this.validationErrors = {};
        let isValid = true;

        switch (this.currentStep) {
            case 1:
                isValid = this.validateEventDetails();
                break;
            case 2:
                isValid = this.validateClientInfo();
                break;
            case 3:
                isValid = this.validatePreferences();
                break;
            case 4:
                isValid = this.validateReview();
                break;
        }

        return isValid;
    }

    /**
     * Validate event details (Step 1)
     */
    validateEventDetails() {
        let isValid = true;

        // Event Type
        if (!this.formData.eventType) {
            this.validationErrors.eventType = 'Please select an event type';
            isValid = false;
        }

        // Event Date
        if (!this.formData.eventDate) {
            this.validationErrors.eventDate = 'Please select an event date';
            isValid = false;
        } else {
            const eventDate = new Date(this.formData.eventDate);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (eventDate < tomorrow) {
                this.validationErrors.eventDate = 'Event date must be at least tomorrow';
                isValid = false;
            }
        }

        // Guest Count
        if (!this.formData.guestCount) {
            this.validationErrors.guestCount = 'Please select the number of guests';
            isValid = false;
        }

        // Event Location
        if (!this.formData.eventLocation || this.formData.eventLocation.trim().length < 10) {
            this.validationErrors.eventLocation = 'Please provide a detailed event location';
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate client information (Step 2)
     */
    validateClientInfo() {
        let isValid = true;

        // Name
        if (!this.formData.name || this.formData.name.trim().length < 2) {
            this.validationErrors.name = 'Please enter your full name';
            isValid = false;
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.formData.email || !emailRegex.test(this.formData.email)) {
            this.validationErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Phone
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = this.formData.phone ? this.formData.phone.replace(/\D/g, '') : '';
        if (!this.formData.phone || cleanPhone.length < 10) {
            this.validationErrors.phone = 'Please enter a valid phone number';
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate preferences (Step 3)
     */
    validatePreferences() {
        // Step 3 is optional, so always valid
        return true;
    }

    /**
     * Validate review (Step 4)
     */
    validateReview() {
        // Re-validate all previous steps
        return this.validateEventDetails() && this.validateClientInfo();
    }
    /**
     * Show validation errors
     */
    showValidationErrors() {
        // Re-render form to show errors
        this.renderForm();
        this.attachEventListeners();
        this.restoreFormData();

        // Focus on first error field
        const firstErrorField = Object.keys(this.validationErrors)[0];
        if (firstErrorField) {
            const field = document.querySelector(`[name="${firstErrorField}"]`);
            if (field) {
                field.focus();
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldName) {
        if (this.validationErrors[fieldName]) {
            delete this.validationErrors[fieldName];
        }
    }

    /**
     * Clear all validation errors
     */
    clearValidationErrors() {
        this.validationErrors = {};
    }

    /**
     * Scroll to form for better UX
     */
    scrollToForm() {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    /**
     * Track step changes for analytics
     */
    trackStepChange() {
        // Analytics tracking (will be implemented in step 9.10)
        if (window.va) {
            window.va('track', 'Booking Form Step', {
                step: this.currentStep,
                stepName: this.getStepName(this.currentStep)
            });
        }
    }

    /**
     * Get step name for analytics
     */
    getStepName(step) {
        const names = {
            1: 'Event Details',
            2: 'Client Information',
            3: 'Preferences',
            4: 'Review & Submit'
        };
        return names[step] || `Step ${step}`;
    }

    /**
     * Auto-save functionality
     */
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.autoSaveFormData();
        }, 2000); // Save after 2 seconds of inactivity
    }

    loadSavedData() { 
        // Load data from localStorage
        const savedData = localStorage.getItem('dj-booking-form');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.formData = { ...this.formData, ...parsed };
            } catch (e) {
                console.warn('Failed to load saved form data:', e);
            }
        }
    }
    
    autoSaveFormData() { 
        // Save to localStorage
        try {
            localStorage.setItem('dj-booking-form', JSON.stringify(this.formData));
            this.showAutoSaveIndicator('saved');
        } catch (e) {
            console.warn('Failed to auto-save form data:', e);
            this.showAutoSaveIndicator('error');
        }
    }
    
    showAutoSaveIndicator(status) {
        const indicator = document.getElementById('autosave-indicator');
        if (indicator) {
            indicator.className = `inline-flex items-center text-sm autosave-indicator ${status}`;
            indicator.innerHTML = `
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${status === 'saved' ? 
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
                        status === 'saving' ?
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>' :
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01"></path>'
                    }
                </svg>
                <span>${status === 'saved' ? 'Form auto-saved' : status === 'saving' ? 'Saving...' : 'Save failed'}</span>
            `;
        }
    }
    
    setupAutoSave() {
        // Setup auto-save functionality
        this.loadSavedData();
    }
    
    async submitForm() { 
        // Form submission (will be implemented in step 9.8)
        this.isSubmitting = true;
        
        try {
            // Update UI to show submitting state
            this.renderForm();
            this.attachEventListeners();
            
            // Prepare form data
            const submissionData = {
                ...this.formData,
                submittedAt: new Date().toISOString()
            };
            
            // Submit to backend API
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showSuccessMessage(result);
                this.clearSavedData();
            } else {
                throw new Error('Failed to submit booking request');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(error.message);
        } finally {
            this.isSubmitting = false;
        }
    }
    
    showSuccessMessage(result) {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.innerHTML = `
                <div class="container-custom">
                    <div class="max-w-2xl mx-auto text-center">
                        <div class="bg-green-600/20 border border-green-500/30 rounded-lg p-8">
                            <div class="text-6xl mb-4">✅</div>
                            <h2 class="text-3xl font-bold text-green-400 mb-4">Booking Request Submitted!</h2>
                            <p class="text-lg text-gray-300 mb-6">
                                Thank you ${this.formData.name}! We've received your booking request for ${this.formatDate(this.formData.eventDate)}.
                            </p>
                            <div class="bg-slate-700/30 rounded-lg p-6 mb-6">
                                <h3 class="text-lg font-semibold text-gray-100 mb-3">What happens next:</h3>
                                <ul class="text-left text-gray-300 space-y-2">
                                    <li>• We'll review your request within 24 hours</li>
                                    <li>• You'll receive a personalized quote via ${this.formData.contactMethod}</li>
                                    <li>• We'll schedule a call to discuss your vision</li>
                                    <li>• Once confirmed, we'll secure your date with a contract</li>
                                </ul>
                            </div>
                            <a href="#contact" class="btn-accent">Contact Us Directly</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    showErrorMessage(error) {
        // Show error message
        alert('Sorry, there was an error submitting your booking request. Please try again or contact us directly.');
    }
    
    clearSavedData() {
        localStorage.removeItem('dj-booking-form');
    }
}

// Export for use
window.BookingForm = BookingForm;
