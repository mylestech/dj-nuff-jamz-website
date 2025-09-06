/**
 * Authentication Configuration
 * JWT and session settings
 */

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dj-nuff-jamz-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'dj-nuff-jamz-api',
    algorithm: 'HS256'
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-change-in-production',
    name: 'djnj.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'changeme123!',
    email: process.env.ADMIN_EMAIL || 'admin@djnuffjamz.com'
  },
  
  apiKeys: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
  
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: {
      anonymous: 100,
      authenticated: 200,
      admin: 1000
    }
  },
  
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }
  }
};



