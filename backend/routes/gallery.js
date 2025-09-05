/**
 * Gallery Routes
 * API endpoints for photo gallery management
 */

const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Public routes
router.get('/', galleryController.getGalleryItems.bind(galleryController));
router.get('/local', galleryController.scanLocalGallery.bind(galleryController));

// Admin routes (would need authentication middleware in production)
router.post('/upload', galleryController.uploadGalleryItem.bind(galleryController));

module.exports = router;

