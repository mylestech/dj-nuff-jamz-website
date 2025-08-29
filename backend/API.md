# DJ Nuff Jamz Backend API Documentation

## Overview
RESTful API for DJ Nuff Jamz Entertainment website, providing endpoints for booking management, contact forms, photo gallery, and admin operations.

**Base URL:** `http://localhost:3001/api`  
**Version:** 1.0.0  
**Authentication:** JWT Bearer Token (for admin endpoints)

## Authentication

### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Using Authentication
Include the JWT token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Core Endpoints

### Health Check
```http
GET /api/health
```

### API Information
```http
GET /api
```

## Booking Endpoints

### Submit Booking Request
```http
POST /api/booking
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "eventType": "wedding",
  "eventDate": "2024-06-15",
  "eventLocation": "Central Park, NYC",
  "guestCount": 100,
  "budget": 5000,
  "musicPreferences": "Jazz and R&B",
  "specialRequests": "Need wireless microphone setup",
  "contactMethod": "both"
}
```

### Get All Bookings (Admin)
```http
GET /api/booking?page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

### Get Single Booking (Admin)
```http
GET /api/booking/{id}
Authorization: Bearer <token>
```

### Update Booking Status (Admin)
```http
PUT /api/booking/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "adminNotes": "Confirmed for June 15th",
  "quotedPrice": 4500
}
```

### Get Booking Statistics (Admin)
```http
GET /api/booking/stats
Authorization: Bearer <token>
```

## Contact Endpoints

### Submit Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "subject": "Inquiry about DJ services",
  "message": "Hi, I would like to know more about your DJ services for my corporate event.",
  "urgency": "medium"
}
```

### Get All Contacts (Admin)
```http
GET /api/contact?page=1&limit=10&status=pending&urgency=high
Authorization: Bearer <token>
```

### Get Single Contact (Admin)
```http
GET /api/contact/{id}
Authorization: Bearer <token>
```

### Update Contact Status (Admin)
```http
PUT /api/contact/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "adminResponse": "Thank you for your inquiry. We will send you a detailed quote shortly.",
  "adminNotes": "Interested in corporate package"
}
```

### Get Contact Statistics (Admin)
```http
GET /api/contact/stats
Authorization: Bearer <token>
```

## Gallery Endpoints

### Get All Photos
```http
GET /api/gallery?category=wedding&limit=20
```

### Upload Photo (Admin)
```http
POST /api/gallery
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Wedding at Central Park",
  "description": "Beautiful outdoor wedding ceremony",
  "category": "wedding",
  "tags": ["outdoor", "ceremony", "elegant"],
  "file": <image-file>
}
```

### Get Photos by Category
```http
GET /api/gallery/category/wedding
```

## Admin Endpoints

### Get Dashboard Data
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

**Response includes:**
- Overview statistics (bookings, contacts, revenue)
- Recent activity feed
- Upcoming events
- Quick stats (conversion rates, response times)
- System information

### Get Recent Activity
```http
GET /api/admin/activity?limit=20
Authorization: Bearer <token>
```

### Get Analytics
```http
GET /api/admin/analytics?period=30d
Authorization: Bearer <token>
```

### Get System Health
```http
GET /api/admin/health
Authorization: Bearer <token>
```

### Get Admin Profile
```http
GET /api/admin/profile
Authorization: Bearer <token>
```

### Update Admin Profile
```http
PUT /api/admin/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "admin@djnuffjamz.com",
  "notifications": {
    "newBookings": true,
    "urgentContacts": true,
    "systemAlerts": true
  }
}
```

## Response Format

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

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation failed
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

## Rate Limiting

- **Anonymous users:** 100 requests per 15 minutes
- **Authenticated users:** 200 requests per 15 minutes  
- **Admin users:** 1000 requests per 15 minutes

## Field Validation

### Booking Fields
- **name:** 2-100 characters, letters/spaces/hyphens/apostrophes only
- **email:** Valid email format
- **phone:** Valid phone number
- **eventType:** One of: wedding, corporate, private-party, birthday, anniversary, other
- **eventDate:** Future date in ISO format
- **eventLocation:** 5-200 characters
- **guestCount:** 1-10,000
- **budget:** Positive number (optional)
- **musicPreferences:** Max 500 characters (optional)
- **specialRequests:** Max 1000 characters (optional)

### Contact Fields
- **name:** 2-100 characters, letters/spaces/hyphens/apostrophes only
- **email:** Valid email format
- **phone:** Valid phone number (optional)
- **subject:** 5-200 characters
- **message:** 10-2000 characters
- **urgency:** One of: low, medium, high (optional)

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Insufficient permissions |
| VALID_001 | Validation failed |
| RATE_001 | Rate limit exceeded |
| DB_001 | Database connection error |
| FILE_001 | File upload error |

## WebSocket Events (Future)
*Coming in v2.0 - Real-time notifications for admin dashboard*

## Changelog

### v1.0.0 (Current)
- Initial API release
- Booking and contact management
- Admin dashboard
- Photo gallery (basic)
- JWT authentication
- Rate limiting
- Input validation
- Email notifications (logging)

