# DJ Nuff Jamz Backend Architecture

## Overview
This backend follows the MVC (Model-View-Controller) pattern with a modular structure for scalability and maintainability.

## Directory Structure
```
backend/
├── server.js                 # Main server entry point
├── config/                   # Configuration files
│   ├── index.js             # Config exports
│   ├── database.js          # MongoDB configuration
│   ├── server.js            # Server settings
│   ├── auth.js              # Authentication config (TODO)
│   └── storage.js           # File storage config (TODO)
├── controllers/             # Business logic
│   ├── index.js            # Controller exports
│   ├── BaseController.js   # Base controller class
│   ├── galleryController.js # Photo gallery operations
│   ├── bookingController.js # Booking management
│   ├── contactController.js # Contact form handling
│   └── adminController.js  # Admin operations
├── routes/                  # API route definitions
│   ├── index.js            # Route exports
│   ├── gallery.js          # Gallery endpoints
│   ├── booking.js          # Booking endpoints
│   ├── contact.js          # Contact endpoints
│   └── admin.js            # Admin endpoints
├── models/                  # Database models (TODO)
│   ├── index.js            # Model exports
│   ├── Photo.js            # Photo model
│   ├── Booking.js          # Booking model
│   ├── Contact.js          # Contact model
│   └── User.js             # User model
├── middleware/              # Custom middleware (TODO)
│   ├── index.js            # Middleware exports
│   ├── auth.js             # Authentication middleware
│   ├── validation.js       # Input validation
│   ├── upload.js           # File upload handling
│   ├── errorHandler.js     # Error handling
│   └── logger.js           # Request logging
├── utils/                   # Utility functions (TODO)
│   ├── index.js            # Utility exports
│   ├── imageProcessor.js   # Image processing
│   ├── emailService.js     # Email notifications
│   ├── helpers.js          # General helpers
│   └── validators.js       # Validation functions
└── tests/                   # Test files (TODO)
```

## API Endpoints

### Core Endpoints
- `GET /api` - API information and available endpoints
- `GET /api/health` - Health check endpoint

### Gallery Endpoints (`/api/gallery`)
- `GET /` - Get all photos
- `GET /:id` - Get single photo
- `POST /` - Upload new photo (admin only)
- `PUT /:id` - Update photo details (admin only)
- `DELETE /:id` - Delete photo (admin only)
- `GET /category/:category` - Get photos by category

### Booking Endpoints (`/api/booking`)
- `POST /` - Submit booking request
- `GET /` - Get all bookings (admin only)
- `GET /:id` - Get single booking (admin only)
- `PUT /:id/status` - Update booking status (admin only)
- `DELETE /:id` - Delete booking (admin only)

### Contact Endpoints (`/api/contact`)
- `POST /` - Submit contact form
- `GET /` - Get all contact submissions (admin only)
- `GET /:id` - Get single contact submission (admin only)
- `PUT /:id/status` - Update contact status (admin only)
- `DELETE /:id` - Delete contact submission (admin only)

### Admin Endpoints (`/api/admin`)
- `POST /login` - Admin login
- `POST /logout` - Admin logout
- `GET /dashboard` - Get dashboard statistics
- `GET /profile` - Get admin profile
- `PUT /profile` - Update admin profile

## Base Controller Pattern
All controllers extend the `BaseController` class which provides:
- Standardized response formats
- Error handling
- Success responses
- Validation error responses
- Async error wrapper

## Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Features
- CORS protection with environment-specific origins
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for security headers
- Request body size limits
- Environment-based error disclosure

## Environment Variables
See `.env.example` for required environment variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- Additional config as needed

## Implementation Status
- ✅ **Task 4.1**: Node.js project initialization
- ✅ **Task 4.2**: Project architecture design and implementation
- 🟡 **Task 4.3**: Form submission API endpoints (controllers created, implementation pending)
- 🟡 **Task 4.4**: Content management API (basic structure ready)
- ✅ **Task 4.5**: Security middleware (partially implemented)
- ✅ **Task 4.6**: Logging and error handling (implemented)
- 🟡 **Task 4.7**: Environment configuration (basic setup ready)
- 🟡 **Task 4.8**: Photo gallery management API (structure ready)
- 🟡 **Task 4.9**: Testing framework setup (pending)
- 🟡 **Task 4.10**: API documentation (this file + pending full docs)

## Next Steps
1. Implement database models and connections
2. Add authentication middleware
3. Implement actual controller logic
4. Add input validation
5. Set up file upload handling
6. Add comprehensive testing
7. Complete API documentation

