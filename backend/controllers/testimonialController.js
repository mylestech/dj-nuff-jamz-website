/**
 * Testimonial Controller
 * Handles testimonial CRUD operations and display
 */

const BaseController = require('./BaseController');
const { Testimonial } = require('../models');

class TestimonialController extends BaseController {
  constructor() {
    super();
    // Bind methods to maintain 'this' context
    this.getAllTestimonials = this.asyncHandler(this.getAllTestimonials.bind(this));
    this.getApprovedTestimonials = this.asyncHandler(this.getApprovedTestimonials.bind(this));
    this.getFeaturedTestimonials = this.asyncHandler(this.getFeaturedTestimonials.bind(this));
    this.getTestimonialById = this.asyncHandler(this.getTestimonialById.bind(this));
    this.createTestimonial = this.asyncHandler(this.createTestimonial.bind(this));
    this.updateTestimonial = this.asyncHandler(this.updateTestimonial.bind(this));
    this.deleteTestimonial = this.asyncHandler(this.deleteTestimonial.bind(this));
    this.approveTestimonial = this.asyncHandler(this.approveTestimonial.bind(this));
    this.featureTestimonial = this.asyncHandler(this.featureTestimonial.bind(this));
    this.getTestimonialStats = this.asyncHandler(this.getTestimonialStats.bind(this));
    this.getTestimonialsByEventType = this.asyncHandler(this.getTestimonialsByEventType.bind(this));
  }

  /**
   * Get all testimonials (admin only)
   */
  async getAllTestimonials(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, eventType, rating, search } = req.query;

    // Build query
    const query = {};
    
    if (status === 'approved') query.approved = true;
    if (status === 'pending') query.approved = false;
    if (status === 'featured') query.featured = true;
    if (eventType) query.eventType = eventType;
    if (rating) query.rating = parseInt(rating);
    
    if (search) {
      query.$text = { $search: search };
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Testimonial.countDocuments(query);

    this.sendSuccess(res, {
      testimonials,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }, 'Testimonials retrieved successfully');
  }

  /**
   * Get approved testimonials for public display
   */
  async getApprovedTestimonials(req, res) {
    const limit = parseInt(req.query.limit) || 10;
    const eventType = req.query.eventType;

    let testimonials;
    if (eventType) {
      testimonials = await Testimonial.getByEventType(eventType, limit);
    } else {
      testimonials = await Testimonial.getApproved(limit);
    }

    this.sendSuccess(res, testimonials, 'Approved testimonials retrieved successfully');
  }

  /**
   * Get featured testimonials
   */
  async getFeaturedTestimonials(req, res) {
    const limit = parseInt(req.query.limit) || 5;
    const testimonials = await Testimonial.getFeatured(limit);

    this.sendSuccess(res, testimonials, 'Featured testimonials retrieved successfully');
  }

  /**
   * Get testimonial by ID
   */
  async getTestimonialById(req, res) {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return this.sendError(res, 'Testimonial not found', 404);
    }

    // For public access, only return approved testimonials
    if (!req.user && !testimonial.approved) {
      return this.sendError(res, 'Testimonial not found', 404);
    }

    this.sendSuccess(res, testimonial, 'Testimonial retrieved successfully');
  }

  /**
   * Create new testimonial
   */
  async createTestimonial(req, res) {
    const testimonialData = req.body;

    // If not admin, set default values for security
    if (!req.user || req.user.role !== 'admin') {
      testimonialData.approved = false;
      testimonialData.featured = false;
      testimonialData.source = 'website_form';
    }

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();

    this.sendSuccess(res, testimonial, 'Testimonial created successfully', 201);
  }

  /**
   * Update testimonial
   */
  async updateTestimonial(req, res) {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return this.sendError(res, 'Testimonial not found', 404);
    }

    this.sendSuccess(res, testimonial, 'Testimonial updated successfully');
  }

  /**
   * Delete testimonial
   */
  async deleteTestimonial(req, res) {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return this.sendError(res, 'Testimonial not found', 404);
    }

    this.sendSuccess(res, null, 'Testimonial deleted successfully');
  }

  /**
   * Approve testimonial
   */
  async approveTestimonial(req, res) {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return this.sendError(res, 'Testimonial not found', 404);
    }

    await testimonial.approve();

    this.sendSuccess(res, testimonial, 'Testimonial approved successfully');
  }

  /**
   * Feature/unfeature testimonial
   */
  async featureTestimonial(req, res) {
    const { id } = req.params;
    const { featured } = req.body;
    
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return this.sendError(res, 'Testimonial not found', 404);
    }

    if (featured) {
      await testimonial.feature();
    } else {
      await testimonial.unfeature();
    }

    this.sendSuccess(res, testimonial, `Testimonial ${featured ? 'featured' : 'unfeatured'} successfully`);
  }

  /**
   * Get testimonial statistics
   */
  async getTestimonialStats(req, res) {
    const [stats] = await Testimonial.getStats();
    const eventTypeStats = await Testimonial.getEventTypeStats();

    const result = {
      overview: stats || {
        total: 0,
        approved: 0,
        featured: 0,
        pending: 0,
        averageRating: 0
      },
      byEventType: eventTypeStats
    };

    this.sendSuccess(res, result, 'Testimonial statistics retrieved successfully');
  }

  /**
   * Get testimonials by event type
   */
  async getTestimonialsByEventType(req, res) {
    const { eventType } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const testimonials = await Testimonial.getByEventType(eventType, limit);

    this.sendSuccess(res, testimonials, `Testimonials for ${eventType} events retrieved successfully`);
  }
}

module.exports = new TestimonialController();
