const BaseController = require('./BaseController');
const EmailService = require('../services/emailService');

class EmailController extends BaseController {
    
    constructor() {
        super();
        this.emailService = new EmailService();
    }

    /**
     * Send test email
     */
    async sendTestEmail(req, res) {
        try {
            const { to, templateName, testData } = req.body;

            if (!to || !templateName) {
                return this.sendValidationError(res, { 
                    message: 'Recipient email and template name are required' 
                });
            }

            // Default test data
            const defaultTestData = {
                clientName: 'John Doe',
                eventType: 'Wedding Reception',
                eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '6:00 PM',
                venue: 'Grand Ballroom',
                location: 'New York, NY',
                guestCount: '150',
                budget: '2500',
                businessEmail: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com',
                name: 'John Doe',
                message: 'I would like to inquire about DJ services for my wedding.'
            };

            const emailData = { ...defaultTestData, ...testData };
            const result = await this.emailService.sendEmail(to, templateName, emailData);

            this.sendSuccess(res, result, 'Test email sent successfully');
        } catch (error) {
            this.sendError(res, 'Failed to send test email', 500, error);
        }
    }

    /**
     * Get available email templates
     */
    async getTemplates(req, res) {
        try {
            const templates = this.emailService.getTemplates();
            this.sendSuccess(res, { templates }, 'Email templates retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve email templates', 500, error);
        }
    }

    /**
     * Get specific email template
     */
    async getTemplate(req, res) {
        try {
            const { templateName } = req.params;
            const template = this.emailService.templates.get(templateName);

            if (!template) {
                return this.sendError(res, 'Template not found', 404);
            }

            this.sendSuccess(res, { template }, 'Email template retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve email template', 500, error);
        }
    }

    /**
     * Update email template
     */
    async updateTemplate(req, res) {
        try {
            const { templateName } = req.params;
            const { subject, html, text } = req.body;

            if (!subject || !html) {
                return this.sendValidationError(res, { 
                    message: 'Subject and HTML content are required' 
                });
            }

            const templateData = { subject, html, text };
            await this.emailService.updateTemplate(templateName, templateData);

            this.sendSuccess(res, { templateName, updated: true }, 'Email template updated successfully');
        } catch (error) {
            this.sendError(res, 'Failed to update email template', 500, error);
        }
    }

    /**
     * Send booking confirmation email
     */
    async sendBookingConfirmation(req, res) {
        try {
            const bookingData = req.body;

            if (!bookingData.email || !bookingData.clientName) {
                return this.sendValidationError(res, { 
                    message: 'Email and client name are required' 
                });
            }

            const result = await this.emailService.sendBookingConfirmation(bookingData);
            this.sendSuccess(res, result, 'Booking confirmation email sent successfully');
        } catch (error) {
            this.sendError(res, 'Failed to send booking confirmation email', 500, error);
        }
    }

    /**
     * Send event reminder email
     */
    async sendEventReminder(req, res) {
        try {
            const bookingData = req.body;

            if (!bookingData.email || !bookingData.clientName) {
                return this.sendValidationError(res, { 
                    message: 'Email and client name are required' 
                });
            }

            const result = await this.emailService.sendEventReminder(bookingData);
            this.sendSuccess(res, result, 'Event reminder email sent successfully');
        } catch (error) {
            this.sendError(res, 'Failed to send event reminder email', 500, error);
        }
    }

    /**
     * Send follow-up email
     */
    async sendFollowUp(req, res) {
        try {
            const bookingData = req.body;

            if (!bookingData.email || !bookingData.clientName) {
                return this.sendValidationError(res, { 
                    message: 'Email and client name are required' 
                });
            }

            const result = await this.emailService.sendFollowUp(bookingData);
            this.sendSuccess(res, result, 'Follow-up email sent successfully');
        } catch (error) {
            this.sendError(res, 'Failed to send follow-up email', 500, error);
        }
    }

    /**
     * Send contact form auto-response
     */
    async sendContactResponse(req, res) {
        try {
            const contactData = req.body;

            if (!contactData.email || !contactData.name) {
                return this.sendValidationError(res, { 
                    message: 'Email and name are required' 
                });
            }

            const result = await this.emailService.sendContactResponse(contactData);
            this.sendSuccess(res, result, 'Contact response email sent successfully');
        } catch (error) {
            this.sendError(res, 'Failed to send contact response email', 500, error);
        }
    }

    /**
     * Schedule email to be sent later
     */
    async scheduleEmail(req, res) {
        try {
            const { to, templateName, data, sendAt } = req.body;

            if (!to || !templateName || !sendAt) {
                return this.sendValidationError(res, { 
                    message: 'Recipient email, template name, and send time are required' 
                });
            }

            const result = await this.emailService.scheduleEmail(to, templateName, data, sendAt);
            this.sendSuccess(res, result, 'Email scheduled successfully');
        } catch (error) {
            this.sendError(res, 'Failed to schedule email', 500, error);
        }
    }

    /**
     * Get email analytics
     */
    async getEmailAnalytics(req, res) {
        try {
            const analytics = this.emailService.getEmailAnalytics();
            this.sendSuccess(res, analytics, 'Email analytics retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve email analytics', 500, error);
        }
    }

    /**
     * Send bulk emails (for newsletters, announcements)
     */
    async sendBulkEmail(req, res) {
        try {
            const { recipients, templateName, data, subject } = req.body;

            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return this.sendValidationError(res, { 
                    message: 'Recipients array is required and must not be empty' 
                });
            }

            if (!templateName && !subject) {
                return this.sendValidationError(res, { 
                    message: 'Either template name or subject is required' 
                });
            }

            const results = [];
            const errors = [];

            // Send emails in batches to avoid rate limiting
            const batchSize = 10;
            for (let i = 0; i < recipients.length; i += batchSize) {
                const batch = recipients.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (recipient) => {
                    try {
                        let result;
                        if (templateName) {
                            result = await this.emailService.sendEmail(recipient.email, templateName, {
                                ...data,
                                name: recipient.name || 'Valued Client'
                            });
                        } else {
                            // Custom email without template
                            result = await this.emailService.sendEmail(recipient.email, 'custom', {
                                subject,
                                ...data
                            });
                        }
                        results.push({ email: recipient.email, success: true, messageId: result.messageId });
                    } catch (error) {
                        errors.push({ email: recipient.email, error: error.message });
                    }
                });

                await Promise.all(batchPromises);
                
                // Small delay between batches
                if (i + batchSize < recipients.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            this.sendSuccess(res, {
                totalSent: results.length,
                totalErrors: errors.length,
                results,
                errors
            }, 'Bulk email sending completed');
        } catch (error) {
            this.sendError(res, 'Failed to send bulk emails', 500, error);
        }
    }

    /**
     * Test email configuration
     */
    async testConfiguration(req, res) {
        try {
            const isConfigured = this.emailService.isConfigured;
            const testResult = {
                configured: isConfigured,
                provider: isConfigured ? 'SendGrid' : 'Mock',
                status: isConfigured ? 'Ready' : 'Development Mode',
                message: isConfigured 
                    ? 'SendGrid API is properly configured'
                    : 'SendGrid API key not found. Emails will be logged to console.'
            };

            this.sendSuccess(res, testResult, 'Email configuration tested');
        } catch (error) {
            this.sendError(res, 'Failed to test email configuration', 500, error);
        }
    }
}

module.exports = EmailController;
