/**
 * Configuration Index - Central configuration management
 * Exports all configuration modules
 */

const database = require('./database');
const server = require('./server');
const auth = require('./auth');
const storage = require('./storage');

module.exports = {
  database,
  server,
  auth,
  storage
};


