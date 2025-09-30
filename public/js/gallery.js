/**
 * DJ Nuff Jamz Photo Gallery
 * A responsive photo gallery with lightbox functionality and filtering
 */

class PhotoGallery {
    constructor() {
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.galleryItems = [];
        this.filteredItems = [];
        this.isLoading = false;
        this.lightboxOpen = false;
        this.currentLightboxIndex = 0;
        
        // Sample data for development (will be replaced by API data)
        this.sampleItems = [
            {
                id: '1',
                title: 'Summer Beach Wedding - Sarah & Mike',
                description: 'Beautiful oceanfront wedding with DJ entertainment',
                eventType: 'wedding',
                venue: 'Malibu Beach Resort',
                fullLocation: 'Malibu, CA',
                eventDate: '2024-06-15',
                imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=800&fit=crop',
                thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
                category: 'action',
                tags: ['beach', 'wedding', 'sunset', 'romantic'],
                featured: true,
                views: 342,
                likes: 28
            },
            {
                id: '2',
                title: 'Corporate Gala 2024',
                description: 'Annual corporate gala with live DJ entertainment',
                eventType: 'corporate',
                venue: 'Downtown Convention Center',
                fullLocation: 'Los Angeles, CA',
                eventDate: '2024-08-20',
                imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=800&fit=crop',
                thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop',
                category: 'venue',
                tags: ['corporate', 'gala', 'professional', 'networking'],
                featured: false,
                views: 156,
                likes: 12
            },
            {
                id: '3',
                title: 'Birthday Bash - 30th Celebration',
                description: 'High-energy 30th birthday party with dance floor action',
                eventType: 'birthday',
                venue: 'Private Residence',
                fullLocation: 'Beverly Hills, CA',
                eventDate: '2024-07-10',
                imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=800&fit=crop',
                thumbnailUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop',
                category: 'crowd',
                tags: ['birthday', 'party', 'dancing', 'celebration'],
                featured: true,
                views: 289,
                likes: 23
            },
            {
                id: '4',
                title: 'Club Night - Downtown Venue',
                description: 'Electric club atmosphere with packed dance floor',
                eventType: 'club-night',
                venue: 'The Underground',
                fullLocation: 'Hollywood, CA',
                eventDate: '2024-09-05',
                imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?w=800&h=800&fit=crop',
                thumbnailUrl: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b2d2?w=400&h=400&fit=crop',
                category: 'dj-booth',
                tags: ['club', 'nightlife', 'electronic', 'energy'],
                featured: false,
                views: 445,
                likes: 37
            },
            {
                id: '5',
                title: 'Studio Session - New Mix Recording',
                description: 'Behind the scenes recording new summer mix',
                eventType: 'studio-session',
                venue: 'SoundWave Studios',
                fullLocation: 'Burbank, CA',
                eventDate: '2024-06-01',
                imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop',
                thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                category: 'behind-scenes',
                tags: ['studio', 'recording', 'production', 'mixing'],
                featured: false,
                views: 123,
                likes: 8
            },
            {
                id: '6',
                title: 'Wedding Reception - Grand Ballroom',
                description: 'Elegant wedding reception with live entertainment',
                eventType: 'wedding',
                venue: 'Grand Ballroom Hotel',
                fullLocation: 'Santa Monica, CA',
                eventDate: '2024-05-20',
                imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=800&fit=crop',
                thumbnailUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop',
                category: 'setup',
                tags: ['wedding', 'reception', 'elegant', 'ballroom'],
                featured: true,
                views: 234,
                likes: 19
            }
        ];
        
        this.eventTypes = [
            { value: 'all', label: 'All Events' },
            { value: 'wedding', label: 'Weddings' },
            { value: 'corporate', label: 'Corporate' },
            { value: 'birthday', label: 'Birthdays' },
            { value: 'club-night', label: 'Club Nights' },
            { value: 'studio-session', label: 'Studio Sessions' },
            { value: 'private-party', label: 'Private Parties' },
            { value: 'anniversary', label: 'Anniversaries' }
        ];
        
        this.init();
    }

    init() {
        this.createGalleryHTML();
        this.bindEvents();
        this.loadGalleryItems();
    }

    createGalleryHTML() {
        const gallerySection = document.getElementById('gallery');
        if (!gallerySection) return;

        const container = gallerySection.querySelector('.container-custom');
        if (!container) return;

        container.innerHTML = `
            <h2 id="gallery-heading" class="text-center mb-12 text-gray-100">Event Gallery</h2>
            
            <!-- Filter Controls -->
            <div class="flex flex-wrap justify-center gap-4 mb-8">
                ${this.eventTypes.map(type => `
                    <button class="event-filter px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors ${type.value === 'all' ? 'bg-blue-600 text-white border-blue-600' : ''}" 
                            data-filter="${type.value}">
                        ${type.label}
                    </button>
                `).join('')}
            </div>

            <!-- Gallery Grid -->
            <div class="gallery-container">
                <!-- Loading Spinner -->
                <div id="gallery-loading" class="text-center py-12 hidden">
                    <div class="loading-spinner mx-auto mb-4"></div>
                    <p class="text-gray-400">Loading gallery...</p>
                </div>

                <!-- Gallery Grid -->
                <div id="gallery-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    <!-- Gallery items will be populated here -->
                </div>

                <!-- Load More Button -->
                <div class="text-center mt-8">
                    <button id="load-more-btn" class="btn-secondary px-6 py-3 hidden">
                        Load More Photos
                    </button>
                </div>
            </div>

            <!-- Lightbox -->
            <div id="lightbox" class="fixed inset-0 bg-black bg-opacity-90 z-50 hidden flex items-center justify-center">
                <div class="relative max-w-7xl max-h-full mx-4">
                    <!-- Close Button -->
                    <button id="lightbox-close" class="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    <!-- Navigation Arrows -->
                    <button id="lightbox-prev" class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <button id="lightbox-next" class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>

                    <!-- Image Container -->
                    <div class="flex flex-col items-center">
                        <img id="lightbox-image" class="max-w-full max-h-[80vh] object-contain" src="" alt="">
                        
                        <!-- Image Info -->
                        <div class="bg-black bg-opacity-50 text-white p-4 mt-4 rounded-lg max-w-2xl">
                            <h3 id="lightbox-title" class="text-xl font-bold mb-2"></h3>
                            <p id="lightbox-description" class="text-gray-300 mb-2"></p>
                            <div class="flex flex-wrap gap-4 text-sm text-gray-400">
                                <span id="lightbox-venue"></span>
                                <span id="lightbox-date"></span>
                                <span id="lightbox-views"></span>
                            </div>
                            <div id="lightbox-tags" class="flex flex-wrap gap-2 mt-3">
                                <!-- Tags will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-filter')) {
                this.filterGallery(e.target.dataset.filter);
            }
        });

        // Gallery item clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-item-image')) {
                const index = parseInt(e.target.dataset.index);
                this.openLightbox(index);
            }
        });

        // Lightbox controls
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        const lightbox = document.getElementById('lightbox');

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => this.previousImage());
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => this.nextImage());
        }

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.lightboxOpen) {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreItems());
        }
    }

    async loadGalleryItems() {
        this.showLoading(true);
        
        console.log('📸 Loading gallery - checking for uploaded photos...');
        
        try {
            // Try to load actual uploaded photos first
            const uploadedPhotos = await this.scanUploadedPhotos();
            
            if (uploadedPhotos && uploadedPhotos.length > 0) {
                this.galleryItems = uploadedPhotos;
                console.log(`✅ Gallery loaded with ${uploadedPhotos.length} uploaded photos`);
            } else {
                // Fallback to sample data if no uploaded photos
                this.galleryItems = this.sampleItems;
                console.log('📷 No uploaded photos found, using sample data');
            }
            
        } catch (error) {
            console.log('⚠️ Error loading uploaded photos, using sample data:', error);
            this.galleryItems = this.sampleItems;
        }
        
        this.filterGallery(this.currentFilter);
        this.showLoading(false);
        
        console.log(`✅ Gallery loaded with ${this.galleryItems.length} items`);
    }

    async scanUploadedPhotos() {
        // Check if we have a photo index file with uploaded photos
        if (window.uploadedPhotosList && window.uploadedPhotosList.length > 0) {
            console.log(`📋 Found ${window.uploadedPhotosList.length} photos in photo index`);
            return this.convertFilesToGalleryItems(window.uploadedPhotosList);
        } else {
            console.log('📭 No photos found in photo index (window.uploadedPhotosList is empty)');
            return [];
        }
    }

    convertFilesToGalleryItems(files) {
        if (!files || files.length === 0) return [];
        
        return files.map((filename, index) => {
            const id = `upload_${index + 1}`;
            
            // Generate defaults from filename
            const autoTitle = this.generateTitleFromFilename(filename);
            const autoEventType = this.detectEventTypeFromFilename(filename);
            const autoCategory = this.detectCategoryFromFilename(filename);
            const autoTags = this.generateTagsFromFilename(filename);
            
            // Check for manual overrides
            const override = window.photoOverrides?.[filename] || {};
            
            return {
                id,
                title: override.title || '', // No generic titles unless specifically provided
                description: override.description || `DJ Nuff Jamz ${(override.eventType || autoEventType).replace('-', ' ')} event`,
                eventType: override.eventType || autoEventType,
                venue: override.venue || '', // No generic venue unless specifically provided
                fullLocation: override.fullLocation || '', // No generic location unless specifically provided
                eventDate: override.eventDate || '', // No date unless specifically provided
                imageUrl: `/images/gallery/uploads/${filename}`,
                thumbnailUrl: `/images/gallery/uploads/${filename}`, // Same for now, can be optimized later
                category: override.category || autoCategory,
                tags: override.tags || autoTags,
                featured: override.featured !== undefined ? override.featured : index < 3, // First 3 photos are featured by default
                views: override.views || Math.floor(Math.random() * 100) + 20,
                likes: override.likes || Math.floor(Math.random() * 20) + 5,
                isUploaded: true,
                filename
            };
        });
    }

    generateTitleFromFilename(filename) {
        // Don't generate generic titles - return empty string
        // This will be handled in the display logic
        return '';
    }

    detectEventTypeFromFilename(filename) {
        const name = filename.toLowerCase();
        
        if (name.includes('wedding')) return 'wedding';
        if (name.includes('corporate') || name.includes('business')) return 'corporate';
        if (name.includes('birthday') || name.includes('bday')) return 'birthday';
        if (name.includes('club') || name.includes('nightclub')) return 'club-night';
        if (name.includes('studio') || name.includes('recording')) return 'studio-session';
        if (name.includes('private') || name.includes('house')) return 'private-party';
        if (name.includes('anniversary')) return 'anniversary';
        
        return 'private-party'; // Default fallback
    }

    detectCategoryFromFilename(filename) {
        const name = filename.toLowerCase();
        
        if (name.includes('dj') || name.includes('mixing') || name.includes('performing') || name.includes('turntable')) return 'action';
        if (name.includes('crowd') || name.includes('dance') || name.includes('party') || name.includes('audience')) return 'crowd';
        if (name.includes('venue') || name.includes('setup') || name.includes('stage') || name.includes('location')) return 'venue';
        if (name.includes('equipment') || name.includes('gear') || name.includes('booth') || name.includes('speaker')) return 'dj-booth';
        if (name.includes('behind') || name.includes('backstage') || name.includes('studio')) return 'behind-scenes';
        
        return 'action'; // Default fallback
    }

    generateTagsFromFilename(filename) {
        const name = filename.toLowerCase();
        const tags = [];
        
        // Event type tags
        if (name.includes('wedding')) tags.push('wedding', 'ceremony', 'reception');
        if (name.includes('corporate')) tags.push('corporate', 'business', 'professional');
        if (name.includes('birthday')) tags.push('birthday', 'celebration', 'party');
        if (name.includes('club')) tags.push('club', 'nightlife', 'electronic');
        
        // Activity tags
        if (name.includes('dance') || name.includes('dancing')) tags.push('dancing');
        if (name.includes('mix') || name.includes('mixing')) tags.push('mixing');
        if (name.includes('crowd')) tags.push('crowd', 'audience');
        if (name.includes('light') || name.includes('laser')) tags.push('lighting');
        
        // Venue tags
        if (name.includes('beach')) tags.push('beach', 'outdoor');
        if (name.includes('hotel')) tags.push('hotel', 'ballroom');
        if (name.includes('outdoor')) tags.push('outdoor');
        if (name.includes('indoor')) tags.push('indoor');
        
        // Equipment tags
        if (name.includes('turntable')) tags.push('turntables', 'equipment');
        if (name.includes('speaker')) tags.push('sound-system', 'speakers');
        if (name.includes('booth')) tags.push('dj-booth', 'setup');
        
        // Ensure we have at least some tags
        if (tags.length === 0) {
            tags.push('dj-event', 'entertainment', 'music');
        }
        
        return tags;
    }

    filterGallery(filter) {
        this.currentFilter = filter;
        this.currentPage = 1;
        
        // Update filter buttons
        document.querySelectorAll('.event-filter').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
            btn.classList.add('text-gray-300', 'border-slate-600');
        });
        
        const filterButton = document.querySelector(`[data-filter="${filter}"]`);
        if (filterButton) {
            filterButton.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
            filterButton.classList.remove('text-gray-300', 'border-slate-600');
        }
        
        // Filter items
        this.filteredItems = filter === 'all' 
            ? this.galleryItems 
            : this.galleryItems.filter(item => item.eventType === filter);
        
        this.renderGallery();
    }

    renderGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const itemsToShow = this.filteredItems.slice(startIndex, endIndex);

        const htmlContent = itemsToShow.map((item, index) => `
            <div class="gallery-item group cursor-pointer" style="overflow: visible !important; position: relative !important;">
                <div class="relative rounded-lg bg-slate-800 aspect-square" style="width: 100%; height: 200px; min-height: 200px; aspect-ratio: 1/1; display: block; overflow: visible !important; position: relative !important; z-index: 1 !important;">
                    <img src="${item.thumbnailUrl || item.imageUrl}" 
                         alt="${item.altText || item.title}"
                         class="gallery-item-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                         style="width: 100%; height: 100%; min-height: 200px; object-fit: cover; display: block;"
                         data-index="${index}"
                         onload="this.style.cssText='width: 100% !important; height: 100% !important; display: block !important; opacity: 1 !important; position: relative !important; object-fit: cover !important; z-index: 999 !important;';"
                    
                    <!-- Overlay -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                        <div class="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                            ${item.title ? `<h3 class="text-lg font-semibold mb-2">${item.title}</h3>` : ''}
                            <p class="text-sm text-gray-300 mb-2 capitalize">${item.eventType.replace('-', ' ')} Event</p>
                            ${item.venue ? `<p class="text-xs text-gray-400 mb-2">${item.venue}</p>` : ''}
                            <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
                                <span class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                    </svg>
                                    ${item.views || 0}
                                </span>
                                <span class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                                    </svg>
                                    ${item.likes || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `);
        
        grid.innerHTML = htmlContent.join('');
        
        console.log('🎯 Gallery rendered - flexbox centering applied via HTML');
        
        // DEBUG: Check actual gallery positioning
        setTimeout(() => {
            const gallery = document.getElementById('gallery-grid');
            const container = gallery?.parentElement;
            
            console.log('🔍 GALLERY DEBUG:');
            const galleryStyles = window.getComputedStyle(gallery);
            const containerStyles = window.getComputedStyle(container);
            const galleryRect = gallery.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            console.log('Gallery width:', galleryStyles.width);
            console.log('Gallery maxWidth:', galleryStyles.maxWidth);
            console.log('Gallery margin:', galleryStyles.margin);
            console.log('Gallery marginLeft:', galleryStyles.marginLeft);
            console.log('Gallery marginRight:', galleryStyles.marginRight);
            
            console.log('Container width:', containerStyles.width);
            console.log('Container paddingLeft:', containerStyles.paddingLeft);
            console.log('Container paddingRight:', containerStyles.paddingRight);
            
            console.log('Gallery rect - x:', galleryRect.x, 'width:', galleryRect.width);
            console.log('Container rect - x:', containerRect.x, 'width:', containerRect.width);
            
            console.log('Gallery classes:', gallery.className);
            console.log('Container classes:', container.className);
        }, 100);

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            if (endIndex < this.filteredItems.length) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        }
    }

    loadMoreItems() {
        this.currentPage++;
        this.renderGallery();
    }

    openLightbox(index) {
        this.currentLightboxIndex = index;
        this.lightboxOpen = true;
        
        const lightbox = document.getElementById('lightbox');
        const item = this.filteredItems[index];
        
        if (!lightbox || !item) return;

        // Update lightbox content
        document.getElementById('lightbox-image').src = item.imageUrl;
        document.getElementById('lightbox-title').textContent = item.title || `${item.eventType.replace('-', ' ')} Event`;
        document.getElementById('lightbox-description').textContent = item.description || '';
        document.getElementById('lightbox-venue').textContent = item.venue || '';
        document.getElementById('lightbox-date').textContent = item.eventDate ? new Date(item.eventDate).toLocaleDateString() : '';
        document.getElementById('lightbox-views').textContent = `${item.views || 0} views`;
        
        // Update tags
        const tagsContainer = document.getElementById('lightbox-tags');
        tagsContainer.innerHTML = (item.tags || []).map(tag => 
            `<span class="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded">${tag}</span>`
        ).join('');
        
        // Show lightbox
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Track view (in a real app, this would be an API call)
        this.trackView(item.id);
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
            this.lightboxOpen = false;
        }
    }

    previousImage() {
        if (this.currentLightboxIndex > 0) {
            this.openLightbox(this.currentLightboxIndex - 1);
        }
    }

    nextImage() {
        if (this.currentLightboxIndex < this.filteredItems.length - 1) {
            this.openLightbox(this.currentLightboxIndex + 1);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('gallery-loading');
        const grid = document.getElementById('gallery-grid');
        
        if (loading && grid) {
            if (show) {
                loading.classList.remove('hidden');
                grid.classList.add('hidden');
            } else {
                loading.classList.add('hidden');
                grid.classList.remove('hidden');
            }
        }
    }

    async trackView(itemId) {
        try {
            await fetch(`/api/gallery/${itemId}`, {
                method: 'GET'
            });
        } catch (error) {
            console.log('Failed to track view:', error);
        }
    }
}

// Initialize the gallery when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoGallery();
});
