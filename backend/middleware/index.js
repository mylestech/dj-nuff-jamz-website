/**
 * Middleware Index - Central middleware management
 * Exports all middleware modules for easy importing
 */

const auth = require('./auth');
const validation = require('./validation');
const upload = require('./upload');
const errorHandler = require('./errorHandler');
const logger = require('./logger');

module.exports = {
  auth,
  validation,
  upload,
  errorHandler,
  logger
};

