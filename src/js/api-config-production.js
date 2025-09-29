/**
 * Production API Configuration
 * Update the BASE_URL with your deployed backend URL
 */
const APIConfig = {
    // 🔄 CHANGE THIS to your deployed backend URL
    BASE_URL: 'http://localhost:5000', // Default for local development
    
    // 🌐 Production URLs (uncomment the one you're using):
    // BASE_URL: 'https://your-app-name.onrender.com',      // Render
    // BASE_URL: 'https://your-app-name.up.railway.app',   // Railway  
    // BASE_URL: 'https://your-app-name.vercel.app',       // Vercel
    
    // Request timeout
    TIMEOUT: 30000, // 30 seconds
    
    // Helper method for making requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            timeout: this.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        // Merge options
        const requestOptions = { ...defaultOptions, ...options };
        
        // Handle FormData (don't set Content-Type for FormData)
        if (options.body instanceof FormData) {
            delete requestOptions.headers['Content-Type'];
        }
        
        try {
            console.log(`🌐 Making request to: ${url}`);
            
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If JSON parsing fails, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('✅ Request successful:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Request failed:', error);
            
            // Provide user-friendly error messages
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to backend server. Please check if the backend is running and the URL is correct.');
            } else {
                throw error;
            }
        }
    }
};

// Auto-detect environment and suggest configuration
(function() {
    const currentHost = window.location.host;
    const isLocalhost = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
    const isGitHubPages = currentHost.includes('github.io');
    const isNetlify = currentHost.includes('netlify.app');
    const isVercel = currentHost.includes('vercel.app');
    
    console.log('🔍 Environment Detection:');
    console.log('Current host:', currentHost);
    console.log('Current API URL:', APIConfig.BASE_URL);
    
    if (isLocalhost && APIConfig.BASE_URL.includes('localhost')) {
        console.log('✅ Local development setup detected');
    } else if (!isLocalhost && APIConfig.BASE_URL.includes('localhost')) {
        console.warn('⚠️  Production environment detected but using localhost API URL!');
        console.warn('📝 Please update BASE_URL in api-config.js to your deployed backend URL');
        
        if (isGitHubPages) {
            console.log('💡 GitHub Pages detected - consider using Render or Railway for backend');
        }
    }
})();