/**
 * Gallery Routes
 * Handles photo gallery API endpoints
 */

const express = require('express');
const router = express.Router();
const { gallery: galleryController } = require('../controllers');

// GET /api/gallery - Get all photos
router.get('/', galleryController.getAllPhotos);

// GET /api/gallery/:id - Get single photo
router.get('/:id', galleryController.getPhoto);

// POST /api/gallery - Upload new photo (admin only)
router.post('/', galleryController.uploadPhoto);

// PUT /api/gallery/:id - Update photo details (admin only)
router.put('/:id', galleryController.updatePhoto);

// DELETE /api/gallery/:id - Delete photo (admin only)
router.delete('/:id', galleryController.deletePhoto);

// GET /api/gallery/category/:category - Get photos by category
router.get('/category/:category', galleryController.getPhotosByCategory);

module.exports = router;

