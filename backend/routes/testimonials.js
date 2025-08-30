/**
 * Testimonial Routes
 * Handles testimonial-related API endpoints
 */

const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/approved', testimonialController.getApprovedTestimonials);
router.get('/featured', testimonialController.getFeaturedTestimonials);
router.get('/event-type/:eventType', testimonialController.getTestimonialsByEventType);
router.get('/stats', testimonialController.getTestimonialStats);

// Public testimonial submission (no auth required)
router.post('/', testimonialController.createTestimonial);

// Public testimonial viewing (approved only)
router.get('/:id', validateId, testimonialController.getTestimonialById);

// Protected routes (require authentication)
router.use(requireAuth);

// Admin-only routes
router.use(requireAdmin);

// Admin testimonial management
router.get('/', testimonialController.getAllTestimonials);
router.put('/:id', validateId, testimonialController.updateTestimonial);
router.delete('/:id', validateId, testimonialController.deleteTestimonial);
router.patch('/:id/approve', validateId, testimonialController.approveTestimonial);
router.patch('/:id/feature', validateId, testimonialController.featureTestimonial);

module.exports = router;
