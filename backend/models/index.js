/**
 * Models Index - Central model management
 * Exports all model modules for easy importing
 */

const Photo = require('./Photo');
const Booking = require('./Booking');
const Contact = require('./Contact');
const User = require('./User');

module.exports = {
  Photo,
  Booking,
  Contact,
  User
};

