# API Setup Instructions

## Setting up your API Key

To connect your frontend to the deployed backend at `https://coldmailbot-api.onrender.com`, you need to configure your API key.

### Steps:

1. **Get your API Key from the backend**
   - Contact the backend administrator
   - Or check the backend server logs for the generated API key
   - The API key should be a secure string like: `your-secure-api-key-123`

2. **Update the frontend configuration**
   - Open `src/js/api-config.js`
   - Replace `'your-api-key-here'` with your actual API key:
   ```javascript
   static API_KEY = 'your-actual-api-key-from-backend';
   ```

3. **Test the connection**
   - Open the application in your browser
   - Go through steps 1 and 2 (upload files, enter Gmail credentials)
   - Click "Test Gmail Connection" to verify API connectivity

### Configuration File Location:
- **File:** `src/js/api-config.js`
- **Line to update:** `static API_KEY = 'your-api-key-here';`

### API Endpoints Used:
- **Health Check:** `GET /health`
- **Test Connection:** `POST /api/test-connection`
- **Send Emails:** `GET /api/send-emails` (Server-Sent Events)

### Troubleshooting:

1. **"API Connection Failed" Error:**
   - Check if the API key is correct
   - Verify internet connection
   - Ensure the backend at `https://coldmailbot-api.onrender.com` is running

2. **"Invalid API Key" Error:**
   - Double-check the API key in `api-config.js`
   - Make sure there are no extra spaces or quotes

3. **"Request timeout" Error:**
   - The API might be sleeping (Render free tier)
   - Wait a few seconds and try again
   - Check if the API URL is correct

### Security Note:
- Never commit your actual API key to version control
- Consider using environment variables for production
- The current setup is for development/testing purposes