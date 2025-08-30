/**
 * Music Controller
 * Handles CRUD operations for DJ's music catalog
 */

const BaseController = require('./BaseController');
const { Music } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class MusicController extends BaseController {
  
  constructor() {
    super();
    this.setupUpload();
  }

  /**
   * Configure multer for audio file uploads
   */
  setupUpload() {
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '../../public/audio/uploads');
    
    // Configure multer storage
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });

    // File filter for audio files only
    const fileFilter = (req, file, cb) => {
      const allowedMimes = [
        'audio/mpeg',
        'audio/mp3', 
        'audio/wav',
        'audio/flac',
        'audio/m4a',
        'audio/aac'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'), false);
      }
    };

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
      },
      fileFilter: fileFilter
    });
  }

  /**
   * Upload audio file
   */
  async uploadAudio(req, res) {
    try {
      // Use multer middleware
      this.upload.single('audio')(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return this.sendError(res, 'File too large. Maximum size is 50MB', 400);
            }
          }
          return this.sendError(res, err.message, 400);
        }

        if (!req.file) {
          return this.sendError(res, 'No audio file provided', 400);
        }

        // Extract metadata from request body
        const {
          title,
          artist = 'DJ Nuff Jamz',
          genre,
          subGenre,
          bpm,
          key,
          mixType = 'original',
          description,
          tags,
          isPublic = true,
          featured = false
        } = req.body;

        // Validate required fields
        if (!title || !genre) {
          // Clean up uploaded file if validation fails
          await fs.unlink(req.file.path).catch(() => {});
          return this.sendError(res, 'Title and genre are required', 400);
        }

        // Get file info
        const stats = await fs.stat(req.file.path);
        const audioUrl = `/audio/uploads/${req.file.filename}`;

        // Create music record
        const musicData = {
          title,
          artist,
          genre,
          subGenre,
          bpm: bpm ? parseInt(bpm) : undefined,
          key,
          duration: 0, // TODO: Extract actual duration from audio file
          audioUrl,
          fileFormat: path.extname(req.file.originalname).slice(1).toLowerCase(),
          fileSize: stats.size,
          mixType,
          description,
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
          isPublic: isPublic === 'true' || isPublic === true,
          featured: featured === 'true' || featured === true,
          playCount: 0,
          likes: 0
        };

        const music = new Music(musicData);
        await music.save();

        this.sendSuccess(res, { 
          music,
          file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            url: audioUrl
          }
        }, 'Audio file uploaded successfully', 201);

      });
    } catch (error) {
      this.sendError(res, 'Failed to upload audio file', 500, error);
    }
  }

  /**
   * Delete audio file and record
   */
  async deleteAudioFile(req, res) {
    try {
      const music = await Music.findById(req.params.id);

      if (!music) {
        return this.sendNotFound(res, 'Music track not found');
      }

      // Delete physical file if it exists
      if (music.audioUrl && music.audioUrl.startsWith('/audio/uploads/')) {
        const filename = path.basename(music.audioUrl);
        const filePath = path.join(__dirname, '../../public/audio/uploads', filename);
        
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete audio file:', fileError.message);
        }
      }

      // Delete database record
      await Music.findByIdAndDelete(req.params.id);

      this.sendSuccess(res, null, 'Music track and file deleted successfully');
    } catch (error) {
      this.sendError(res, 'Failed to delete music track', 500, error);
    }
  }

  /**
   * Get all music tracks with filtering and pagination
   */
  async getAllMusic(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        featured,
        isPublic = true,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = { isPublic: isPublic === 'true' };
      
      if (genre) filter.genre = genre;
      if (featured !== undefined) filter.featured = featured === 'true';
      
      if (search) {
        filter.$text = { $search: search };
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const music = await Music.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Music.countDocuments(filter);

      this.sendSuccess(res, {
        music,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }, 'Music tracks retrieved successfully');

    } catch (error) {
      this.sendError(res, 'Failed to retrieve music tracks', 500, 500, error);
    }
  }

  /**
   * Get featured music tracks
   */
  async getFeaturedMusic(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const music = await Music.getFeatured(parseInt(limit));
      
      this.sendSuccess(res, { music }, 'Featured music retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve featured music', 500, 500, error);
    }
  }

  /**
   * Get popular music tracks
   */
  async getPopularMusic(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const music = await Music.getPopular(parseInt(limit));
      
      this.sendSuccess(res, { music }, 'Popular music retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve popular music', 500, 500, error);
    }
  }

  /**
   * Get single music track by ID
   */
  async getMusic(req, res) {
    try {
      const music = await Music.findById(req.params.id);
      
      if (!music) {
        return this.sendNotFound(res, 'Music track not found');
      }

      // Increment play count for public tracks
      if (music.isPublic) {
        await music.incrementPlayCount();
      }

      this.sendSuccess(res, { music }, 'Music track retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve music track', 500, error);
    }
  }

  /**
   * Create new music track
   */
  async createMusic(req, res) {
    try {
      const music = new Music(req.body);
      await music.save();
      
      this.sendSuccess(res, { music }, 'Music track created successfully', 201);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return this.sendValidationError(res, 500, error);
      }
      this.sendError(res, 'Failed to create music track', 500, error);
    }
  }

  /**
   * Update music track
   */
  async updateMusic(req, res) {
    try {
      const music = await Music.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!music) {
        return this.sendNotFound(res, 'Music track not found');
      }

      this.sendSuccess(res, { music }, 'Music track updated successfully');
    } catch (error) {
      if (error.name === 'ValidationError') {
        return this.sendValidationError(res, 500, error);
      }
      this.sendError(res, 'Failed to update music track', 500, error);
    }
  }

  /**
   * Delete music track
   */
  async deleteMusic(req, res) {
    try {
      const music = await Music.findByIdAndDelete(req.params.id);

      if (!music) {
        return this.sendNotFound(res, 'Music track not found');
      }

      this.sendSuccess(res, null, 'Music track deleted successfully');
    } catch (error) {
      this.sendError(res, 'Failed to delete music track', 500, error);
    }
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(req, res) {
    try {
      const music = await Music.findById(req.params.id);

      if (!music) {
        return this.sendNotFound(res, 'Music track not found');
      }

      await music.toggleFeatured();

      this.sendSuccess(res, { music }, `Music track ${music.featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      this.sendError(res, 'Failed to toggle featured status', 500, error);
    }
  }

  /**
   * Get music statistics
   */
  async getMusicStats(req, res) {
    try {
      const stats = await Music.getStats();
      
      this.sendSuccess(res, { stats }, 'Music statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve music statistics', 500, error);
    }
  }

  /**
   * Search music tracks
   */
  async searchMusic(req, res) {
    try {
      const { query, limit = 20 } = req.query;
      
      if (!query) {
        return this.sendValidationError(res, { message: 'Search query is required' });
      }

      const music = await Music.find({
        $text: { $search: query },
        isPublic: true
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

      this.sendSuccess(res, { music, query }, 'Music search completed successfully');
    } catch (error) {
      this.sendError(res, 'Failed to search music', 500, error);
    }
  }

  /**
   * Track play event
   */
  async trackPlay(req, res) {
    try {
      const music = await Music.findById(req.params.id);
      
      if (!music) {
        return this.sendNotFound(res, 'Music track not found');
      }

      if (!music.isPublic) {
        return this.sendError(res, 'Cannot track plays for private tracks', 403);
      }

      // Increment play count
      await music.incrementPlayCount();

      this.sendSuccess(res, { 
        playCount: music.playCount + 1,
        trackId: music._id 
      }, 'Play tracked successfully');
    } catch (error) {
      this.sendError(res, 'Failed to track play', 500, error);
    }
  }

  /**
   * Get play statistics
   */
  async getPlayStats(req, res) {
    try {
      const stats = await Music.aggregate([
        { $match: { isPublic: true } },
        {
          $group: {
            _id: null,
            totalPlays: { $sum: '$playCount' },
            totalTracks: { $sum: 1 },
            avgPlays: { $avg: '$playCount' },
            maxPlays: { $max: '$playCount' },
            minPlays: { $min: '$playCount' }
          }
        }
      ]);

      const topTracks = await Music.find({ isPublic: true })
        .sort({ playCount: -1 })
        .limit(10)
        .select('title artist playCount genre');

      const genreStats = await Music.aggregate([
        { $match: { isPublic: true } },
        {
          $group: {
            _id: '$genre',
            totalPlays: { $sum: '$playCount' },
            trackCount: { $sum: 1 },
            avgPlays: { $avg: '$playCount' }
          }
        },
        { $sort: { totalPlays: -1 } }
      ]);

      this.sendSuccess(res, {
        overview: stats[0] || {
          totalPlays: 0,
          totalTracks: 0,
          avgPlays: 0,
          maxPlays: 0,
          minPlays: 0
        },
        topTracks,
        genreStats
      }, 'Play statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve play statistics', 500, error);
    }
  }
}

module.exports = new MusicController();
