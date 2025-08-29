/**
 * Base Controller Class
 * Provides common functionality for all controllers
 */

class BaseController {
  constructor() {
    this.sendSuccess = this.sendSuccess.bind(this);
    this.sendError = this.sendError.bind(this);
    this.sendNotFound = this.sendNotFound.bind(this);
    this.sendValidationError = this.sendValidationError.bind(this);
  }

  /**
   * Send successful response
   * @param {Object} res - Express response object
   * @param {*} data - Data to send
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {*} error - Error details (only in development)
   */
  sendError(res, message = 'Internal Server Error', statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    // Include error details in development
    if (process.env.NODE_ENV !== 'production' && error) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} resource - Resource that was not found
   */
  sendNotFound(res, resource = 'Resource') {
    return this.sendError(res, `${resource} not found`, 404);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   */
  sendValidationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Async error handler wrapper
   * @param {Function} fn - Controller function
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = BaseController;

