/**
 * Server Configuration
 * Express server settings and middleware configuration
 */

module.exports = {
  // Server settings
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Security settings
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://djnuffjamz.com', 'https://nuffjamz.com']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Body parser limits
  bodyParser: {
    json: { limit: '10mb' },
    urlencoded: { extended: true, limit: '10mb' }
  },
  
  // File upload settings
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3'
    ]
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'combined',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  }
};

