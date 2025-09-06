/**
 * Authentication Middleware
 * JWT-based authentication and authorization
 */

const jwt = require('jsonwebtoken');

class AuthMiddleware {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'dj-nuff-jamz-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {string} JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'dj-nuff-jamz-api'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Extract token from request headers
   * @param {Object} req - Express request object
   * @returns {string|null} Token or null
   */
  extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check for token in cookies (for browser requests)
    if (req.cookies && req.cookies.authToken) {
      return req.cookies.authToken;
    }
    
    return null;
  }

  /**
   * Middleware to require authentication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  requireAuth(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required',
          timestamp: new Date().toISOString()
        });
      }

      const decoded = this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Middleware to require admin role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  requireAdmin(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required',
          timestamp: new Date().toISOString()
        });
      }

      const decoded = this.verifyToken(token);
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString()
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Optional authentication middleware
   * Adds user to request if token is valid, but doesn't require it
   */
  optionalAuth(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const decoded = this.verifyToken(token);
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      // Invalid token, but continue without authentication
      req.user = null;
      next();
    }
  }

  /**
   * Rate limiting by user
   * Stricter limits for unauthenticated users
   */
  createUserRateLimit() {
    const rateLimit = require('express-rate-limit');
    
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: (req) => {
        // Authenticated users get higher limits
        if (req.user) {
          return req.user.role === 'admin' ? 1000 : 200;
        }
        // Unauthenticated users get lower limits
        return 100;
      },
      message: {
        success: false,
        message: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Skip rate limiting for admin users in development
      skip: (req) => {
        if (process.env.NODE_ENV === 'development' && req.user?.role === 'admin') {
          return true;
        }
        return false;
      }
    });
  }

  /**
   * API key authentication for external integrations
   */
  requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        message: 'Valid API key required',
        timestamp: new Date().toISOString()
      });
    }
    
    req.apiKey = apiKey;
    next();
  }

  /**
   * CSRF protection for state-changing operations
   */
  csrfProtection(req, res, next) {
    // Skip CSRF for API requests with valid tokens
    if (req.headers.authorization || req.headers['x-api-key']) {
      return next();
    }

    // For form submissions, check CSRF token
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionCsrf = req.session?.csrfToken;

    if (!csrfToken || csrfToken !== sessionCsrf) {
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
        timestamp: new Date().toISOString()
      });
    }

    next();
  }

  /**
   * Security headers middleware
   */
  securityHeaders(req, res, next) {
    // Remove powered-by header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "media-src 'self'"
    ].join('; '));
    
    next();
  }
}

// Export singleton instance
const authMiddleware = new AuthMiddleware();

module.exports = {
  generateToken: authMiddleware.generateToken.bind(authMiddleware),
  verifyToken: authMiddleware.verifyToken.bind(authMiddleware),
  requireAuth: authMiddleware.requireAuth.bind(authMiddleware),
  requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),
  optionalAuth: authMiddleware.optionalAuth.bind(authMiddleware),
  requireApiKey: authMiddleware.requireApiKey.bind(authMiddleware),
  csrfProtection: authMiddleware.csrfProtection.bind(authMiddleware),
  securityHeaders: authMiddleware.securityHeaders.bind(authMiddleware),
  createUserRateLimit: authMiddleware.createUserRateLimit.bind(authMiddleware)
};



