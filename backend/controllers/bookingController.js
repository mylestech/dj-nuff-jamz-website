/**
 * Booking Controller
 * Handles booking and event management
 */

const BaseController = require('./BaseController');
const Booking = require('../models/Booking');
const emailService = require('../utils/emailService');

class BookingController extends BaseController {
  constructor() {
    super();
    // Bind methods to maintain 'this' context
    this.createBooking = this.asyncHandler(this.createBooking.bind(this));
    this.getAllBookings = this.asyncHandler(this.getAllBookings.bind(this));
    this.getBooking = this.asyncHandler(this.getBooking.bind(this));
    this.updateBookingStatus = this.asyncHandler(this.updateBookingStatus.bind(this));
    this.deleteBooking = this.asyncHandler(this.deleteBooking.bind(this));
    this.getBookingStats = this.asyncHandler(this.getBookingStats.bind(this));
  }

  /**
   * Create new booking request
   */
  async createBooking(req, res) {
    try {
      const bookingData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const booking = new Booking(bookingData);
      await booking.save();

      // Send confirmation emails
      try {
        await emailService.sendBookingConfirmation(booking);
        await emailService.sendAdminBookingNotification(booking);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue execution - don't fail the booking creation due to email issues
      }

      // Return booking data without sensitive info
      const responseData = {
        id: booking._id,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        status: booking.status,
        message: 'We will contact you within 24 hours to discuss your event details.'
      };

      this.sendSuccess(res, responseData, 'Booking request submitted successfully', 201);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return this.sendValidationError(res, validationErrors);
      }
      
      console.error('Booking creation error:', error);
      this.sendError(res, 'Failed to submit booking request', 500);
    }
  }

  /**
   * Get all bookings (admin only)
   */
  async getAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      const filter = {};
      if (status) filter.status = status;

      const bookings = await Booking.find(filter)
        .sort({ [sortBy]: sortOrder })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Booking.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const responseData = {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      this.sendSuccess(res, responseData, 'Bookings retrieved successfully');
    } catch (error) {
      console.error('Get bookings error:', error);
      this.sendError(res, 'Failed to retrieve bookings', 500);
    }
  }

  /**
   * Get single booking by ID (admin only)
   */
  async getBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);

      if (!booking) {
        return this.sendNotFound(res, 'Booking');
      }

      this.sendSuccess(res, booking, 'Booking retrieved successfully');
    } catch (error) {
      console.error('Get booking error:', error);
      if (error.name === 'CastError') {
        return this.sendNotFound(res, 'Booking');
      }
      this.sendError(res, 'Failed to retrieve booking', 500);
    }
  }

  /**
   * Update booking status (admin only)
   */
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes, quotedPrice } = req.body;

      const booking = await Booking.findById(id);
      if (!booking) {
        return this.sendNotFound(res, 'Booking');
      }

      // Update fields
      booking.status = status;
      if (adminNotes) booking.adminNotes = adminNotes;
      if (quotedPrice) booking.quotedPrice = quotedPrice;

      await booking.save();

      this.sendSuccess(res, booking, 'Booking status updated successfully');
    } catch (error) {
      console.error('Update booking status error:', error);
      if (error.name === 'CastError') {
        return this.sendNotFound(res, 'Booking');
      }
      this.sendError(res, 'Failed to update booking status', 500);
    }
  }

  /**
   * Delete booking (admin only)
   */
  async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await Booking.findByIdAndDelete(id);

      if (!booking) {
        return this.sendNotFound(res, 'Booking');
      }

      this.sendSuccess(res, null, 'Booking deleted successfully');
    } catch (error) {
      console.error('Delete booking error:', error);
      if (error.name === 'CastError') {
        return this.sendNotFound(res, 'Booking');
      }
      this.sendError(res, 'Failed to delete booking', 500);
    }
  }

  /**
   * Get booking statistics (admin only)
   */
  async getBookingStats(req, res) {
    try {
      const stats = await Booking.getStats();
      this.sendSuccess(res, stats, 'Booking statistics retrieved successfully');
    } catch (error) {
      console.error('Get booking stats error:', error);
      this.sendError(res, 'Failed to retrieve booking statistics', 500);
    }
  }
}

module.exports = new BookingController();
