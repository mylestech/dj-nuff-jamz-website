/**
 * Gallery Controller
 * Handles CRUD operations for photo gallery
 */

const BaseController = require('./BaseController');
const { Gallery } = require('../models');

class GalleryController extends BaseController {
  
  /**
   * Get all gallery items with filtering and pagination
   */
  async getAllGallery(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        eventType,
        category,
        featured,
        isPortfolio,
        isPublic = true,
        search,
        sortBy = 'eventDate',
        sortOrder = 'desc'
      } = req.query;

      const filter = { isPublic: isPublic === 'true' };
      
      if (eventType) filter.eventType = eventType;
      if (category) filter.category = category;
      if (featured !== undefined) filter.featured = featured === 'true';
      if (isPortfolio !== undefined) filter.isPortfolio = isPortfolio === 'true';
      
      if (search) {
        filter.$text = { $search: search };
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const gallery = await Gallery.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Gallery.countDocuments(filter);

      this.sendSuccess(res, {
        gallery,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }, 'Gallery items retrieved successfully');

    } catch (error) {
      this.sendError(res, 'Failed to retrieve gallery items', 500, error);
    }
  }

  /**
   * Get featured gallery items
   */
  async getFeaturedGallery(req, res) {
    try {
      const { limit = 12 } = req.query;
      
      const gallery = await Gallery.getFeatured(parseInt(limit));
      
      this.sendSuccess(res, { gallery }, 'Featured gallery items retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve featured gallery items', 500, error);
    }
  }

  /**
   * Get portfolio gallery items
   */
  async getPortfolioGallery(req, res) {
    try {
      const { limit = 20 } = req.query;
      
      const gallery = await Gallery.getPortfolio(parseInt(limit));
      
      this.sendSuccess(res, { gallery }, 'Portfolio gallery items retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve portfolio gallery items', 500, error);
    }
  }

  /**
   * Get recent gallery items
   */
  async getRecentGallery(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const gallery = await Gallery.getRecent(parseInt(limit));
      
      this.sendSuccess(res, { gallery }, 'Recent gallery items retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve recent gallery items', 500, error);
    }
  }

  /**
   * Get single gallery item by ID
   */
  async getGalleryItem(req, res) {
    try {
      const galleryItem = await Gallery.findById(req.params.id);
      
      if (!galleryItem) {
        return this.sendNotFound(res, 'Gallery item not found');
      }

      // Increment view count for public items
      if (galleryItem.isPublic) {
        await galleryItem.incrementViews();
      }

      this.sendSuccess(res, { galleryItem }, 'Gallery item retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve gallery item', 500, error);
    }
  }

  /**
   * Get gallery item by slug
   */
  async getGalleryBySlug(req, res) {
    try {
      const galleryItem = await Gallery.findOne({ 
        slug: req.params.slug,
        isPublic: true 
      });
      
      if (!galleryItem) {
        return this.sendNotFound(res, 'Gallery item not found');
      }

      await galleryItem.incrementViews();

      this.sendSuccess(res, { galleryItem }, 'Gallery item retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve gallery item', 500, error);
    }
  }

  /**
   * Create new gallery item
   */
  async createGalleryItem(req, res) {
    try {
      const galleryItem = new Gallery(req.body);
      await galleryItem.save();
      
      this.sendSuccess(res, { galleryItem }, 'Gallery item created successfully', 201);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return this.sendValidationError(res, 500, error);
      }
      this.sendError(res, 'Failed to create gallery item', 500, error);
    }
  }

  /**
   * Update gallery item
   */
  async updateGalleryItem(req, res) {
    try {
      const galleryItem = await Gallery.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!galleryItem) {
        return this.sendNotFound(res, 'Gallery item not found');
      }

      this.sendSuccess(res, { galleryItem }, 'Gallery item updated successfully');
    } catch (error) {
      if (error.name === 'ValidationError') {
        return this.sendValidationError(res, 500, error);
      }
      this.sendError(res, 'Failed to update gallery item', 500, error);
    }
  }

  /**
   * Delete gallery item
   */
  async deleteGalleryItem(req, res) {
    try {
      const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

      if (!galleryItem) {
        return this.sendNotFound(res, 'Gallery item not found');
      }

      this.sendSuccess(res, null, 'Gallery item deleted successfully');
    } catch (error) {
      this.sendError(res, 'Failed to delete gallery item', 500, error);
    }
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(req, res) {
    try {
      const galleryItem = await Gallery.findById(req.params.id);

      if (!galleryItem) {
        return this.sendNotFound(res, 'Gallery item not found');
      }

      await galleryItem.toggleFeatured();

      this.sendSuccess(res, { galleryItem }, `Gallery item ${galleryItem.featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      this.sendError(res, 'Failed to toggle featured status', 500, error);
    }
  }

  /**
   * Toggle portfolio status
   */
  async togglePortfolio(req, res) {
    try {
      const galleryItem = await Gallery.findById(req.params.id);

      if (!galleryItem) {
        return this.sendNotFound(res, 'Gallery item not found');
      }

      await galleryItem.togglePortfolio();

      this.sendSuccess(res, { galleryItem }, `Gallery item ${galleryItem.isPortfolio ? 'added to' : 'removed from'} portfolio successfully`);
    } catch (error) {
      this.sendError(res, 'Failed to toggle portfolio status', 500, error);
    }
  }

  /**
   * Get gallery statistics
   */
  async getGalleryStats(req, res) {
    try {
      const stats = await Gallery.getStats();
      
      this.sendSuccess(res, { stats }, 'Gallery statistics retrieved successfully');
    } catch (error) {
      this.sendError(res, 'Failed to retrieve gallery statistics', 500, error);
    }
  }

  /**
   * Search gallery items
   */
  async searchGallery(req, res) {
    try {
      const { query, limit = 20 } = req.query;
      
      if (!query) {
        return this.sendValidationError(res, { message: 'Search query is required' });
      }

      const gallery = await Gallery.find({
        $text: { $search: query },
        isPublic: true
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

      this.sendSuccess(res, { gallery, query }, 'Gallery search completed successfully');
    } catch (error) {
      this.sendError(res, 'Failed to search gallery', 500, error);
    }
  }

  /**
   * Get gallery items by event type
   */
  async getGalleryByEventType(req, res) {
    try {
      const { eventType } = req.params;
      const { limit = 20, page = 1 } = req.query;

      const filter = { eventType, isPublic: true };

      const gallery = await Gallery.find(filter)
        .sort({ eventDate: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Gallery.countDocuments(filter);

      this.sendSuccess(res, {
        gallery,
        eventType,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }, `Gallery items for ${eventType} events retrieved successfully`);

    } catch (error) {
      this.sendError(res, 'Failed to retrieve gallery items by event type', 500, error);
    }
  }
}

module.exports = new GalleryController();