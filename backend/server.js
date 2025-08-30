/**
 * DJ Nuff Jamz Entertainment - Backend API Server
 * Main server file with Express.js setup
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
console.log('🔍 Environment check:', {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
});

const express = require('express');
const database = require('./config/database');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://djnuffjamz.com', 'https://nuffjamz.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'DJ Nuff Jamz Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'DJ Nuff Jamz Entertainment API',
    version: '1.0.0',
    description: 'Backend API for photo gallery management, form submissions, and content management',
    endpoints: {
      health: '/api/health',
      gallery: '/api/gallery',
      booking: '/api/booking',
      contact: '/api/contact',
      admin: '/api/admin',
      music: '/api/music'
    }
  });
});

// Route imports - modular routing structure
const galleryRoutes = require('./routes/gallery');
const bookingRoutes = require('./routes/booking');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const musicRoutes = require('./routes/music');
const testimonialsRoutes = require('./routes/testimonials');
const calendarRoutes = require('./routes/calendar');
const emailRoutes = require('./routes/email');
const analyticsRoutes = require('./routes/analytics');

// Mount routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    requestedUrl: req.originalUrl,
    availableEndpoints: ['/api', '/api/health', '/api/gallery', '/api/booking', '/api/contact', '/api/admin', '/api/music']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 DJ Nuff Jamz Backend API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 API info: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
