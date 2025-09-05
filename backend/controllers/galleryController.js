const fs = require('fs').promises;
const path = require('path');
const Gallery = require('../models/Gallery');

class GalleryController {
    /**
     * Get gallery items from database
     */
    async getGalleryItems(req, res) {
        try {
            const { limit = 50, category, featured } = req.query;
            
            let query = {};
            if (category && category !== 'all') {
                query.category = category;
            }
            if (featured === 'true') {
                query.featured = true;
            }

            const items = await Gallery.find(query)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: items,
                count: items.length
            });
        } catch (error) {
            console.error('Error fetching gallery items:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch gallery items'
            });
        }
    }

    /**
     * Scan local gallery folder and return available photos
     */
    async scanLocalGallery(req, res) {
        try {
            const galleryPath = path.join(__dirname, '../../public/images/gallery');
            const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            
            // Check if gallery directory exists
            try {
                await fs.access(galleryPath);
            } catch (error) {
                return res.json({
                    success: true,
                    data: [],
                    message: 'Gallery folder not found or empty'
                });
            }

            // Read directory contents
            const files = await fs.readdir(galleryPath);
            
            // Filter for image files
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return supportedFormats.includes(ext);
            });

            // Create gallery items from files
            const galleryItems = await Promise.all(
                imageFiles.map(async (filename, index) => {
                    const filePath = path.join(galleryPath, filename);
                    const stats = await fs.stat(filePath);
                    
                    // Extract info from filename (optional)
                    const nameWithoutExt = path.parse(filename).name;
                    const parts = nameWithoutExt.split('-');
                    
                    return {
                        id: `local-${index + 1}`,
                        title: this.formatTitle(nameWithoutExt),
                        description: `DJ Nuff Jamz event photo`,
                        filename: filename,
                        imageUrl: `/images/gallery/${filename}`,
                        thumbnailUrl: `/images/gallery/${filename}`, // Same for now, can add thumbnail generation later
                        category: this.guessCategory(nameWithoutExt),
                        eventType: this.guessEventType(nameWithoutExt),
                        tags: this.extractTags(nameWithoutExt),
                        featured: index < 3, // First 3 photos are featured
                        fileSize: stats.size,
                        dateAdded: stats.mtime,
                        views: Math.floor(Math.random() * 100) + 10, // Random for demo
                        likes: Math.floor(Math.random() * 20) + 1
                    };
                })
            );

            res.json({
                success: true,
                data: galleryItems,
                count: galleryItems.length,
                source: 'local_files'
            });

        } catch (error) {
            console.error('Error scanning local gallery:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to scan gallery folder'
            });
        }
    }

    /**
     * Format filename into a readable title
     */
    formatTitle(filename) {
        return filename
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    /**
     * Guess category from filename
     */
    guessCategory(filename) {
        const lower = filename.toLowerCase();
        if (lower.includes('dj') || lower.includes('mixing') || lower.includes('turntable')) return 'action';
        if (lower.includes('crowd') || lower.includes('dance') || lower.includes('party')) return 'crowd';
        if (lower.includes('venue') || lower.includes('setup') || lower.includes('stage')) return 'venue';
        if (lower.includes('equipment') || lower.includes('gear') || lower.includes('booth')) return 'equipment';
        return 'action'; // default
    }

    /**
     * Guess event type from filename
     */
    guessEventType(filename) {
        const lower = filename.toLowerCase();
        if (lower.includes('wedding')) return 'wedding';
        if (lower.includes('corporate') || lower.includes('business')) return 'corporate';
        if (lower.includes('birthday') || lower.includes('party')) return 'private';
        if (lower.includes('club') || lower.includes('nightclub')) return 'nightclub';
        return 'event'; // default
    }

    /**
     * Extract tags from filename
     */
    extractTags(filename) {
        const lower = filename.toLowerCase();
        const tags = [];
        
        // Common DJ/event tags
        if (lower.includes('wedding')) tags.push('wedding');
        if (lower.includes('party')) tags.push('party');
        if (lower.includes('dj')) tags.push('dj');
        if (lower.includes('dance')) tags.push('dance');
        if (lower.includes('music')) tags.push('music');
        if (lower.includes('crowd')) tags.push('crowd');
        if (lower.includes('lights')) tags.push('lights');
        if (lower.includes('night')) tags.push('night');
        if (lower.includes('event')) tags.push('event');
        
        return tags.length > 0 ? tags : ['dj', 'event'];
    }

    /**
     * Upload new gallery item
     */
    async uploadGalleryItem(req, res) {
        try {
            const galleryData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category || 'action',
                eventType: req.body.eventType || 'event',
                tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
                featured: req.body.featured === 'true',
                imageUrl: req.file ? `/images/gallery/${req.file.filename}` : req.body.imageUrl,
                thumbnailUrl: req.file ? `/images/gallery/${req.file.filename}` : req.body.thumbnailUrl
            };

            const newItem = new Gallery(galleryData);
            await newItem.save();

            res.json({
                success: true,
                data: newItem,
                message: 'Gallery item uploaded successfully'
            });
        } catch (error) {
            console.error('Error uploading gallery item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload gallery item'
            });
        }
    }
}

module.exports = new GalleryController();