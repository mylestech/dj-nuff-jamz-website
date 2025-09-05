/**
 * Music Model
 * MongoDB schema for DJ's music catalog
 */

const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  // Basic Track Information
  title: {
    type: String,
    required: [true, 'Track title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  
  // Track Details
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: [
      'house', 'techno', 'trance', 'deep-house', 'progressive', 
      'hip-hop', 'r&b', 'pop', 'rock', 'edm', 'dubstep', 
      'reggae', 'latin', 'afrobeat', 'jazz', 'funk', 'disco', 'other'
    ]
  },
  
  subGenre: {
    type: String,
    trim: true,
    maxlength: [50, 'Sub-genre cannot exceed 50 characters']
  },
  
  bpm: {
    type: Number,
    min: [60, 'BPM must be at least 60'],
    max: [200, 'BPM cannot exceed 200']
  },
  
  key: {
    type: String,
    trim: true,
    maxlength: [10, 'Key cannot exceed 10 characters'],
    // Examples: "A", "Dm", "C#", "Bb"
  },
  
  duration: {
    type: Number, // Duration in seconds
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 second'],
    max: [3600, 'Duration cannot exceed 1 hour'] // 1 hour max
  },
  
  // File Information
  audioUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Audio URL cannot exceed 500 characters']
  },
  
  fileFormat: {
    type: String,
    enum: ['mp3', 'wav', 'flac', 'm4a', 'aac'],
    default: 'mp3'
  },
  
  fileSize: {
    type: Number, // Size in bytes
    min: [0, 'File size cannot be negative']
  },
  
  // Mix/DJ Specific
  mixType: {
    type: String,
    enum: ['original', 'remix', 'mashup', 'live-mix', 'radio-edit', 'extended'],
    default: 'original'
  },
  
  isExplicit: {
    type: Boolean,
    default: false
  },
  
  // Engagement Metrics
  playCount: {
    type: Number,
    default: 0,
    min: [0, 'Play count cannot be negative']
  },
  
  downloads: {
    type: Number,
    default: 0,
    min: [0, 'Downloads count cannot be negative']
  },
  
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes count cannot be negative']
  },
  
  // Visibility and Features
  isPublic: {
    type: Boolean,
    default: true
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  // SEO and Discovery
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Release Information
  releaseDate: {
    type: Date,
    default: Date.now
  },
  
  label: {
    type: String,
    trim: true,
    maxlength: [100, 'Label cannot exceed 100 characters']
  },
  
  // Analytics
  lastPlayed: {
    type: Date
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
musicSchema.index({ genre: 1 });
musicSchema.index({ featured: -1, createdAt: -1 });
musicSchema.index({ playCount: -1 });
musicSchema.index({ uploadDate: -1 });
musicSchema.index({ bpm: 1 });
musicSchema.index({ key: 1 });
musicSchema.index({ isPublic: 1 });
musicSchema.index({ tags: 1 });

// Text search index
musicSchema.index({
  title: 'text',
  artist: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for formatted duration (MM:SS)
musicSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for file size in MB
musicSchema.virtual('fileSizeMB').get(function() {
  if (!this.fileSize) return null;
  return Math.round((this.fileSize / (1024 * 1024)) * 100) / 100;
});

// Pre-save middleware
musicSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get music statistics
musicSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTracks: { $sum: 1 },
        totalPlays: { $sum: '$playCount' },
        totalDuration: { $sum: '$duration' },
        avgBPM: { $avg: '$bpm' },
        featuredCount: { 
          $sum: { $cond: ['$featured', 1, 0] } 
        }
      }
    }
  ]);
  
  const genreStats = await this.aggregate([
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    overview: stats[0] || {
      totalTracks: 0,
      totalPlays: 0,
      totalDuration: 0,
      avgBPM: 0,
      featuredCount: 0
    },
    genreBreakdown: genreStats
  };
};

// Static method to get featured tracks
musicSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ featured: true, isPublic: true })
    .sort({ playCount: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to get popular tracks
musicSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ playCount: -1, likes: -1 })
    .limit(limit);
};

// Instance method to increment play count
musicSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  this.lastPlayed = new Date();
  return this.save();
};

// Instance method to toggle featured status
musicSchema.methods.toggleFeatured = function() {
  this.featured = !this.featured;
  return this.save();
};

module.exports = mongoose.model('Music', musicSchema);

