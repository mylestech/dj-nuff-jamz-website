/**
 * Environment Configuration
 * Centralized environment variable management with validation
 */

const path = require('path');

class EnvironmentConfig {
  constructor() {
    this.loadEnvironment();
    this.validateRequired();
  }

  loadEnvironment() {
    // Load environment variables
    require('dotenv').config({
      path: path.join(__dirname, '../.env')
    });

    this.config = {
      // Server Configuration
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: parseInt(process.env.PORT, 10) || 3001,
      
      // Database Configuration
      MONGODB_URI: process.env.MONGODB_URI || this.buildMongoUri(),
      
      // Authentication & Security
      JWT_SECRET: process.env.JWT_SECRET || 'dj-nuff-jamz-secret-change-in-production',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
      SESSION_SECRET: process.env.SESSION_SECRET || 'session-secret-change-in-production',
      
      // Admin Configuration
      ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'changeme123!',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@djnuffjamz.com',
      
      // API Keys
      API_KEYS: process.env.API_KEYS ? process.env.API_KEYS.split(',') : [],
      
      // Email Configuration
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      BUSINESS_EMAIL: process.env.BUSINESS_EMAIL || 'info@djnuffjamz.com',
      
      // SMTP Configuration
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_SECURE: process.env.SMTP_SECURE === 'true',
      
      // File Upload & Storage
      UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE || '10mb',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'djnuffjamz-uploads',
      AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      
      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      LOG_FILE_MAX_SIZE: process.env.LOG_FILE_MAX_SIZE || '10mb',
      LOG_MAX_FILES: parseInt(process.env.LOG_MAX_FILES, 10) || 5,
      
      // Security
      BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
      MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
      LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION, 10) || 30 * 60 * 1000,
      
      // Rate Limiting
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000,
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
      
      // Feature Flags
      ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED !== 'false',
      PERFORMANCE_MONITORING: process.env.PERFORMANCE_MONITORING !== 'false',
      DEBUG: process.env.DEBUG === 'true',
      MOCK_EMAIL: process.env.MOCK_EMAIL === 'true' || this.isDevelopment(),
      MOCK_PAYMENTS: process.env.MOCK_PAYMENTS === 'true' || this.isDevelopment(),
      
      // External Services
      GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY
    };
  }

  buildMongoUri() {
    const host = process.env.MONGODB_HOST || 'localhost';
    const port = process.env.MONGODB_PORT || '27017';
    const database = process.env.MONGODB_DATABASE || 'djnuffjamz';
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;

    if (username && password) {
      return `mongodb://${username}:${password}@${host}:${port}/${database}`;
    }
    
    return `mongodb://${host}:${port}/${database}`;
  }

  validateRequired() {
    const requiredInProduction = [
      'JWT_SECRET',
      'SESSION_SECRET',
      'ADMIN_PASSWORD'
    ];

    if (this.isProduction()) {
      const missing = requiredInProduction.filter(key => !this.config[key] || this.config[key] === 'changeme123!' || this.config[key].includes('change-in-production'));
      
      if (missing.length > 0) {
        console.error('❌ Missing required environment variables for production:');
        missing.forEach(key => console.error(`   - ${key}`));
        process.exit(1);
      }
    }
  }

  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  isTest() {
    return this.config.NODE_ENV === 'test';
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }

  // Database configuration
  getDatabaseConfig() {
    return {
      uri: this.config.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0
      }
    };
  }

  // Email configuration
  getEmailConfig() {
    if (this.config.SENDGRID_API_KEY) {
      return {
        provider: 'sendgrid',
        apiKey: this.config.SENDGRID_API_KEY,
        from: this.config.BUSINESS_EMAIL
      };
    }

    if (this.config.SMTP_HOST) {
      return {
        provider: 'smtp',
        host: this.config.SMTP_HOST,
        port: this.config.SMTP_PORT,
        secure: this.config.SMTP_SECURE,
        auth: {
          user: this.config.SMTP_USER,
          pass: this.config.SMTP_PASS
        },
        from: this.config.BUSINESS_EMAIL
      };
    }

    return {
      provider: 'mock',
      from: this.config.BUSINESS_EMAIL
    };
  }

  // AWS configuration
  getAWSConfig() {
    return {
      accessKeyId: this.config.AWS_ACCESS_KEY_ID,
      secretAccessKey: this.config.AWS_SECRET_ACCESS_KEY,
      region: this.config.AWS_REGION,
      bucket: this.config.AWS_BUCKET_NAME
    };
  }

  // Print configuration summary
  printSummary() {
    console.log('⚙️  Environment Configuration:');
    console.log(`   📍 Environment: ${this.config.NODE_ENV}`);
    console.log(`   🌐 Port: ${this.config.PORT}`);
    console.log(`   🗄️  Database: ${this.config.MONGODB_URI.replace(/:[^:]*@/, ':***@')}`);
    console.log(`   📧 Email: ${this.getEmailConfig().provider}`);
    console.log(`   🔐 Auth: JWT (${this.config.JWT_EXPIRES_IN})`);
    console.log(`   📊 Debug: ${this.config.DEBUG}`);
    
    if (this.isProduction()) {
      console.log('   🔒 Production security checks: ✅');
    }
  }
}

// Export singleton instance
module.exports = new EnvironmentConfig();

