/**
 * Local Backend Configuration - Using Automation Script
 */
class APIConfig {
    static BASE_URL = 'https://coldmailbot-api-1.onrender.com';
    
    // No API key needed for local backend
    static API_KEY = null;
    
    // CORS proxy for GitHub Pages compatibility
    static CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    
    // Detect if we're in development mode
    static isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' || 
               window.location.protocol === 'file:';
    }
    
    // Check if current port matches backend CORS settings
    static isCompatiblePort() {
        return window.location.port === '3000' || 
               window.location.origin === 'http://localhost:3000';
    }
    
    /**
     * Get headers for API requests
     * @returns {Object} Headers object
     */
    static getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    /**
     * Get headers for multipart form data (file uploads)
     * @returns {Object} Headers object (without Content-Type)
     */
    static getMultipartHeaders() {
        return {
            'Accept': 'application/json'
            // Don't set Content-Type for FormData - browser will set it automatically with boundary
        };
    }
    
    /**
     * Build full API URL
     * @param {string} endpoint - API endpoint path
     * @returns {string} Full API URL
     */
    static buildURL(endpoint) {
        return `${this.BASE_URL}${endpoint}`;
    }
    
    /**
     * Handle API errors consistently
     * @param {Response} response - Fetch response
     * @param {string} operation - Operation being performed
     * @throws {Error} Formatted error with details
     */
    static async handleAPIError(response, operation) {
        let errorMessage = `${operation} failed`;
        
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
            errorMessage = `${operation} failed with status ${response.status}`;
        }
        
        throw new Error(errorMessage);
    }
    
    /**
     * Make API request with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} API response
     */
    static async makeRequest(endpoint, options = {}) {
        // For local development on incompatible ports, use proxy immediately
        if (this.isDevelopment() && !this.isCompatiblePort() && (!options.method || options.method === 'GET')) {
            console.log('🔄 Using CORS proxy for local development on port', window.location.port);
            return this.makeRequestWithProxy(endpoint, options);
        }
        
        const url = this.buildURL(endpoint);
        
        try {
            const response = await fetch(url, {
                ...options,
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    ...options.headers,
                    ...this.getHeaders()
                }
            });
            
            if (!response.ok) {
                await this.handleAPIError(response, options.method || 'Request');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            
            // For local development CORS errors, try proxy
            if (this.isDevelopment() && error.name === 'TypeError' && 
                (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
                console.log('🔄 CORS error in local dev, trying proxy...');
                if (!options.method || options.method === 'GET') {
                    return this.makeRequestWithProxy(endpoint, options);
                }
            }
            
            // Check for CORS errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                if (error.message.includes('CORS') || error.message.includes('Network request failed')) {
                    throw new Error(`CORS Error: Please run on port 3000 (http://localhost:3000) or the backend needs to allow ${window.location.origin}`);
                } else {
                    throw new Error('Cannot connect to backend server. The backend might be starting up (wait 1-2 minutes) or there could be network issues.');
                }
            }
            
            // Handle other errors
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network Error: Cannot reach the backend server. Please check your internet connection or try again later.');
            }
            
            throw error;
        }
    }
    
    /**
     * Test API connection with CORS fallback
     * @returns {Promise<{connected: boolean, error?: string, method?: string}>} Connection status with details
     */
    static async testConnection() {
        // First try direct connection
        try {
            const response = await this.makeRequest('/health', { method: 'GET' });
            return { 
                connected: response.status === 'healthy',
                error: null,
                method: 'direct'
            };
        } catch (error) {
            console.log('Direct connection failed, trying CORS proxy...', error.message);
            
            // If CORS error, try with proxy
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                try {
                    const proxyUrl = this.CORS_PROXY + encodeURIComponent(this.BASE_URL + '/health');
                    const response = await fetch(proxyUrl);
                    
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            connected: data.status === 'healthy',
                            error: null,
                            method: 'proxy'
                        };
                    }
                } catch (proxyError) {
                    console.error('Proxy connection also failed:', proxyError);
                }
            }
            
            return {
                connected: false,
                error: error.message,
                method: 'failed'
            };
        }
    }
    
    /**
     * Make API request using CORS proxy
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} API response
     */
    static async makeRequestWithProxy(endpoint, options = {}) {
        const proxyUrl = this.CORS_PROXY + encodeURIComponent(this.buildURL(endpoint));
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Proxy request failed with status ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Make API request with CORS proxy fallback
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} API response
     */
    static async makeRequestWithFallback(endpoint, options = {}) {
        try {
            // Try direct request first
            return await this.makeRequest(endpoint, options);
        } catch (error) {
            // If CORS error and it's a GET request, try proxy
            if ((error.message.includes('CORS') || error.message.includes('fetch')) && 
                (!options.method || options.method === 'GET')) {
                
                console.log('Trying CORS proxy for GET request...');
                return this.makeRequestWithProxy(endpoint, options);
            }
            
            // For non-GET requests or if proxy also fails, throw the original error
            throw error;
        }
    }
}