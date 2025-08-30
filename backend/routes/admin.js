/**
 * Admin Routes
 * Handles admin authentication and dashboard functionality
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public admin routes (no auth required)
router.post('/login', adminController.login);

// Protected admin routes (require authentication)
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/content-stats', adminController.getContentStats);

// Profile management
router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);

// Activity and analytics
router.get('/activity', adminController.getRecentActivity);
router.get('/analytics', adminController.getAnalytics);

// System health
router.get('/health', adminController.getSystemHealth);

// Logout
router.post('/logout', adminController.logout);

module.exports = router;