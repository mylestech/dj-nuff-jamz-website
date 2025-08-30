const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendarController');
const { validateId } = require('../middleware/validation');

// Initialize controller
const calendarController = new CalendarController();

// Public routes
router.get('/events', calendarController.getEvents.bind(calendarController));
router.get('/availability', calendarController.checkAvailability.bind(calendarController));
router.get('/stats', calendarController.getCalendarStats.bind(calendarController));

// OAuth routes
router.get('/auth', calendarController.getAuthUrl.bind(calendarController));
router.get('/callback', calendarController.handleCallback.bind(calendarController));

// Admin routes (would need authentication middleware in production)
router.post('/events', calendarController.createEvent.bind(calendarController));

module.exports = router;
