/**
 * Testimonial Model
 * Represents client testimonials and reviews
 */

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  
  clientTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Client title cannot exceed 100 characters']
  },
  
  companyName: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  testimonial: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true,
    maxlength: [1000, 'Testimonial cannot exceed 1000 characters']
  },
  
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 5
  },
  
  eventType: {
    type: String,
    enum: ['wedding', 'corporate', 'private_party', 'club', 'festival', 'other'],
    default: 'other'
  },
  
  eventDate: {
    type: Date
  },
  
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  clientPhone: {
    type: String,
    trim: true
  },
  
  clientLogo: {
    type: String, // URL to client's company logo
    trim: true
  },
  
  clientWebsite: {
    type: String,
    trim: true
  },
  
  approved: {
    type: Boolean,
    default: false
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'Nigeria'
    }
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Admin notes (not displayed publicly)
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Source of the testimonial
  source: {
    type: String,
    enum: ['website_form', 'email', 'social_media', 'phone', 'in_person', 'other'],
    default: 'website_form'
  },
  
  // Consent for public display
  consentGiven: {
    type: Boolean,
    default: false
  },
  
  // SEO and display settings
  seoTitle: {
    type: String,
    trim: true
  },
  
  seoDescription: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
testimonialSchema.index({ approved: 1, featured: -1, displayOrder: 1 });
testimonialSchema.index({ eventType: 1, approved: 1 });
testimonialSchema.index({ rating: -1, approved: 1 });
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ clientName: 'text', testimonial: 'text', companyName: 'text' });

// Virtual for full client name with title
testimonialSchema.virtual('fullClientName').get(function() {
  if (this.clientTitle && this.companyName) {
    return `${this.clientName}, ${this.clientTitle} at ${this.companyName}`;
  } else if (this.clientTitle) {
    return `${this.clientName}, ${this.clientTitle}`;
  } else if (this.companyName) {
    return `${this.clientName} from ${this.companyName}`;
  }
  return this.clientName;
});

// Virtual for display location
testimonialSchema.virtual('displayLocation').get(function() {
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country && this.location.country !== 'Nigeria') {
    parts.push(this.location.country);
  }
  return parts.join(', ') || 'Nigeria';
});

// Static methods
testimonialSchema.statics.getApproved = function(limit = 10) {
  return this.find({ approved: true })
    .sort({ featured: -1, displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .select('-adminNotes -clientEmail -clientPhone');
};

testimonialSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ approved: true, featured: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .select('-adminNotes -clientEmail -clientPhone');
};

testimonialSchema.statics.getByEventType = function(eventType, limit = 10) {
  return this.find({ approved: true, eventType })
    .sort({ featured: -1, displayOrder: 1, createdAt: -1 })
    .limit(limit)
    .select('-adminNotes -clientEmail -clientPhone');
};

testimonialSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: ['$approved', 1, 0] } },
        featured: { $sum: { $cond: ['$featured', 1, 0] } },
        pending: { $sum: { $cond: [{ $not: '$approved' }, 1, 0] } },
        averageRating: { $avg: '$rating' }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        approved: 1,
        featured: 1,
        pending: 1,
        averageRating: { $round: ['$averageRating', 1] }
      }
    }
  ]);
};

testimonialSchema.statics.getEventTypeStats = function() {
  return this.aggregate([
    { $match: { approved: true } },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    },
    {
      $project: {
        eventType: '$_id',
        count: 1,
        averageRating: { $round: ['$averageRating', 1] },
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance methods
testimonialSchema.methods.approve = function() {
  this.approved = true;
  return this.save();
};

testimonialSchema.methods.feature = function() {
  this.featured = true;
  this.approved = true; // Featured testimonials must be approved
  return this.save();
};

testimonialSchema.methods.unfeature = function() {
  this.featured = false;
  return this.save();
};

// Pre-save middleware
testimonialSchema.pre('save', function(next) {
  // Auto-approve high-rated testimonials from verified sources
  if (this.rating >= 5 && this.source === 'website_form' && this.consentGiven) {
    this.approved = true;
  }
  
  // Ensure featured testimonials are approved
  if (this.featured && !this.approved) {
    this.approved = true;
  }
  
  // Generate SEO fields if not provided
  if (!this.seoTitle && this.clientName && this.companyName) {
    this.seoTitle = `${this.clientName} from ${this.companyName} - DJ Nuff Jamz Testimonial`;
  }
  
  if (!this.seoDescription && this.testimonial) {
    this.seoDescription = this.testimonial.substring(0, 150) + (this.testimonial.length > 150 ? '...' : '');
  }
  
  next();
});

// Post-save middleware for logging
testimonialSchema.post('save', function(doc) {
  console.log(`Testimonial ${doc.approved ? 'approved' : 'saved'}: ${doc.clientName} - ${doc.rating} stars`);
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
