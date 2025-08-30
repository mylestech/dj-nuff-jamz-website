const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    constructor() {
        this.isConfigured = false;
        this.templates = new Map();
        this.setupSendGrid();
        this.loadEmailTemplates();
    }

    /**
     * Initialize SendGrid configuration
     */
    setupSendGrid() {
        try {
            const apiKey = process.env.SENDGRID_API_KEY;
            if (apiKey) {
                sgMail.setApiKey(apiKey);
                this.isConfigured = true;
                console.log('SendGrid API configured successfully');
            } else {
                console.log('SendGrid API key not found, email service will use mock mode');
                this.isConfigured = false;
            }
        } catch (error) {
            console.error('Failed to configure SendGrid:', error.message);
            this.isConfigured = false;
        }
    }

    /**
     * Load email templates from files
     */
    async loadEmailTemplates() {
        try {
            const templatesDir = path.join(__dirname, '../templates/email');
            
            // Create templates directory if it doesn't exist
            try {
                await fs.mkdir(templatesDir, { recursive: true });
            } catch (error) {
                // Directory might already exist
            }

            // Load existing templates or create default ones
            await this.createDefaultTemplates();
        } catch (error) {
            console.error('Failed to load email templates:', error.message);
        }
    }

    /**
     * Create default email templates
     */
    async createDefaultTemplates() {
        const templates = {
            'booking-confirmation': {
                subject: 'Booking Confirmation - DJ Nuff Jamz Entertainment',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">DJ Nuff Jamz Entertainment</h1>
                            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your Booking is Confirmed!</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d3748; margin-top: 0;">Hi {{clientName}},</h2>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                Thank you for booking DJ Nuff Jamz Entertainment for your upcoming event! 
                                We're excited to make your {{eventType}} unforgettable.
                            </p>
                            
                            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #2d3748; margin-top: 0;">Event Details:</h3>
                                <ul style="color: #4a5568; line-height: 1.8;">
                                    <li><strong>Event Type:</strong> {{eventType}}</li>
                                    <li><strong>Date:</strong> {{eventDate}}</li>
                                    <li><strong>Time:</strong> {{eventTime}}</li>
                                    <li><strong>Venue:</strong> {{venue}}</li>
                                    <li><strong>Location:</strong> {{location}}</li>
                                    <li><strong>Guest Count:</strong> {{guestCount}}</li>
                                    <li><strong>Budget:</strong> ${{budget}}</li>
                                </ul>
                            </div>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                <strong>What's Next:</strong><br>
                                • We'll contact you 1 week before the event to confirm final details<br>
                                • Our team will arrive 30 minutes early for setup<br>
                                • We'll bring professional sound equipment and lighting<br>
                                • Music requests can be submitted up to 24 hours before the event
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="mailto:{{businessEmail}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Contact Us</a>
                            </div>
                            
                            <p style="color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                                Questions? Reply to this email or call us at (555) 123-4567<br>
                                DJ Nuff Jamz Entertainment - Making Every Event Memorable
                            </p>
                        </div>
                    </div>
                `,
                text: `
                    DJ Nuff Jamz Entertainment - Booking Confirmation
                    
                    Hi {{clientName}},
                    
                    Thank you for booking DJ Nuff Jamz Entertainment for your {{eventType}}!
                    
                    Event Details:
                    - Event Type: {{eventType}}
                    - Date: {{eventDate}}
                    - Time: {{eventTime}}
                    - Venue: {{venue}}
                    - Location: {{location}}
                    - Guest Count: {{guestCount}}
                    - Budget: ${{budget}}
                    
                    We'll contact you 1 week before the event to confirm final details.
                    
                    Questions? Reply to this email or call (555) 123-4567
                    
                    DJ Nuff Jamz Entertainment
                `
            },
            'booking-reminder': {
                subject: 'Event Reminder - DJ Nuff Jamz Entertainment ({{eventDate}})',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">Event Reminder</h1>
                            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your event is coming up!</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d3748; margin-top: 0;">Hi {{clientName}},</h2>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                Just a friendly reminder that your {{eventType}} with DJ Nuff Jamz Entertainment 
                                is coming up on <strong>{{eventDate}}</strong>!
                            </p>
                            
                            <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
                                <h3 style="color: #2d3748; margin-top: 0;">Final Checklist:</h3>
                                <ul style="color: #4a5568; line-height: 1.8;">
                                    <li>✓ Venue access confirmed</li>
                                    <li>✓ Sound equipment ready</li>
                                    <li>✓ Playlist prepared</li>
                                    <li>? Any last-minute music requests?</li>
                                    <li>? Special announcements needed?</li>
                                </ul>
                            </div>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                We'll arrive 30 minutes early for setup. If you have any last-minute requests 
                                or changes, please let us know as soon as possible.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="tel:+15551234567" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-right: 10px;">Call Us</a>
                                <a href="mailto:{{businessEmail}}" style="background: transparent; color: #48bb78; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 2px solid #48bb78;">Email Us</a>
                            </div>
                        </div>
                    </div>
                `
            },
            'follow-up': {
                subject: 'Thank You! How Was Your Event? - DJ Nuff Jamz',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
                            <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">We hope you had an amazing event</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d3748; margin-top: 0;">Hi {{clientName}},</h2>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                Thank you for choosing DJ Nuff Jamz Entertainment for your {{eventType}}! 
                                We had a fantastic time celebrating with you and your guests.
                            </p>
                            
                            <div style="background: #fffaf0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ed8936;">
                                <h3 style="color: #2d3748; margin-top: 0;">We'd Love Your Feedback!</h3>
                                <p style="color: #4a5568; line-height: 1.6; margin-bottom: 15px;">
                                    Your feedback helps us improve our service and helps future clients make their decision.
                                </p>
                                <div style="text-align: center;">
                                    <a href="#" style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 0 5px;">Leave a Review</a>
                                </div>
                            </div>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                <strong>Planning Another Event?</strong><br>
                                We'd love to work with you again! We offer special discounts for repeat clients.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="mailto:{{businessEmail}}" style="background: transparent; color: #ed8936; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 2px solid #ed8936;">Book Again</a>
                            </div>
                            
                            <p style="color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                                Thank you for trusting us with your special day!<br>
                                DJ Nuff Jamz Entertainment Team
                            </p>
                        </div>
                    </div>
                `
            },
            'contact-response': {
                subject: 'Thank You for Contacting DJ Nuff Jamz Entertainment',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">DJ Nuff Jamz Entertainment</h1>
                            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Thanks for reaching out!</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d3748; margin-top: 0;">Hi {{name}},</h2>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                Thank you for contacting DJ Nuff Jamz Entertainment! We've received your message 
                                and will get back to you within 24 hours.
                            </p>
                            
                            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #2d3748; margin-top: 0;">Your Message:</h3>
                                <p style="color: #4a5568; line-height: 1.6; font-style: italic;">
                                    "{{message}}"
                                </p>
                            </div>
                            
                            <p style="color: #4a5568; line-height: 1.6;">
                                In the meantime, feel free to browse our portfolio and check out our available dates 
                                on our website. We're excited to potentially work with you!
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">View Portfolio</a>
                            </div>
                        </div>
                    </div>
                `
            }
        };

        // Store templates in memory
        for (const [key, template] of Object.entries(templates)) {
            this.templates.set(key, template);
        }

        // Save templates to files for admin editing
        const templatesDir = path.join(__dirname, '../templates/email');
        for (const [key, template] of Object.entries(templates)) {
            try {
                await fs.writeFile(
                    path.join(templatesDir, `${key}.json`),
                    JSON.stringify(template, null, 2)
                );
            } catch (error) {
                console.error(`Failed to save template ${key}:`, error.message);
            }
        }
    }

    /**
     * Send email using SendGrid or mock service
     */
    async sendEmail(to, templateName, data = {}) {
        try {
            const template = this.templates.get(templateName);
            if (!template) {
                throw new Error(`Template '${templateName}' not found`);
            }

            // Replace template variables
            const subject = this.replaceVariables(template.subject, data);
            const html = this.replaceVariables(template.html, data);
            const text = template.text ? this.replaceVariables(template.text, data) : '';

            const emailData = {
                to,
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@djnuffjamz.com',
                    name: 'DJ Nuff Jamz Entertainment'
                },
                subject,
                html,
                text: text || this.htmlToText(html)
            };

            if (this.isConfigured) {
                // Send via SendGrid
                const result = await sgMail.send(emailData);
                console.log(`Email sent successfully to ${to} using template ${templateName}`);
                return {
                    success: true,
                    messageId: result[0].headers['x-message-id'],
                    provider: 'sendgrid'
                };
            } else {
                // Mock mode - log email details
                console.log('=== EMAIL MOCK MODE ===');
                console.log(`To: ${to}`);
                console.log(`Subject: ${subject}`);
                console.log(`Template: ${templateName}`);
                console.log(`Data:`, data);
                console.log('========================');
                
                return {
                    success: true,
                    messageId: `mock-${Date.now()}`,
                    provider: 'mock'
                };
            }
        } catch (error) {
            console.error('Failed to send email:', error.message);
            throw error;
        }
    }

    /**
     * Send booking confirmation email
     */
    async sendBookingConfirmation(bookingData) {
        const emailData = {
            clientName: bookingData.clientName,
            eventType: bookingData.eventType,
            eventDate: this.formatDate(bookingData.eventDate),
            eventTime: bookingData.eventTime || 'TBD',
            venue: bookingData.venue || 'TBD',
            location: bookingData.location || 'TBD',
            guestCount: bookingData.guestCount || 'Not specified',
            budget: bookingData.budget || 'TBD',
            businessEmail: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com'
        };

        return await this.sendEmail(bookingData.email, 'booking-confirmation', emailData);
    }

    /**
     * Send event reminder email
     */
    async sendEventReminder(bookingData) {
        const emailData = {
            clientName: bookingData.clientName,
            eventType: bookingData.eventType,
            eventDate: this.formatDate(bookingData.eventDate),
            businessEmail: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com'
        };

        return await this.sendEmail(bookingData.email, 'booking-reminder', emailData);
    }

    /**
     * Send follow-up email after event
     */
    async sendFollowUp(bookingData) {
        const emailData = {
            clientName: bookingData.clientName,
            eventType: bookingData.eventType,
            businessEmail: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com'
        };

        return await this.sendEmail(bookingData.email, 'follow-up', emailData);
    }

    /**
     * Send contact form response
     */
    async sendContactResponse(contactData) {
        const emailData = {
            name: contactData.name,
            message: contactData.message
        };

        return await this.sendEmail(contactData.email, 'contact-response', emailData);
    }

    /**
     * Schedule email to be sent later
     */
    async scheduleEmail(to, templateName, data, sendAt) {
        // In a production environment, this would integrate with a job queue
        // For now, we'll store scheduled emails in memory or database
        const scheduledEmail = {
            id: `scheduled-${Date.now()}`,
            to,
            templateName,
            data,
            sendAt: new Date(sendAt),
            status: 'scheduled',
            createdAt: new Date()
        };

        console.log('Email scheduled:', scheduledEmail);
        
        // Set timeout for immediate scheduling (for demo purposes)
        const delay = new Date(sendAt) - new Date();
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
            setTimeout(async () => {
                try {
                    await this.sendEmail(to, templateName, data);
                    console.log(`Scheduled email sent: ${scheduledEmail.id}`);
                } catch (error) {
                    console.error(`Failed to send scheduled email: ${scheduledEmail.id}`, error);
                }
            }, delay);
        }

        return scheduledEmail;
    }

    /**
     * Get email templates for admin interface
     */
    getTemplates() {
        const templates = {};
        for (const [key, template] of this.templates.entries()) {
            templates[key] = {
                name: key,
                subject: template.subject,
                description: this.getTemplateDescription(key)
            };
        }
        return templates;
    }

    /**
     * Update email template
     */
    async updateTemplate(templateName, templateData) {
        try {
            this.templates.set(templateName, templateData);
            
            // Save to file
            const templatesDir = path.join(__dirname, '../templates/email');
            await fs.writeFile(
                path.join(templatesDir, `${templateName}.json`),
                JSON.stringify(templateData, null, 2)
            );
            
            return true;
        } catch (error) {
            console.error('Failed to update template:', error.message);
            throw error;
        }
    }

    /**
     * Get email analytics (mock implementation)
     */
    getEmailAnalytics() {
        return {
            totalSent: 150,
            delivered: 148,
            opened: 89,
            clicked: 23,
            bounced: 2,
            openRate: '60.1%',
            clickRate: '15.5%',
            deliveryRate: '98.7%'
        };
    }

    /**
     * Replace template variables with actual data
     */
    replaceVariables(template, data) {
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value || '');
        }
        return result;
    }

    /**
     * Convert HTML to plain text (basic implementation)
     */
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Get template description
     */
    getTemplateDescription(templateName) {
        const descriptions = {
            'booking-confirmation': 'Sent immediately after a booking is confirmed',
            'booking-reminder': 'Sent 1 week before the event date',
            'follow-up': 'Sent 3 days after the event for feedback',
            'contact-response': 'Auto-response for contact form submissions'
        };
        return descriptions[templateName] || 'Custom email template';
    }
}

module.exports = EmailService;
