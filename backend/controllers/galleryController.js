/**
 * Gallery Controller
 * Handles photo gallery operations
 */

const BaseController = require('./BaseController');

class GalleryController extends BaseController {
  constructor() {
    super();
    // Bind methods to maintain 'this' context
    this.getAllPhotos = this.asyncHandler(this.getAllPhotos.bind(this));
    this.getPhoto = this.asyncHandler(this.getPhoto.bind(this));
    this.uploadPhoto = this.asyncHandler(this.uploadPhoto.bind(this));
    this.updatePhoto = this.asyncHandler(this.updatePhoto.bind(this));
    this.deletePhoto = this.asyncHandler(this.deletePhoto.bind(this));
    this.getPhotosByCategory = this.asyncHandler(this.getPhotosByCategory.bind(this));
  }

  /**
   * Get all photos
   */
  async getAllPhotos(req, res) {
    // TODO: Implement in task 4.8
    this.sendSuccess(res, [], 'Gallery photos retrieved successfully');
  }

  /**
   * Get single photo by ID
   */
  async getPhoto(req, res) {
    // TODO: Implement in task 4.8
    const { id } = req.params;
    this.sendNotFound(res, 'Photo');
  }

  /**
   * Upload new photo
   */
  async uploadPhoto(req, res) {
    // TODO: Implement in task 4.8
    this.sendSuccess(res, null, 'Photo uploaded successfully', 201);
  }

  /**
   * Update photo details
   */
  async updatePhoto(req, res) {
    // TODO: Implement in task 4.8
    const { id } = req.params;
    this.sendSuccess(res, null, 'Photo updated successfully');
  }

  /**
   * Delete photo
   */
  async deletePhoto(req, res) {
    // TODO: Implement in task 4.8
    const { id } = req.params;
    this.sendSuccess(res, null, 'Photo deleted successfully');
  }

  /**
   * Get photos by category
   */
  async getPhotosByCategory(req, res) {
    // TODO: Implement in task 4.8
    const { category } = req.params;
    this.sendSuccess(res, [], `Photos in category '${category}' retrieved successfully`);
  }
}

module.exports = new GalleryController();

