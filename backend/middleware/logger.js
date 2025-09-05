/**
 * Enhanced Logging Middleware
 * Custom logging with request tracking and error handling
 */

const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

class LoggerMiddleware {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  createAccessLogStream() {
    const logFile = path.join(this.logDir, 'access.log');
    return fs.createWriteStream(logFile, { flags: 'a' });
  }

  createErrorLogStream() {
    const logFile = path.join(this.logDir, 'error.log');
    return fs.createWriteStream(logFile, { flags: 'a' });
  }

  // Custom format with request ID and user info
  createCustomFormat() {
    return morgan((tokens, req, res) => {
      const log = [
        tokens.date(req, res, 'iso'),
        `[${req.id || 'no-id'}]`,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length') || '-',
        tokens['response-time'](req, res) + 'ms',
        req.user ? `user:${req.user.username}` : 'anonymous',
        req.ip
      ];
      return log.join(' ');
    });
  }

  // Request ID middleware
  addRequestId(req, res, next) {
    req.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    res.setHeader('X-Request-ID', req.id);
    next();
  }

  // Error logging middleware
  logErrors(err, req, res, next) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      requestId: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      user: req.user ? req.user.username : 'anonymous',
      error: {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        status: err.status || 500
      }
    };

    // Write to error log file
    const errorStream = this.createErrorLogStream();
    errorStream.write(JSON.stringify(errorLog) + '\n');
    errorStream.end();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error:', errorLog);
    }

    next(err);
  }

  // Security event logger
  logSecurityEvent(event, req, additionalData = {}) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.username : 'anonymous',
      url: req.url,
      method: req.method,
      ...additionalData
    };

    const logFile = path.join(this.logDir, 'security.log');
    fs.appendFileSync(logFile, JSON.stringify(securityLog) + '\n');

    // Alert in production for critical events
    if (process.env.NODE_ENV === 'production' && 
        ['auth_failure', 'admin_access', 'suspicious_activity'].includes(event)) {
      console.warn('🚨 Security Event:', securityLog);
    }
  }

  // Performance monitoring
  performanceLogger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // Log slow requests
      if (duration > 5000) { // 5 seconds
        const slowLog = {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          method: req.method,
          url: req.url,
          duration,
          status: res.statusCode,
          user: req.user ? req.user.username : 'anonymous'
        };

        const logFile = path.join(this.logDir, 'slow.log');
        fs.appendFileSync(logFile, JSON.stringify(slowLog) + '\n');
      }
    });

    next();
  }
}

const logger = new LoggerMiddleware();

module.exports = {
  addRequestId: logger.addRequestId.bind(logger),
  createCustomFormat: logger.createCustomFormat.bind(logger),
  createAccessLogStream: logger.createAccessLogStream.bind(logger),
  logErrors: logger.logErrors.bind(logger),
  logSecurityEvent: logger.logSecurityEvent.bind(logger),
  performanceLogger: logger.performanceLogger.bind(logger)
};


