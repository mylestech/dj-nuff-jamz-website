/**
 * Routes Index - Central route management
 * Exports all route modules for easy importing
 */

const galleryRoutes = require('./gallery');
const bookingRoutes = require('./booking');
const contactRoutes = require('./contact');
const adminRoutes = require('./admin');

module.exports = {
  gallery: galleryRoutes,
  booking: bookingRoutes,
  contact: contactRoutes,
  admin: adminRoutes
};

