/**
 * Booking Routes
 * Handles booking and contact form submissions
 */

const express = require('express');
const router = express.Router();
const { booking: bookingController } = require('../controllers');
const { validateBooking, validateId, validateStatusUpdate } = require('../middleware/validation');

// POST /api/booking - Submit booking request
router.post('/', validateBooking, bookingController.createBooking);

// GET /api/booking - Get all bookings (admin only)
router.get('/', bookingController.getAllBookings);

// GET /api/booking/stats - Get booking statistics (admin only)
router.get('/stats', bookingController.getBookingStats);

// GET /api/booking/:id - Get single booking (admin only)
router.get('/:id', validateId, bookingController.getBooking);

// PUT /api/booking/:id/status - Update booking status (admin only)
router.put('/:id/status', validateId, validateStatusUpdate, bookingController.updateBookingStatus);

// DELETE /api/booking/:id - Delete booking (admin only)
router.delete('/:id', validateId, bookingController.deleteBooking);

module.exports = router;
