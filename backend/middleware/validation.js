/**
 * Validation Middleware
 * Input validation for all API endpoints
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Booking form validation rules
 */
const validateBooking = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('phone')
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
    
  body('eventType')
    .trim()
    .isIn(['wedding', 'corporate', 'private-party', 'birthday', 'anniversary', 'other'])
    .withMessage('Please select a valid event type'),
    
  body('eventDate')
    .isISO8601()
    .withMessage('Please provide a valid event date')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      return true;
    }),
    
  body('eventLocation')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Event location must be between 5 and 200 characters'),
    
  body('guestCount')
    .trim()
    .isIn(['1-25', '26-50', '51-100', '101-200', '201-500', '500+'])
    .withMessage('Please select a valid guest count range'),
    
  body('budget')
    .optional()
    .trim()
    .isIn(['under-1000', '1000-2500', '2500-5000', '5000-10000', '10000+', 'discuss'])
    .withMessage('Please select a valid budget range'),
    
  body('musicPreferences')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Music preferences cannot exceed 500 characters'),
    
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),
    
  body('contactMethod')
    .optional()
    .isIn(['email', 'phone', 'both'])
    .withMessage('Contact method must be email, phone, or both'),
    
  handleValidationErrors
];

/**
 * Contact form validation rules
 */
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
    
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
    
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Urgency must be low, medium, or high'),
    
  handleValidationErrors
];

/**
 * Admin login validation rules
 */
const validateAdminLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
    
  handleValidationErrors
];

/**
 * Photo upload validation rules
 */
const validatePhotoUpload = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Photo title must be between 2 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('category')
    .trim()
    .isIn(['wedding', 'corporate', 'private-party', 'birthday', 'anniversary', 'other'])
    .withMessage('Please select a valid category'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
    
  handleValidationErrors
];

/**
 * Status update validation
 */
const validateStatusUpdate = [
  body('status')
    .trim()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'in-progress'])
    .withMessage('Invalid status value'),
    
  handleValidationErrors
];

module.exports = {
  validateBooking,
  validateContact,
  validateAdminLogin,
  validatePhotoUpload,
  validateId,
  validateStatusUpdate,
  handleValidationErrors
};

