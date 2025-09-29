/**
 * Local Backend Configuration - Using Automation Script
 */
class APIConfig {
    static BASE_URL = 'https://coldmailbot-api-1.onrender.com';
    
    // No API key needed for local backend
    static API_KEY = null;
    
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
        const url = this.buildURL(endpoint);
        
        try {
            const response = await fetch(url, {
                ...options,
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
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to backend server. Please check your internet connection.');
            }
            throw error;
        }
    }
    
    /**
     * Test API connection
     * @returns {Promise<boolean>} Connection status
     */
    static async testConnection() {
        try {
            const response = await this.makeRequest('/health', { method: 'GET' });
            return response.status === 'healthy';
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}