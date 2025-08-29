/**
 * Controllers Index - Central controller management
 * Exports all controller modules for easy importing
 */

const galleryController = require('./galleryController');
const bookingController = require('./bookingController');
const contactController = require('./contactController');
const adminController = require('./adminController');

module.exports = {
  gallery: galleryController,
  booking: bookingController,
  contact: contactController,
  admin: adminController
};

