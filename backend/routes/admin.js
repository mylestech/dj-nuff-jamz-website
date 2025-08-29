/**
 * Admin Routes
 * Handles admin authentication and management
 */

const express = require('express');
const router = express.Router();
const { admin: adminController } = require('../controllers');
const { validateAdminLogin } = require('../middleware/validation');

// POST /api/admin/login - Admin login
router.post('/login', validateAdminLogin, adminController.login);

// POST /api/admin/logout - Admin logout
router.post('/logout', adminController.logout);

// GET /api/admin/dashboard - Get comprehensive dashboard stats
router.get('/dashboard', adminController.getDashboard);

// GET /api/admin/activity - Get recent system activity
router.get('/activity', adminController.getRecentActivity);

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', adminController.getAnalytics);

// GET /api/admin/health - Get system health information
router.get('/health', adminController.getSystemHealth);

// GET /api/admin/profile - Get admin profile
router.get('/profile', adminController.getProfile);

// PUT /api/admin/profile - Update admin profile
router.put('/profile', adminController.updateProfile);

module.exports = router;
