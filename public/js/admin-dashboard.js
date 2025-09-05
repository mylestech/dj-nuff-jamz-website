/**
 * DJ Nuff Jamz Admin Dashboard
 * Comprehensive admin panel for content management
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.isAuthenticated = false;
        this.userData = null;
        this.notifications = [];
        
        this.init();
    }

    async init() {
        try {
            // Check authentication
            await this.checkAuthentication();
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Initialize navigation
            this.initNavigation();
            
            console.log('Admin Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize admin dashboard:', error);
            this.showNotification('Failed to initialize dashboard', 'error');
        }
    }

    async checkAuthentication() {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('adminToken');
            if (!token) {
                this.redirectToLogin();
                return;
            }

            // Validate token with backend
            const response = await fetch('/api/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.isAuthenticated = true;
                this.userData = data.data;
            } else {
                // Token is invalid
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                this.redirectToLogin();
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        // Redirect to login page (you can create this)
        window.location.href = '/admin-login.html';
    }

    initEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.querySelector('span').textContent.trim();
                this.handleQuickAction(action);
            });
        });

        // Notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.showNotifications());
        }
    }

    initNavigation() {
        // Set active navigation item
        this.updateActiveNavigation('dashboard');
    }

    updateActiveNavigation(section) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[href="#${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.add('hidden');
        });

        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentSection = section;
            this.updateActiveNavigation(section);
            
            // Load section-specific data
            this.loadSectionData(section);
        }
    }

    async loadSectionData(section) {
        this.showLoading(true);
        
        try {
            switch (section) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'bookings':
                    await this.loadBookingsData();
                    break;
                case 'music':
                    await this.loadMusicData();
                    break;
                case 'gallery':
                    await this.loadGalleryData();
                    break;
                case 'testimonials':
                    await this.loadTestimonialsData();
                    break;
                case 'analytics':
                    await this.loadAnalyticsData();
                    break;
                case 'email':
                    await this.loadEmailData();
                    break;
                case 'calendar':
                    await this.loadCalendarData();
                    break;
                case 'settings':
                    await this.loadSettingsData();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section} data:`, error);
            this.showNotification(`Failed to load ${section} data`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadDashboardData() {
        try {
            // Load dashboard statistics
            const stats = await this.fetchDashboardStats();
            this.updateDashboardStats(stats);
            
            // Load recent bookings
            const recentBookings = await this.fetchRecentBookings();
            this.updateRecentBookings(recentBookings);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Use mock data as fallback
            this.loadMockDashboardData();
        }
    }

    async fetchDashboardStats() {
        try {
            // Wait for API config to be available
            if (typeof API === 'undefined') {
                await new Promise(resolve => {
                    const checkAPI = () => {
                        if (typeof API !== 'undefined') {
                            resolve();
                        } else {
                            setTimeout(checkAPI, 100);
                        }
                    };
                    checkAPI();
                });
            }

            const token = localStorage.getItem('adminToken');
            const data = await API.get(`${API_CONFIG.ENDPOINTS.ADMIN}/dashboard-stats`, {}, API.withAuth(token));
            return data.data;
        } catch (error) {
            console.error('❌ Failed to fetch dashboard stats:', error);
        }
        
        // Return mock data
        return {
            totalBookings: 47,
            totalRevenue: '₦2,450,000',
            websiteVisitors: 1234,
            conversionRate: '3.2%'
        };
    }

    async fetchRecentBookings() {
        try {
            const response = await fetch('/api/bookings?limit=5&sort=desc');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch recent bookings:', error);
        }
        
        // Return mock data
        return [
            {
                id: 1,
                clientName: 'Adebayo Industries',
                eventType: 'Corporate Event',
                eventDate: '2024-09-15',
                status: 'confirmed',
                amount: '₦350,000'
            },
            {
                id: 2,
                clientName: 'Lagos Wedding Planners',
                eventType: 'Wedding Reception',
                eventDate: '2024-09-20',
                status: 'pending',
                amount: '₦500,000'
            },
            {
                id: 3,
                clientName: 'Kemi\'s Birthday Bash',
                eventType: 'Private Party',
                eventDate: '2024-09-25',
                status: 'confirmed',
                amount: '₦200,000'
            }
        ];
    }

    updateDashboardStats(stats) {
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('totalRevenue').textContent = stats.totalRevenue;
        document.getElementById('websiteVisitors').textContent = stats.websiteVisitors;
        document.getElementById('conversionRate').textContent = stats.conversionRate;
    }

    updateRecentBookings(bookings) {
        const container = document.getElementById('recentBookings');
        if (!container) return;

        container.innerHTML = bookings.map(booking => `
            <div class="data-list-item">
                <div class="data-list-item-content">
                    <div class="data-list-item-title">${booking.clientName}</div>
                    <div class="data-list-item-subtitle">${booking.eventType} • ${new Date(booking.eventDate).toLocaleDateString()}</div>
                </div>
                <div class="data-list-item-actions">
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                    <span class="text-green-400 font-semibold">${booking.amount}</span>
                </div>
            </div>
        `).join('');
    }

    loadMockDashboardData() {
        this.updateDashboardStats({
            totalBookings: 47,
            totalRevenue: '₦2,450,000',
            websiteVisitors: 1234,
            conversionRate: '3.2%'
        });
    }

    async loadBookingsData() {
        const content = document.getElementById('bookingsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">Booking Requests</h3>
                    <p class="admin-card-subtitle">Manage incoming booking requests and confirmed events</p>
                </div>
                
                <div class="mb-6">
                    <div class="flex flex-wrap gap-4">
                        <button class="btn-admin btn-admin-primary">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add Booking
                        </button>
                        <button class="btn-admin btn-admin-secondary">Export CSV</button>
                        <select class="form-select w-auto">
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Event Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="bookingsTableBody">
                            <!-- Bookings will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Load bookings data
        const bookings = await this.fetchAllBookings();
        this.populateBookingsTable(bookings);
    }

    async fetchAllBookings() {
        try {
            const response = await fetch('/api/bookings');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }

        // Return mock data
        return [
            {
                id: 1,
                clientName: 'Adebayo Industries',
                clientEmail: 'contact@adebayoindustries.com',
                eventType: 'Corporate Event',
                eventDate: '2024-09-15',
                status: 'confirmed',
                amount: 350000,
                notes: 'Annual company party'
            },
            {
                id: 2,
                clientName: 'Lagos Wedding Planners',
                clientEmail: 'info@lagosweddings.com',
                eventType: 'Wedding Reception',
                eventDate: '2024-09-20',
                status: 'pending',
                amount: 500000,
                notes: 'Outdoor wedding reception'
            }
        ];
    }

    populateBookingsTable(bookings) {
        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        tbody.innerHTML = bookings.map(booking => `
            <tr>
                <td>
                    <div>
                        <div class="font-medium text-white">${booking.clientName}</div>
                        <div class="text-sm text-gray-400">${booking.clientEmail}</div>
                    </div>
                </td>
                <td>${booking.eventType}</td>
                <td>${new Date(booking.eventDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                </td>
                <td class="text-green-400 font-semibold">₦${booking.amount.toLocaleString()}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-admin btn-admin-primary text-xs px-2 py-1" onclick="adminDashboard.editBooking(${booking.id})">Edit</button>
                        <button class="btn-admin btn-admin-success text-xs px-2 py-1" onclick="adminDashboard.confirmBooking(${booking.id})">Confirm</button>
                        <button class="btn-admin btn-admin-danger text-xs px-2 py-1" onclick="adminDashboard.deleteBooking(${booking.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadMusicData() {
        const content = document.getElementById('musicContent');
        if (!content) return;

        content.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">Music Library</h3>
                    <p class="admin-card-subtitle">Upload and manage your music tracks</p>
                </div>
                
                <div class="mb-6">
                    <div class="flex flex-wrap gap-4">
                        <button class="btn-admin btn-admin-primary" onclick="adminDashboard.showUploadModal('music')">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            Upload Music
                        </button>
                        <button class="btn-admin btn-admin-secondary">Bulk Upload</button>
                        <select class="form-select w-auto">
                            <option>All Genres</option>
                            <option>Afrobeats</option>
                            <option>Hip Hop</option>
                            <option>R&B</option>
                            <option>Electronic</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="musicGrid">
                    <!-- Music tracks will be loaded here -->
                </div>
            </div>
        `;

        // Load music data
        const tracks = await this.fetchMusicTracks();
        this.populateMusicGrid(tracks);
    }

    async fetchMusicTracks() {
        try {
            const response = await fetch('/api/music');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch music tracks:', error);
        }

        // Return mock data
        return [
            {
                id: 1,
                title: 'Afrobeat Vibes',
                artist: 'DJ Nuff Jamz',
                genre: 'Afrobeats',
                duration: '3:45',
                plays: 1250,
                audioUrl: '/audio/uploads/afrobeat-vibes.mp3',
                coverUrl: '/images/music/afrobeat-vibes.jpg'
            },
            {
                id: 2,
                title: 'Lagos Nights',
                artist: 'DJ Nuff Jamz',
                genre: 'Electronic',
                duration: '4:20',
                plays: 890,
                audioUrl: '/audio/uploads/lagos-nights.mp3',
                coverUrl: '/images/music/lagos-nights.jpg'
            }
        ];
    }

    populateMusicGrid(tracks) {
        const grid = document.getElementById('musicGrid');
        if (!grid) return;

        grid.innerHTML = tracks.map(track => `
            <div class="admin-card">
                <div class="aspect-w-1 aspect-h-1 mb-4">
                    <img src="${track.coverUrl}" alt="${track.title}" class="w-full h-48 object-cover rounded-lg" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNEI1NTYzIi8+CjxwYXRoIGQ9Ik04MCA2MEMxMDQuMzUzIDYwIDEyNCA3OS42NDcgMTI0IDEwNEMxMjQgMTI4LjM1MyAxMDQuMzUzIDE0OCA4MCAxNDhDNTUuNjQ3IDE0OCAzNiAxMjguMzUzIDM2IDEwNEMzNiA3OS42NDcgNTUuNjQ3IDYwIDgwIDYwWiIgZmlsbD0id2hpdGUiLz4KPHA+PC9zdmc+Cg=='">
                </div>
                <h4 class="font-semibold text-white mb-1">${track.title}</h4>
                <p class="text-sm text-gray-400 mb-2">${track.artist}</p>
                <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>${track.genre}</span>
                    <span>${track.duration}</span>
                </div>
                <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>${track.plays} plays</span>
                </div>
                <div class="flex space-x-2">
                    <button class="btn-admin btn-admin-primary text-xs px-2 py-1 flex-1" onclick="adminDashboard.editTrack(${track.id})">Edit</button>
                    <button class="btn-admin btn-admin-danger text-xs px-2 py-1" onclick="adminDashboard.deleteTrack(${track.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async loadGalleryData() {
        const content = document.getElementById('galleryContent');
        if (!content) return;

        content.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">Photo Gallery</h3>
                    <p class="admin-card-subtitle">Manage your event photos and portfolio</p>
                </div>
                
                <div class="mb-6">
                    <div class="flex flex-wrap gap-4">
                        <button class="btn-admin btn-admin-primary" onclick="adminDashboard.showUploadModal('gallery')">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            Upload Photos
                        </button>
                        <button class="btn-admin btn-admin-secondary">Bulk Upload</button>
                        <select class="form-select w-auto">
                            <option>All Events</option>
                            <option>Weddings</option>
                            <option>Corporate</option>
                            <option>Private Parties</option>
                            <option>Clubs</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="galleryGrid">
                    <!-- Gallery images will be loaded here -->
                </div>
            </div>
        `;

        // Load gallery data
        const images = await this.fetchGalleryImages();
        this.populateGalleryGrid(images);
    }

    async fetchGalleryImages() {
        try {
            const response = await fetch('/api/gallery');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch gallery images:', error);
        }

        // Return mock data
        return [
            {
                id: 1,
                title: 'Corporate Event Lagos',
                eventType: 'Corporate',
                imageUrl: '/images/gallery/corporate-1.jpg',
                thumbnailUrl: '/images/gallery/thumbnails/corporate-1.jpg',
                uploadDate: '2024-08-15'
            },
            {
                id: 2,
                title: 'Wedding Reception Abuja',
                eventType: 'Wedding',
                imageUrl: '/images/gallery/wedding-1.jpg',
                thumbnailUrl: '/images/gallery/thumbnails/wedding-1.jpg',
                uploadDate: '2024-08-20'
            }
        ];
    }

    populateGalleryGrid(images) {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        grid.innerHTML = images.map(image => `
            <div class="relative group">
                <img src="${image.thumbnailUrl}" alt="${image.title}" 
                     class="w-full h-32 object-cover rounded-lg cursor-pointer"
                     onclick="adminDashboard.viewImage('${image.imageUrl}')"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjNEI1NTYzIi8+CjxwYXRoIGQ9Ik04MCA0NEMxMDAuNDA5IDQ0IDExNyA2MC41OTA5IDExNyA4MUMxMTcgMTAxLjQwOSAxMDAuNDA5IDExOCA4MCAxMThDNTkuNTkwOSAxMTggNDMgMTAxLjQwOSA0MyA4MUM0MyA2MC41OTA5IDU5LjU5MDkgNDQgODAgNDRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'">
                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <div class="flex space-x-2">
                        <button class="btn-admin btn-admin-primary text-xs px-2 py-1" onclick="adminDashboard.editImage(${image.id})">Edit</button>
                        <button class="btn-admin btn-admin-danger text-xs px-2 py-1" onclick="adminDashboard.deleteImage(${image.id})">Delete</button>
                    </div>
                </div>
                <div class="mt-2">
                    <p class="text-sm text-white truncate">${image.title}</p>
                    <p class="text-xs text-gray-400">${image.eventType}</p>
                </div>
            </div>
        `).join('');
    }

    async loadTestimonialsData() {
        const content = document.getElementById('testimonialsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">Client Testimonials</h3>
                    <p class="admin-card-subtitle">Manage client reviews and testimonials</p>
                </div>
                
                <div class="mb-6">
                    <button class="btn-admin btn-admin-primary" onclick="adminDashboard.addTestimonial()">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Testimonial
                    </button>
                </div>

                <div class="space-y-4" id="testimonialsList">
                    <!-- Testimonials will be loaded here -->
                </div>
            </div>
        `;

        // Load testimonials data
        const testimonials = await this.fetchTestimonials();
        this.populateTestimonialsList(testimonials);
    }

    async fetchTestimonials() {
        // Mock data for now
        return [
            {
                id: 1,
                clientName: 'Adebayo Industries',
                clientTitle: 'CEO',
                testimonial: 'DJ Nuff Jamz made our corporate event absolutely amazing! The music selection was perfect and kept everyone dancing all night.',
                rating: 5,
                eventType: 'Corporate Event',
                date: '2024-08-15',
                approved: true
            },
            {
                id: 2,
                clientName: 'Kemi & Tunde',
                clientTitle: 'Newlyweds',
                testimonial: 'Our wedding was perfect thanks to DJ Nuff Jamz. He understood exactly what we wanted and delivered beyond our expectations.',
                rating: 5,
                eventType: 'Wedding',
                date: '2024-08-20',
                approved: true
            }
        ];
    }

    populateTestimonialsList(testimonials) {
        const list = document.getElementById('testimonialsList');
        if (!list) return;

        list.innerHTML = testimonials.map(testimonial => `
            <div class="admin-card">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-semibold text-white">${testimonial.clientName}</h4>
                        <p class="text-sm text-gray-400">${testimonial.clientTitle} • ${testimonial.eventType}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="flex text-yellow-400">
                            ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                        </div>
                        <span class="status-badge ${testimonial.approved ? 'status-confirmed' : 'status-pending'}">
                            ${testimonial.approved ? 'Approved' : 'Pending'}
                        </span>
                    </div>
                </div>
                <p class="text-gray-300 mb-4">"${testimonial.testimonial}"</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${new Date(testimonial.date).toLocaleDateString()}</span>
                    <div class="flex space-x-2">
                        <button class="btn-admin btn-admin-primary text-xs px-2 py-1" onclick="adminDashboard.editTestimonial(${testimonial.id})">Edit</button>
                        <button class="btn-admin btn-admin-success text-xs px-2 py-1" onclick="adminDashboard.approveTestimonial(${testimonial.id})">Approve</button>
                        <button class="btn-admin btn-admin-danger text-xs px-2 py-1" onclick="adminDashboard.deleteTestimonial(${testimonial.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadAnalyticsData() {
        const content = document.getElementById('analyticsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="admin-card">
                    <h3 class="admin-card-title mb-4">Website Traffic</h3>
                    <div class="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                        <p class="text-gray-400">Traffic Chart Placeholder</p>
                    </div>
                </div>
                
                <div class="admin-card">
                    <h3 class="admin-card-title mb-4">Booking Conversion</h3>
                    <div class="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                        <p class="text-gray-400">Conversion Chart Placeholder</p>
                    </div>
                </div>
                
                <div class="admin-card">
                    <h3 class="admin-card-title mb-4">Popular Music Tracks</h3>
                    <div class="space-y-3" id="popularTracks">
                        <!-- Popular tracks will be loaded here -->
                    </div>
                </div>
                
                <div class="admin-card">
                    <h3 class="admin-card-title mb-4">Event Types Performance</h3>
                    <div class="space-y-3" id="eventPerformance">
                        <!-- Event performance will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Load analytics data
        await this.loadPopularTracks();
        await this.loadEventPerformance();
    }

    async loadPopularTracks() {
        const tracks = [
            { title: 'Afrobeat Vibes', plays: 1250, percentage: 85 },
            { title: 'Lagos Nights', plays: 890, percentage: 60 },
            { title: 'Wedding Bliss', plays: 750, percentage: 50 },
            { title: 'Corporate Groove', plays: 600, percentage: 40 }
        ];

        const container = document.getElementById('popularTracks');
        if (!container) return;

        container.innerHTML = tracks.map(track => `
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-white font-medium">${track.title}</p>
                    <p class="text-sm text-gray-400">${track.plays} plays</p>
                </div>
                <div class="w-24">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${track.percentage}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadEventPerformance() {
        const events = [
            { type: 'Weddings', bookings: 15, revenue: 2500000, percentage: 90 },
            { type: 'Corporate', bookings: 12, revenue: 1800000, percentage: 70 },
            { type: 'Private Parties', bookings: 8, revenue: 800000, percentage: 45 },
            { type: 'Clubs', bookings: 5, revenue: 500000, percentage: 30 }
        ];

        const container = document.getElementById('eventPerformance');
        if (!container) return;

        container.innerHTML = events.map(event => `
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-white font-medium">${event.type}</p>
                    <p class="text-sm text-gray-400">${event.bookings} bookings • ₦${event.revenue.toLocaleString()}</p>
                </div>
                <div class="w-24">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${event.percentage}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadEmailData() {
        const content = document.getElementById('emailContent');
        if (!content) return;

        content.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">Email Templates</h3>
                    <p class="admin-card-subtitle">Manage automated email templates</p>
                </div>
                
                <div class="mb-6">
                    <button class="btn-admin btn-admin-primary" onclick="adminDashboard.createEmailTemplate()">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Create Template
                    </button>
                    <button class="btn-admin btn-admin-secondary ml-2" onclick="adminDashboard.sendTestEmail()">Send Test Email</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="emailTemplates">
                    <!-- Email templates will be loaded here -->
                </div>
            </div>
        `;

        // Load email templates
        const templates = await this.fetchEmailTemplates();
        this.populateEmailTemplates(templates);
    }

    async fetchEmailTemplates() {
        // Mock data for now
        return [
            {
                id: 1,
                name: 'Booking Confirmation',
                subject: 'Your DJ Booking is Confirmed!',
                type: 'booking_confirmation',
                lastModified: '2024-08-25',
                active: true
            },
            {
                id: 2,
                name: 'Contact Response',
                subject: 'Thank you for contacting DJ Nuff Jamz',
                type: 'contact_response',
                lastModified: '2024-08-20',
                active: true
            },
            {
                id: 3,
                name: 'Event Reminder',
                subject: 'Your Event is Coming Up!',
                type: 'event_reminder',
                lastModified: '2024-08-15',
                active: false
            }
        ];
    }

    populateEmailTemplates(templates) {
        const container = document.getElementById('emailTemplates');
        if (!container) return;

        container.innerHTML = templates.map(template => `
            <div class="admin-card">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-semibold text-white">${template.name}</h4>
                        <p class="text-sm text-gray-400">${template.subject}</p>
                    </div>
                    <span class="status-badge ${template.active ? 'status-confirmed' : 'status-pending'}">
                        ${template.active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p class="text-sm text-gray-500 mb-4">Last modified: ${new Date(template.lastModified).toLocaleDateString()}</p>
                <div class="flex space-x-2">
                    <button class="btn-admin btn-admin-primary text-xs px-2 py-1" onclick="adminDashboard.editEmailTemplate(${template.id})">Edit</button>
                    <button class="btn-admin btn-admin-secondary text-xs px-2 py-1" onclick="adminDashboard.previewEmailTemplate(${template.id})">Preview</button>
                    <button class="btn-admin btn-admin-success text-xs px-2 py-1" onclick="adminDashboard.toggleEmailTemplate(${template.id})">
                        ${template.active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadCalendarData() {
        const content = document.getElementById('calendarContent');
        if (!content) return;

        content.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3 class="admin-card-title">Calendar Management</h3>
                    <p class="admin-card-subtitle">Manage your event calendar and availability</p>
                </div>
                
                <div class="mb-6">
                    <div class="flex flex-wrap gap-4">
                        <button class="btn-admin btn-admin-primary" onclick="adminDashboard.addCalendarEvent()">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Add Event
                        </button>
                        <button class="btn-admin btn-admin-secondary">Sync with Google Calendar</button>
                        <button class="btn-admin btn-admin-secondary">Export Calendar</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <div class="bg-slate-700 rounded-lg p-6 h-96 flex items-center justify-center">
                            <p class="text-gray-400">Calendar Widget Placeholder</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Upcoming Events</h4>
                        <div class="space-y-3" id="upcomingEvents">
                            <!-- Upcoming events will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load upcoming events
        const events = await this.fetchUpcomingEvents();
        this.populateUpcomingEvents(events);
    }

    async fetchUpcomingEvents() {
        // Mock data for now
        return [
            {
                id: 1,
                title: 'Corporate Event - Adebayo Industries',
                date: '2024-09-15',
                time: '18:00',
                location: 'Victoria Island, Lagos',
                status: 'confirmed'
            },
            {
                id: 2,
                title: 'Wedding Reception',
                date: '2024-09-20',
                time: '16:00',
                location: 'Lekki, Lagos',
                status: 'pending'
            }
        ];
    }

    populateUpcomingEvents(events) {
        const container = document.getElementById('upcomingEvents');
        if (!container) return;

        container.innerHTML = events.map(event => `
            <div class="data-list-item">
                <div class="data-list-item-content">
                    <div class="data-list-item-title">${event.title}</div>
                    <div class="data-list-item-subtitle">${new Date(event.date).toLocaleDateString()} at ${event.time}</div>
                    <div class="data-list-item-subtitle">${event.location}</div>
                </div>
                <div class="data-list-item-actions">
                    <span class="status-badge status-${event.status}">${event.status}</span>
                </div>
            </div>
        `).join('');
    }

    async loadSettingsData() {
        const content = document.getElementById('settingsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3 class="admin-card-title">General Settings</h3>
                    </div>
                    <form class="admin-form">
                        <div class="form-group">
                            <label class="form-label">Business Name</label>
                            <input type="text" class="form-input" value="DJ Nuff Jamz">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact Email</label>
                            <input type="email" class="form-input" value="info@djnuffjamz.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" class="form-input" value="+234 xxx xxx xxxx">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Business Address</label>
                            <textarea class="form-textarea" rows="3">Lagos, Nigeria</textarea>
                        </div>
                        <button type="submit" class="btn-admin btn-admin-primary">Save Changes</button>
                    </form>
                </div>

                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3 class="admin-card-title">Notification Settings</h3>
                    </div>
                    <form class="admin-form">
                        <div class="form-group">
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" checked>
                                <span class="form-label mb-0">Email notifications for new bookings</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" checked>
                                <span class="form-label mb-0">SMS notifications for urgent requests</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2">
                                <span class="form-label mb-0">Weekly analytics reports</span>
                            </label>
                        </div>
                        <button type="submit" class="btn-admin btn-admin-primary">Save Preferences</button>
                    </form>
                </div>

                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3 class="admin-card-title">Security Settings</h3>
                    </div>
                    <form class="admin-form">
                        <div class="form-group">
                            <label class="form-label">Current Password</label>
                            <input type="password" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <input type="password" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirm New Password</label>
                            <input type="password" class="form-input">
                        </div>
                        <button type="submit" class="btn-admin btn-admin-primary">Update Password</button>
                    </form>
                </div>

                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3 class="admin-card-title">Backup & Export</h3>
                    </div>
                    <div class="space-y-4">
                        <button class="btn-admin btn-admin-secondary w-full">Export All Data</button>
                        <button class="btn-admin btn-admin-secondary w-full">Backup Database</button>
                        <button class="btn-admin btn-admin-warning w-full">Import Data</button>
                        <button class="btn-admin btn-admin-danger w-full">Reset All Settings</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility Methods
    handleQuickAction(action) {
        switch (action) {
            case 'Add Music':
                this.showSection('music');
                this.showUploadModal('music');
                break;
            case 'Add Photos':
                this.showSection('gallery');
                this.showUploadModal('gallery');
                break;
            case 'Send Email':
                this.showSection('email');
                break;
            case 'View Analytics':
                this.showSection('analytics');
                break;
        }
    }

    showUploadModal(type) {
        // Implementation for upload modal
        this.showNotification(`${type} upload modal would open here`, 'info');
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        notification.innerHTML = `
            <div class="p-4">
                <div class="flex items-center">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-white">${message}</p>
                    </div>
                    <button class="ml-4 text-gray-400 hover:text-white" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showNotifications() {
        this.showNotification('Notifications panel would open here', 'info');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin-login.html';
        }
    }

    // Placeholder methods for CRUD operations
    editBooking(id) { this.showNotification(`Edit booking ${id}`, 'info'); }
    confirmBooking(id) { this.showNotification(`Confirm booking ${id}`, 'success'); }
    deleteBooking(id) { this.showNotification(`Delete booking ${id}`, 'warning'); }
    editTrack(id) { this.showNotification(`Edit track ${id}`, 'info'); }
    deleteTrack(id) { this.showNotification(`Delete track ${id}`, 'warning'); }
    editImage(id) { this.showNotification(`Edit image ${id}`, 'info'); }
    deleteImage(id) { this.showNotification(`Delete image ${id}`, 'warning'); }
    viewImage(url) { window.open(url, '_blank'); }
    editTestimonial(id) { this.showNotification(`Edit testimonial ${id}`, 'info'); }
    approveTestimonial(id) { this.showNotification(`Approve testimonial ${id}`, 'success'); }
    deleteTestimonial(id) { this.showNotification(`Delete testimonial ${id}`, 'warning'); }
    addTestimonial() { this.showNotification('Add testimonial form would open', 'info'); }
    createEmailTemplate() { this.showNotification('Create email template form would open', 'info'); }
    sendTestEmail() { this.showNotification('Test email sent!', 'success'); }
    editEmailTemplate(id) { this.showNotification(`Edit email template ${id}`, 'info'); }
    previewEmailTemplate(id) { this.showNotification(`Preview email template ${id}`, 'info'); }
    toggleEmailTemplate(id) { this.showNotification(`Toggle email template ${id}`, 'info'); }
    addCalendarEvent() { this.showNotification('Add calendar event form would open', 'info'); }
}

// Initialize the admin dashboard when the page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
