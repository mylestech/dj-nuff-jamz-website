/**
 * Enhanced Error Handler Middleware
 * Centralized error handling with proper logging and responses
 */

class ErrorHandler {
  constructor() {
    this.handleError = this.handleError.bind(this);
    this.handle404 = this.handle404.bind(this);
  }

  /**
   * Main error handling middleware
   */
  handleError(err, req, res, next) {
    // Set default error status
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error details
    this.logError(err, req);

    // Send error response based on environment
    if (process.env.NODE_ENV === 'development') {
      this.sendErrorDev(err, res);
    } else {
      this.sendErrorProd(err, res);
    }
  }

  /**
   * 404 handler
   */
  handle404(req, res) {
    const error = {
      success: false,
      message: 'Route not found',
      requestedUrl: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      availableEndpoints: [
        '/api',
        '/api/health',
        '/api/booking',
        '/api/contact',
        '/api/gallery',
        '/api/admin'
      ]
    };

    res.status(404).json(error);
  }

  /**
   * Log error details
   */
  logError(err, req) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      requestId: req.id,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.method !== 'GET' ? req.body : undefined,
        user: req.user ? req.user.username : 'anonymous',
        ip: req.ip
      }
    };

    // Log to console with colors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Details:', JSON.stringify(errorInfo, null, 2));
    } else {
      console.error('Error:', errorInfo.error.message, 'RequestID:', req.id);
    }
  }

  /**
   * Send error response in development
   */
  sendErrorDev(err, res) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        status: err.status,
        message: err.message,
        stack: err.stack,
        name: err.name
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send error response in production
   */
  sendErrorProd(err, res) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    } 
    // Programming or unknown error: don't leak error details
    else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle specific error types
   */
  handleCastErrorDB(err) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return this.createAppError(message, 400);
  }

  handleDuplicateFieldsDB(err) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return this.createAppError(message, 400);
  }

  handleValidationErrorDB(err) {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return this.createAppError(message, 400);
  }

  handleJWTError() {
    return this.createAppError('Invalid token. Please log in again!', 401);
  }

  handleJWTExpiredError() {
    return this.createAppError('Your token has expired! Please log in again.', 401);
  }

  /**
   * Create operational error
   */
  createAppError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    error.isOperational = true;
    return error;
  }

  /**
   * Async error wrapper
   */
  catchAsync(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  }
}

const errorHandler = new ErrorHandler();

module.exports = {
  handleError: errorHandler.handleError,
  handle404: errorHandler.handle404,
  catchAsync: errorHandler.catchAsync,
  createAppError: errorHandler.createAppError
};


