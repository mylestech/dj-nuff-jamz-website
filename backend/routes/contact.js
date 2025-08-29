/**
 * Contact Routes
 * Handles contact form submissions
 */

const express = require('express');
const router = express.Router();
const { contact: contactController } = require('../controllers');
const { validateContact, validateId, validateStatusUpdate } = require('../middleware/validation');

// POST /api/contact - Submit contact form
router.post('/', validateContact, contactController.submitContactForm);

// GET /api/contact - Get all contact submissions (admin only)
router.get('/', contactController.getAllContacts);

// GET /api/contact/stats - Get contact statistics (admin only)
router.get('/stats', contactController.getContactStats);

// GET /api/contact/:id - Get single contact submission (admin only)
router.get('/:id', validateId, contactController.getContact);

// PUT /api/contact/:id/status - Update contact status (admin only)
router.put('/:id/status', validateId, validateStatusUpdate, contactController.updateContactStatus);

// DELETE /api/contact/:id - Delete contact submission (admin only)
router.delete('/:id', validateId, contactController.deleteContact);

module.exports = router;
