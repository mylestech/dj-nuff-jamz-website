/**
 * Models Index - Central model management
 * Exports all model modules for easy importing
 */

const Booking = require('./Booking');
const Contact = require('./Contact');
const Music = require('./Music');
const Gallery = require('./Gallery');
const Testimonial = require('./Testimonial');

module.exports = {
  Booking,
  Contact,
  Music,
  Gallery,
  Testimonial
};

