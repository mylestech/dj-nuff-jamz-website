/**
 * Contact Model
 * MongoDB schema for contact form submissions
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Contact Information
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
    trim: true
  },
  
  // Message Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    minlength: [5, 'Subject must be at least 5 characters'],
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Admin Response
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [2000, 'Admin response cannot exceed 2000 characters']
  },
  
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
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
  },
  
  // Metadata
  ipAddress: {
    type: String
  },
  
  userAgent: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contactSchema.index({ status: 1 });
contactSchema.index({ urgency: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
  if (!this.respondedAt) return null;
  
  const diffTime = this.respondedAt - this.createdAt;
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
});

// Pre-save middleware to update timestamps
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const urgencyStats = await this.aggregate([
    {
      $group: {
        _id: '$urgency',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    byStatus: {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    },
    byUrgency: {
      low: 0,
      medium: 0,
      high: 0
    }
  };
  
  stats.forEach(stat => {
    result.byStatus[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  urgencyStats.forEach(stat => {
    result.byUrgency[stat._id] = stat.count;
  });
  
  return result;
};

// Instance method to mark as responded
contactSchema.methods.markAsResponded = function() {
  this.respondedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);

