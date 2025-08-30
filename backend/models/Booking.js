/**
 * Booking Model
 * MongoDB schema for booking requests
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Client Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Event Details
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['wedding', 'corporate', 'private-party', 'birthday', 'anniversary', 'other']
  },
  
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  
  eventLocation: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    minlength: [5, 'Location must be at least 5 characters'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  
  guestCount: {
    type: String,
    required: [true, 'Guest count is required'],
    enum: ['1-25', '26-50', '51-100', '101-200', '201-500', '500+']
  },
  
  // Optional Details
  budget: {
    type: String,
    enum: ['under-1000', '1000-2500', '2500-5000', '5000-10000', '10000+', 'discuss']
  },
  
  musicPreferences: {
    type: String,
    trim: true,
    maxlength: [500, 'Music preferences cannot exceed 500 characters']
  },
  
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
  },
  
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  
  // Pricing
  quotedPrice: {
    type: Number,
    min: [0, 'Quoted price cannot be negative']
  },
  
  // Timeline
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for days until event
bookingSchema.virtual('daysUntilEvent').get(function() {
  const now = new Date();
  const diffTime = this.eventDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update timestamps
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get booking statistics
bookingSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Instance method to mark as responded
bookingSchema.methods.markAsResponded = function() {
  this.respondedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);

