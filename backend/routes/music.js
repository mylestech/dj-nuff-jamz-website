/**
 * Music Routes
 * API endpoints for DJ's music catalog management
 */

const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { validateId } = require('../middleware/validation');

// Public routes
router.get('/', musicController.getAllMusic.bind(musicController));
router.get('/featured', musicController.getFeaturedMusic.bind(musicController));
router.get('/popular', musicController.getPopularMusic.bind(musicController));
router.get('/search', musicController.searchMusic.bind(musicController));
router.get('/stats', musicController.getMusicStats.bind(musicController));
router.get('/play-stats', musicController.getPlayStats.bind(musicController));
router.get('/:id', validateId, musicController.getMusic.bind(musicController));
router.post('/:id/play', validateId, musicController.trackPlay.bind(musicController));

// Admin routes (would need authentication middleware in production)
router.post('/', musicController.createMusic.bind(musicController));
router.post('/upload', musicController.uploadAudio.bind(musicController));
router.put('/:id', validateId, musicController.updateMusic.bind(musicController));
router.delete('/:id', validateId, musicController.deleteMusic.bind(musicController));
router.delete('/:id/file', validateId, musicController.deleteAudioFile.bind(musicController));
router.patch('/:id/featured', validateId, musicController.toggleFeatured.bind(musicController));

module.exports = router;
