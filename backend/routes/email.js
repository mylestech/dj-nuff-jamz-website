const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/emailController');

// Initialize controller
const emailController = new EmailController();

// Public routes
router.get('/test-config', emailController.testConfiguration.bind(emailController));
router.get('/analytics', emailController.getEmailAnalytics.bind(emailController));

// Template management routes
router.get('/templates', emailController.getTemplates.bind(emailController));
router.get('/templates/:templateName', emailController.getTemplate.bind(emailController));
router.put('/templates/:templateName', emailController.updateTemplate.bind(emailController));

// Email sending routes
router.post('/send/test', emailController.sendTestEmail.bind(emailController));
router.post('/send/booking-confirmation', emailController.sendBookingConfirmation.bind(emailController));
router.post('/send/event-reminder', emailController.sendEventReminder.bind(emailController));
router.post('/send/follow-up', emailController.sendFollowUp.bind(emailController));
router.post('/send/contact-response', emailController.sendContactResponse.bind(emailController));
router.post('/send/bulk', emailController.sendBulkEmail.bind(emailController));

// Scheduling routes
router.post('/schedule', emailController.scheduleEmail.bind(emailController));

module.exports = router;
