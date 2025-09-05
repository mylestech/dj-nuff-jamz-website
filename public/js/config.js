/**
 * DJ Nuff Jamz Website Configuration
 * Centralized configuration for API endpoints and settings
 */

// API Configuration
const API_CONFIG = {
    // Backend API base URL
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3001/api'  // Development
        : '/api',  // Production (assuming reverse proxy)
    
    // Endpoints
    ENDPOINTS: {
        HEALTH: '/health',
        MUSIC: '/music',
        GALLERY: '/gallery',
        TESTIMONIALS: '/testimonials',
        BOOKING: '/booking',
        CONTACT: '/contact',
        ADMIN: '/admin',
        CALENDAR: '/calendar',
        EMAIL: '/email',
        ANALYTICS: '/analytics'
    },
    
    // Request timeout
    TIMEOUT: 10000,
    
    // Default headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// API Helper Functions
const API = {
    /**
     * Make a GET request to the API
     */
    async get(endpoint, params = {}) {
        const url = new URL(API_CONFIG.BASE_URL + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: API_CONFIG.HEADERS,
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API GET Error (${endpoint}):`, error);
            throw error;
        }
    },

    /**
     * Make a POST request to the API
     */
    async post(endpoint, data = {}, options = {}) {
        try {
            const headers = { ...API_CONFIG.HEADERS, ...options.headers };
            
            // Handle FormData (for file uploads)
            const body = data instanceof FormData ? data : JSON.stringify(data);
            if (data instanceof FormData) {
                delete headers['Content-Type']; // Let browser set it for FormData
            }

            const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
                method: 'POST',
                headers,
                body,
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API POST Error (${endpoint}):`, error);
            throw error;
        }
    },

    /**
     * Make a PUT request to the API
     */
    async put(endpoint, data = {}, options = {}) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
                method: 'PUT',
                headers: { ...API_CONFIG.HEADERS, ...options.headers },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API PUT Error (${endpoint}):`, error);
            throw error;
        }
    },

    /**
     * Make a DELETE request to the API
     */
    async delete(endpoint, options = {}) {
        try {
            const response = await fetch(API_CONFIG.BASE_URL + endpoint, {
                method: 'DELETE',
                headers: { ...API_CONFIG.HEADERS, ...options.headers },
                signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API DELETE Error (${endpoint}):`, error);
            throw error;
        }
    },

    /**
     * Add authentication token to headers
     */
    withAuth(token) {
        return {
            headers: {
                ...API_CONFIG.HEADERS,
                'Authorization': `Bearer ${token}`
            }
        };
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
window.API = API;

// Test API connection on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🔗 Testing API connection...');
        const health = await API.get(API_CONFIG.ENDPOINTS.HEALTH);
        console.log('✅ API connection successful:', health);
    } catch (error) {
        console.error('❌ API connection failed:', error);
        console.warn('🔄 Some features may not work properly. Please check if the backend server is running on port 3001.');
    }
});

console.log('📡 API Configuration loaded:', API_CONFIG.BASE_URL);
