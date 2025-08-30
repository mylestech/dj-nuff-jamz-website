const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// Initialize controller
const analyticsController = new AnalyticsController();

// Public tracking endpoint
router.post('/track', analyticsController.trackEvent.bind(analyticsController));

// Dashboard and reporting endpoints (would need authentication in production)
router.get('/dashboard', analyticsController.getDashboard.bind(analyticsController));
router.get('/seo', analyticsController.getSEOMetrics.bind(analyticsController));
router.get('/export', analyticsController.exportData.bind(analyticsController));

module.exports = router;
