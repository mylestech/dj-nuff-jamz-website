/**
 * Email Service
 * Handles sending emails for notifications and responses using SendGrid
 */

const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.isConfigured = this.checkConfiguration();
    if (this.isConfigured) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  /**
   * Check if email service is properly configured
   */
  checkConfiguration() {
    return !!process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'YOUR_SENDGRID_API_KEY_HERE';
  }

  /**
   * Send booking confirmation email
   * @param {Object} booking - Booking details
   */
  async sendBookingConfirmation(booking) {
    try {
      const emailData = {
        to: booking.email,
        from: process.env.BUSINESS_EMAIL || 'bookings@djnuffjamz.com',
        subject: 'Booking Request Received - DJ Nuff Jamz Entertainment',
        template: 'booking-confirmation',
        data: {
          name: booking.name,
          eventType: booking.eventType,
          eventDate: new Date(booking.eventDate).toLocaleDateString(),
          eventLocation: booking.eventLocation,
          guestCount: booking.guestCount,
          bookingId: booking._id
        }
      };

      if (this.isConfigured) {
        const template = await this.generateEmailTemplate(emailData.template, emailData.data);
        const msg = {
          to: emailData.to,
          from: emailData.from,
          subject: emailData.subject,
          text: template,
          html: template.replace(/\n/g, '<br>')
        };
        
        await sgMail.send(msg);
        console.log('📧 ✅ Booking confirmation email sent to:', emailData.to);
      } else {
        console.log('📧 Email service not configured - logging booking confirmation:');
        console.log(JSON.stringify(emailData, null, 2));
      }

      return { success: true, message: 'Confirmation email sent' };
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send contact form acknowledgment
   * @param {Object} contact - Contact details
   */
  async sendContactAcknowledgment(contact) {
    try {
      const emailData = {
        to: contact.email,
        from: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com',
        subject: 'Message Received - DJ Nuff Jamz Entertainment',
        template: 'contact-acknowledgment',
        data: {
          name: contact.name,
          subject: contact.subject,
          urgency: contact.urgency,
          contactId: contact._id
        }
      };

      if (this.isConfigured) {
        // TODO: Implement actual email sending
        console.log('📧 Would send contact acknowledgment email:', emailData);
      } else {
        console.log('📧 Email service not configured - logging contact acknowledgment:');
        console.log(JSON.stringify(emailData, null, 2));
      }

      return { success: true, message: 'Acknowledgment email sent' };
    } catch (error) {
      console.error('Error sending contact acknowledgment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send admin notification for new booking
   * @param {Object} booking - Booking details
   */
  async sendAdminBookingNotification(booking) {
    try {
      const emailData = {
        to: process.env.ADMIN_EMAIL || 'admin@djnuffjamz.com',
        from: process.env.BUSINESS_EMAIL || 'bookings@djnuffjamz.com',
        subject: `New Booking Request - ${booking.eventType} on ${new Date(booking.eventDate).toLocaleDateString()}`,
        template: 'admin-booking-notification',
        data: {
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          eventType: booking.eventType,
          eventDate: new Date(booking.eventDate).toLocaleDateString(),
          eventLocation: booking.eventLocation,
          guestCount: booking.guestCount,
          budget: booking.budget,
          musicPreferences: booking.musicPreferences,
          specialRequests: booking.specialRequests,
          bookingId: booking._id
        }
      };

      if (this.isConfigured) {
        const msg = {
          to: emailData.to,
          from: emailData.from,
          subject: emailData.subject,
          text: `New Booking Request

Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Event Type: ${booking.eventType}
Event Date: ${new Date(booking.eventDate).toLocaleDateString()}
Location: ${booking.eventLocation}
Guest Count: ${booking.guestCount}
Budget: ${booking.budget}
Music Preferences: ${booking.musicPreferences}
Special Requests: ${booking.specialRequests}

Booking ID: ${booking._id}`,
          html: `<h2>New Booking Request</h2>
<p><strong>Name:</strong> ${booking.name}</p>
<p><strong>Email:</strong> ${booking.email}</p>
<p><strong>Phone:</strong> ${booking.phone}</p>
<p><strong>Event Type:</strong> ${booking.eventType}</p>
<p><strong>Event Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</p>
<p><strong>Location:</strong> ${booking.eventLocation}</p>
<p><strong>Guest Count:</strong> ${booking.guestCount}</p>
<p><strong>Budget:</strong> ${booking.budget}</p>
<p><strong>Music Preferences:</strong> ${booking.musicPreferences}</p>
<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>
<p><strong>Booking ID:</strong> ${booking._id}</p>`
        };
        
        await sgMail.send(msg);
        console.log('📧 ✅ Admin notification sent for booking:', booking._id);
      } else {
        console.log('📧 Email service not configured - logging admin notification:');
        console.log(`New booking from ${booking.name} for ${booking.eventType} on ${new Date(booking.eventDate).toLocaleDateString()}`);
      }

      return { success: true, message: 'Admin notification sent' };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send admin notification for new contact
   * @param {Object} contact - Contact details
   */
  async sendAdminContactNotification(contact) {
    try {
      const urgencyPrefix = contact.urgency === 'high' ? '[URGENT] ' : '';
      
      const emailData = {
        to: process.env.ADMIN_EMAIL || 'admin@djnuffjamz.com',
        from: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com',
        subject: `${urgencyPrefix}New Contact Message - ${contact.subject}`,
        template: 'admin-contact-notification',
        data: {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          subject: contact.subject,
          message: contact.message,
          urgency: contact.urgency,
          contactId: contact._id
        }
      };

      if (this.isConfigured) {
        // TODO: Implement actual email sending
        console.log('📧 Would send admin contact notification:', emailData.subject);
      } else {
        console.log('📧 Email service not configured - logging admin contact notification:');
        console.log(`New ${contact.urgency} priority message from ${contact.name}: ${contact.subject}`);
      }

      return { success: true, message: 'Admin notification sent' };
    } catch (error) {
      console.error('Error sending admin contact notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate email templates (placeholder for future implementation)
   * @param {string} template - Template name
   * @param {Object} data - Template data
   */
  async generateEmailTemplate(template, data) {
    // TODO: Implement email templates with handlebars or similar
    const templates = {
      'booking-confirmation': `
        Dear ${data.name},
        
        Thank you for your booking request for DJ Nuff Jamz Entertainment!
        
        Event Details:
        - Type: ${data.eventType}
        - Date: ${data.eventDate}
        - Location: ${data.eventLocation}
        - Guests: ${data.guestCount}
        
        We will review your request and get back to you within 24 hours.
        
        Booking Reference: ${data.bookingId}
        
        Best regards,
        DJ Nuff Jamz Entertainment Team
      `,
      'contact-acknowledgment': `
        Dear ${data.name},
        
        Thank you for contacting DJ Nuff Jamz Entertainment!
        
        We have received your message regarding: ${data.subject}
        Priority: ${data.urgency}
        
        We will respond within 24-48 hours depending on the urgency of your inquiry.
        
        Reference: ${data.contactId}
        
        Best regards,
        DJ Nuff Jamz Entertainment Team
      `
    };

    return templates[template] || 'Template not found';
  }
}

module.exports = new EmailService();

