/**
 * Admin Controller
 * Handles admin authentication and management
 */

const BaseController = require('./BaseController');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

class AdminController extends BaseController {
  constructor() {
    super();
    // Bind methods to maintain 'this' context
    this.login = this.asyncHandler(this.login.bind(this));
    this.logout = this.asyncHandler(this.logout.bind(this));
    this.getDashboard = this.asyncHandler(this.getDashboard.bind(this));
    this.getProfile = this.asyncHandler(this.getProfile.bind(this));
    this.updateProfile = this.asyncHandler(this.updateProfile.bind(this));
    this.getRecentActivity = this.asyncHandler(this.getRecentActivity.bind(this));
    this.getAnalytics = this.asyncHandler(this.getAnalytics.bind(this));
    this.getSystemHealth = this.asyncHandler(this.getSystemHealth.bind(this));
  }

  /**
   * Admin login
   */
  async login(req, res) {
    const { username, password } = req.body;
    const { generateToken } = require('../middleware/auth');
    
    // Check credentials against environment variables
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD;
    
    // Debug logging removed
    
    if (username === validUsername && password === validPassword) {
      // Generate real JWT token
      const token = generateToken({
        username,
        role: 'admin',
        loginTime: new Date().toISOString()
      });
      
      this.sendSuccess(res, { 
        token,
        user: { username, role: 'admin' },
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }, 'Login successful');
    } else {
      this.sendError(res, 'Invalid credentials', 401);
    }
  }

  /**
   * Admin logout
   */
  async logout(req, res) {
    // TODO: Implement proper token invalidation in task 4.5
    this.sendSuccess(res, null, 'Logout successful');
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboard(req, res) {
    try {
      // Get booking statistics
      const bookingStats = await Booking.getStats();
      
      // Get contact statistics
      const contactStats = await Contact.getStats();
      
      // Get recent bookings
      const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name eventType eventDate status createdAt')
        .lean();
      
      // Get recent contacts
      const recentContacts = await Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name subject urgency status createdAt')
        .lean();
      
      // Get upcoming events
      const upcomingEvents = await Booking.find({
        eventDate: { $gte: new Date() },
        status: { $in: ['confirmed', 'pending'] }
      })
        .sort({ eventDate: 1 })
        .limit(5)
        .select('name eventType eventDate eventLocation guestCount')
        .lean();

      // Calculate revenue (placeholder)
      const totalRevenue = await Booking.aggregate([
        { $match: { status: 'completed', quotedPrice: { $exists: true } } },
        { $group: { _id: null, total: { $sum: '$quotedPrice' } } }
      ]);

      // Get monthly statistics
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlyBookings = await Booking.countDocuments({
        createdAt: { $gte: currentMonth }
      });
      
      const monthlyContacts = await Contact.countDocuments({
        createdAt: { $gte: currentMonth }
      });

      const dashboardData = {
        overview: {
          totalBookings: bookingStats.total,
          pendingBookings: bookingStats.pending,
          confirmedBookings: bookingStats.confirmed,
          completedBookings: bookingStats.completed,
          totalContacts: contactStats.total,
          pendingContacts: contactStats.byStatus.pending,
          highPriorityContacts: contactStats.byUrgency.high,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyBookings,
          monthlyContacts
        },
        
        recentActivity: {
          bookings: recentBookings,
          contacts: recentContacts
        },
        
        upcomingEvents,
        
        quickStats: {
          responseRate: this.calculateResponseRate(contactStats),
          averageBookingValue: totalRevenue[0]?.total ? 
            Math.round(totalRevenue[0].total / bookingStats.completed) : 0,
          bookingConversionRate: bookingStats.total > 0 ? 
            Math.round((bookingStats.confirmed / bookingStats.total) * 100) : 0
        },
        
        systemInfo: {
          serverUptime: Math.floor(process.uptime()),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
          lastBackup: new Date().toISOString() // Placeholder
        }
      };

      this.sendSuccess(res, dashboardData, 'Dashboard data retrieved successfully');
    } catch (error) {
      console.error('Dashboard error:', error);
      this.sendError(res, 'Failed to retrieve dashboard data', 500);
    }
  }

  /**
   * Get admin profile
   */
  async getProfile(req, res) {
    // TODO: Implement proper user management in task 4.5
    const profile = {
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@djnuffjamz.com',
      role: 'administrator',
      lastLogin: new Date().toISOString(),
      permissions: [
        'manage_bookings',
        'manage_contacts', 
        'manage_gallery',
        'view_analytics',
        'system_admin'
      ]
    };
    
    this.sendSuccess(res, profile, 'Profile retrieved successfully');
  }

  /**
   * Update admin profile
   */
  async updateProfile(req, res) {
    // TODO: Implement proper profile update in task 4.5
    const { email, notifications } = req.body;
    
    const updatedProfile = {
      username: 'admin',
      email: email || process.env.ADMIN_EMAIL,
      notifications: notifications || {
        newBookings: true,
        urgentContacts: true,
        systemAlerts: true
      },
      updatedAt: new Date().toISOString()
    };
    
    this.sendSuccess(res, updatedProfile, 'Profile updated successfully');
  }

  /**
   * Get recent system activity
   */
  async getRecentActivity(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      
      // Get recent bookings and contacts
      const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .select('name eventType eventDate status createdAt')
        .lean();
      
      const recentContacts = await Contact.find()
        .sort({ createdAt: -1 })
        .limit(limit / 2)
        .select('name subject urgency status createdAt')
        .lean();
      
      // Combine and format activity feed
      const activity = [
        ...recentBookings.map(booking => ({
          id: booking._id,
          type: 'booking',
          title: `New ${booking.eventType} booking from ${booking.name}`,
          subtitle: `Event date: ${new Date(booking.eventDate).toLocaleDateString()}`,
          status: booking.status,
          timestamp: booking.createdAt,
          icon: 'calendar'
        })),
        ...recentContacts.map(contact => ({
          id: contact._id,
          type: 'contact',
          title: `${contact.urgency} priority message: ${contact.subject}`,
          subtitle: `From: ${contact.name}`,
          status: contact.status,
          timestamp: contact.createdAt,
          icon: 'message'
        }))
      ];
      
      // Sort by timestamp
      activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      this.sendSuccess(res, activity.slice(0, limit), 'Recent activity retrieved successfully');
    } catch (error) {
      console.error('Recent activity error:', error);
      this.sendError(res, 'Failed to retrieve recent activity', 500);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get booking trends
      const bookingTrends = await Booking.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: { $ifNull: ['$quotedPrice', 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      
      // Get event type distribution
      const eventTypeDistribution = await Booking.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Get contact urgency distribution
      const contactUrgencyDistribution = await Contact.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$urgency', count: { $sum: 1 } } }
      ]);
      
      const analytics = {
        period,
        dateRange: { startDate, endDate },
        bookingTrends,
        eventTypeDistribution,
        contactUrgencyDistribution,
        summary: {
          totalBookingsInPeriod: bookingTrends.reduce((sum, item) => sum + item.count, 0),
          totalRevenueInPeriod: bookingTrends.reduce((sum, item) => sum + item.revenue, 0),
          averageBookingsPerDay: bookingTrends.length > 0 ? 
            Math.round(bookingTrends.reduce((sum, item) => sum + item.count, 0) / bookingTrends.length) : 0
        }
      };
      
      this.sendSuccess(res, analytics, 'Analytics data retrieved successfully');
    } catch (error) {
      console.error('Analytics error:', error);
      this.sendError(res, 'Failed to retrieve analytics data', 500);
    }
  }

  /**
   * Get system health information
   */
  async getSystemHealth(req, res) {
    try {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        database: {
          status: 'connected', // TODO: Implement actual DB health check
          collections: {
            bookings: await Booking.countDocuments(),
            contacts: await Contact.countDocuments()
          }
        },
        version: {
          node: process.version,
          api: '1.0.0'
        }
      };
      
      this.sendSuccess(res, healthData, 'System health retrieved successfully');
    } catch (error) {
      console.error('System health error:', error);
      this.sendError(res, 'Failed to retrieve system health', 500);
    }
  }

  /**
   * Helper method to calculate response rate
   */
  calculateResponseRate(contactStats) {
    const total = contactStats.total;
    const responded = contactStats.byStatus.completed + contactStats.byStatus['in-progress'];
    return total > 0 ? Math.round((responded / total) * 100) : 0;
  }
}

module.exports = new AdminController();
