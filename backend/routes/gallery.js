/**
 * Gallery Routes
 * API endpoints for photo gallery management
 */

const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { validateId } = require('../middleware/validation');

// Public routes
router.get('/', galleryController.getAllGallery.bind(galleryController));
router.get('/featured', galleryController.getFeaturedGallery.bind(galleryController));
router.get('/portfolio', galleryController.getPortfolioGallery.bind(galleryController));
router.get('/recent', galleryController.getRecentGallery.bind(galleryController));
router.get('/search', galleryController.searchGallery.bind(galleryController));
router.get('/stats', galleryController.getGalleryStats.bind(galleryController));
router.get('/event/:eventType', galleryController.getGalleryByEventType.bind(galleryController));
router.get('/slug/:slug', galleryController.getGalleryBySlug.bind(galleryController));
router.get('/:id', validateId, galleryController.getGalleryItem.bind(galleryController));

// Admin routes (would need authentication middleware in production)
router.post('/', galleryController.createGalleryItem.bind(galleryController));
router.put('/:id', validateId, galleryController.updateGalleryItem.bind(galleryController));
router.delete('/:id', validateId, galleryController.deleteGalleryItem.bind(galleryController));
router.patch('/:id/featured', validateId, galleryController.toggleFeatured.bind(galleryController));
router.patch('/:id/portfolio', validateId, galleryController.togglePortfolio.bind(galleryController));

module.exports = router;

