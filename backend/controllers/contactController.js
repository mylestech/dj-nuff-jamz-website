/**
 * Contact Controller
 * Handles contact form submissions
 */

const BaseController = require('./BaseController');
const Contact = require('../models/Contact');
const emailService = require('../utils/emailService');

class ContactController extends BaseController {
  constructor() {
    super();
    // Bind methods to maintain 'this' context
    this.submitContactForm = this.asyncHandler(this.submitContactForm.bind(this));
    this.getAllContacts = this.asyncHandler(this.getAllContacts.bind(this));
    this.getContact = this.asyncHandler(this.getContact.bind(this));
    this.updateContactStatus = this.asyncHandler(this.updateContactStatus.bind(this));
    this.deleteContact = this.asyncHandler(this.deleteContact.bind(this));
    this.getContactStats = this.asyncHandler(this.getContactStats.bind(this));
  }

  /**
   * Submit contact form
   */
  async submitContactForm(req, res) {
    try {
      const contactData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const contact = new Contact(contactData);
      await contact.save();

      // Send acknowledgment and notification emails
      try {
        await emailService.sendContactAcknowledgment(contact);
        await emailService.sendAdminContactNotification(contact);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue execution - don't fail the contact creation due to email issues
      }

      // Return contact data without sensitive info
      const responseData = {
        id: contact._id,
        subject: contact.subject,
        urgency: contact.urgency,
        status: contact.status,
        message: 'Thank you for your message. We will respond within 24-48 hours.'
      };

      this.sendSuccess(res, responseData, 'Contact form submitted successfully', 201);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return this.sendValidationError(res, validationErrors);
      }
      
      console.error('Contact creation error:', error);
      this.sendError(res, 'Failed to submit contact form', 500);
    }
  }

  /**
   * Get all contact submissions (admin only)
   */
  async getAllContacts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const urgency = req.query.urgency;
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      const filter = {};
      if (status) filter.status = status;
      if (urgency) filter.urgency = urgency;

      const contacts = await Contact.find(filter)
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Contact.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const responseData = {
        contacts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      this.sendSuccess(res, responseData, 'Contact submissions retrieved successfully');
    } catch (error) {
      console.error('Get contacts error:', error);
      this.sendError(res, 'Failed to retrieve contact submissions', 500);
    }
  }

  /**
   * Get single contact submission by ID (admin only)
   */
  async getContact(req, res) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return this.sendNotFound(res, 'Contact submission');
      }

      this.sendSuccess(res, contact, 'Contact submission retrieved successfully');
    } catch (error) {
      console.error('Get contact error:', error);
      if (error.name === 'CastError') {
        return this.sendNotFound(res, 'Contact submission');
      }
      this.sendError(res, 'Failed to retrieve contact submission', 500);
    }
  }

  /**
   * Update contact status (admin only)
   */
  async updateContactStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminResponse, adminNotes } = req.body;

      const contact = await Contact.findById(id);
      if (!contact) {
        return this.sendNotFound(res, 'Contact submission');
      }

      // Update fields
      contact.status = status;
      if (adminResponse) contact.adminResponse = adminResponse;
      if (adminNotes) contact.adminNotes = adminNotes;
      
      // Mark as responded if status changed to completed
      if (status === 'completed' && !contact.respondedAt) {
        contact.markAsResponded();
      }

      await contact.save();

      this.sendSuccess(res, contact, 'Contact status updated successfully');
    } catch (error) {
      console.error('Update contact status error:', error);
      if (error.name === 'CastError') {
        return this.sendNotFound(res, 'Contact submission');
      }
      this.sendError(res, 'Failed to update contact status', 500);
    }
  }

  /**
   * Delete contact submission (admin only)
   */
  async deleteContact(req, res) {
    try {
      const { id } = req.params;
      const contact = await Contact.findByIdAndDelete(id);

      if (!contact) {
        return this.sendNotFound(res, 'Contact submission');
      }

      this.sendSuccess(res, null, 'Contact submission deleted successfully');
    } catch (error) {
      console.error('Delete contact error:', error);
      if (error.name === 'CastError') {
        return this.sendNotFound(res, 'Contact submission');
      }
      this.sendError(res, 'Failed to delete contact submission', 500);
    }
  }

  /**
   * Get contact statistics (admin only)
   */
  async getContactStats(req, res) {
    try {
      const stats = await Contact.getStats();
      this.sendSuccess(res, stats, 'Contact statistics retrieved successfully');
    } catch (error) {
      console.error('Get contact stats error:', error);
      this.sendError(res, 'Failed to retrieve contact statistics', 500);
    }
  }
}

module.exports = new ContactController();
