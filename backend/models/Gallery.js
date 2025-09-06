/**
 * Gallery Model
 * MongoDB schema for photo gallery items
 */

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Gallery item title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Event Information
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      'wedding', 'corporate', 'private-party', 'birthday', 
      'anniversary', 'club-night', 'festival', 'concert', 
      'radio-show', 'studio-session', 'other'
    ]
  },
  
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [200, 'Venue name cannot exceed 200 characters']
  },
  
  location: {
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'USA'
    }
  },
  
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  
  // Image Information
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  },
  
  thumbnailUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Thumbnail URL cannot exceed 500 characters']
  },
  
  // Image Metadata
  imageFormat: {
    type: String,
    enum: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    default: 'jpg'
  },
  
  imageSize: {
    type: Number, // Size in bytes
    min: [0, 'Image size cannot be negative']
  },
  
  dimensions: {
    width: {
      type: Number,
      min: [1, 'Width must be at least 1 pixel']
    },
    height: {
      type: Number,
      min: [1, 'Height must be at least 1 pixel']
    }
  },
  
  // Photographer/Credit Information
  photographer: {
    type: String,
    trim: true,
    maxlength: [100, 'Photographer name cannot exceed 100 characters']
  },
  
  photographerCredit: {
    type: String,
    trim: true,
    maxlength: [200, 'Photographer credit cannot exceed 200 characters']
  },
  
  // Categorization
  category: {
    type: String,
    enum: ['action', 'crowd', 'setup', 'venue', 'dj-booth', 'equipment', 'behind-scenes', 'promotional'],
    default: 'action'
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Visibility and Features
  isPublic: {
    type: Boolean,
    default: true
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  isPortfolio: {
    type: Boolean,
    default: false // Whether to show in main portfolio
  },
  
  // Engagement
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  
  downloads: {
    type: Number,
    default: 0,
    min: [0, 'Downloads cannot be negative']
  },
  
  // SEO
  altText: {
    type: String,
    trim: true,
    maxlength: [200, 'Alt text cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters']
  },
  
  // Client Information (if applicable)
  clientName: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  
  isClientApproved: {
    type: Boolean,
    default: false
  },
  
  // Social Media
  instagramPostId: {
    type: String,
    trim: true
  },
  
  facebookPostId: {
    type: String,
    trim: true
  },
  
  // Ordering
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastViewed: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
gallerySchema.index({ eventType: 1 });
gallerySchema.index({ eventDate: -1 });
gallerySchema.index({ featured: -1, createdAt: -1 });
gallerySchema.index({ isPublic: 1, isPortfolio: 1 });
gallerySchema.index({ views: -1 });
gallerySchema.index({ venue: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ tags: 1 });
gallerySchema.index({ sortOrder: 1, createdAt: -1 });

// Text search index
gallerySchema.index({
  title: 'text',
  description: 'text',
  venue: 'text',
  tags: 'text'
});

// Compound indexes
gallerySchema.index({ eventType: 1, eventDate: -1 });
gallerySchema.index({ isPublic: 1, featured: -1, eventDate: -1 });

// Virtual for image size in MB
gallerySchema.virtual('imageSizeMB').get(function() {
  if (!this.imageSize) return null;
  return Math.round((this.imageSize / (1024 * 1024)) * 100) / 100;
});

// Virtual for formatted event date
gallerySchema.virtual('formattedEventDate').get(function() {
  return this.eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for full location
gallerySchema.virtual('fullLocation').get(function() {
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country && this.location.country !== 'USA') {
    parts.push(this.location.country);
  }
  return parts.join(', ');
});

// Pre-save middleware
gallerySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Auto-generate alt text if not provided
  if (!this.altText && this.title) {
    this.altText = `DJ Nuff Jamz performing at ${this.venue} - ${this.title}`;
  }
  
  next();
});

// Static method to get gallery statistics
gallerySchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalImages: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        featuredCount: { 
          $sum: { $cond: ['$featured', 1, 0] } 
        },
        portfolioCount: { 
          $sum: { $cond: ['$isPortfolio', 1, 0] } 
        }
      }
    }
  ]);
  
  const eventTypeStats = await this.aggregate([
    { $group: { _id: '$eventType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const categoryStats = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    overview: stats[0] || {
      totalImages: 0,
      totalViews: 0,
      totalLikes: 0,
      featuredCount: 0,
      portfolioCount: 0
    },
    eventTypeBreakdown: eventTypeStats,
    categoryBreakdown: categoryStats
  };
};

// Static method to get featured gallery items
gallerySchema.statics.getFeatured = function(limit = 12) {
  return this.find({ featured: true, isPublic: true })
    .sort({ sortOrder: 1, eventDate: -1 })
    .limit(limit);
};

// Static method to get portfolio items
gallerySchema.statics.getPortfolio = function(limit = 20) {
  return this.find({ isPortfolio: true, isPublic: true })
    .sort({ sortOrder: 1, eventDate: -1 })
    .limit(limit);
};

// Static method to get recent items
gallerySchema.statics.getRecent = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ eventDate: -1, createdAt: -1 })
    .limit(limit);
};

// Instance method to increment view count
gallerySchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Instance method to toggle featured status
gallerySchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

// Instance method to toggle portfolio status
gallerySchema.methods.togglePortfolio = function() {
  this.isPortfolio = !this.isPortfolio;
  return this.save();
};

module.exports = mongoose.model('Gallery', gallerySchema);


