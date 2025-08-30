/**
 * Routes Index - Central route management
 * Exports all route modules for easy importing
 */

const galleryRoutes = require('./gallery');
const bookingRoutes = require('./booking');
const contactRoutes = require('./contact');
const adminRoutes = require('./admin');
const musicRoutes = require('./music');
const testimonialsRoutes = require('./testimonials');
const calendarRoutes = require('./calendar');
const emailRoutes = require('./email');
const analyticsRoutes = require('./analytics');

module.exports = {
  gallery: galleryRoutes,
  booking: bookingRoutes,
  contact: contactRoutes,
  admin: adminRoutes,
  music: musicRoutes,
  testimonials: testimonialsRoutes,
  calendar: calendarRoutes,
  email: emailRoutes,
  analytics: analyticsRoutes
};

