# Internship Email Automation - Integrated Frontend & Backend

A complete email automation system that combines a modern web frontend with your proven Python automation script as the backend.

## 🌟 Features

- **Web Frontend**: Modern, responsive interface for uploading files and managing campaigns
- **Python Backend**: Your trusted automation script logic integrated as a Flask web server
- **Real Email Sending**: Direct Gmail SMTP integration with resume attachments
- **Enhanced Templates**: Professional email templates with personalization
- **Contact Validation**: Advanced CSV processing and data cleaning
- **Real-time Progress**: Live updates during email sending

## 🏗️ Project Structure

```
internship-email-automation-web/
├── src/                          # Frontend files
│   ├── index.html               # Main web interface
│   ├── js/
│   │   ├── api-config.js        # Local backend configuration
│   │   ├── email-sender.js      # Frontend email logic
│   │   ├── csv-handler.js       # CSV processing
│   │   └── email-config-enhanced.js  # Enhanced templates
│   └── css/
├── automation script/            # Your original Python automation
│   ├── send_email.py            # Main automation logic
│   ├── email_config.md          # Email templates
│   ├── hr_contacts.csv          # Sample contacts
│   └── preview_email.py         # Preview functionality
├── backend_server.py            # Flask backend (integrates automation script)
├── requirements_backend.txt     # Python dependencies
├── start_backend.bat            # Windows startup script
└── start_backend.sh             # Linux/Mac startup script
```

## 🚀 Quick Start

### 1. Start the Backend

**Windows:**
```bash
# Double-click or run:
start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

**Manual:**
```bash
pip install -r requirements_backend.txt
python backend_server.py
```

### 2. Open the Frontend

- Open `src/index.html` in your web browser
- Or use a local server like Live Server in VS Code

### 3. Use the System

1. **Upload Files**: CSV with contacts, PDF resume
2. **Gmail Setup**: Enter your Gmail and app password
3. **Test Connection**: Verify Gmail and backend connectivity
4. **Send Emails**: Launch your automated campaign!

## 🔧 Backend Integration

The `backend_server.py` directly uses your automation script functions:

- **Email Templates**: From `automation script/email_config.md`
- **Text Processing**: Using `clean_text()` from `send_email.py`
- **Gmail Sending**: Using `send_email_via_gmail()` function
- **Personalization**: Using `generate_personalized_email()` logic

## 📧 Email Configuration

The system uses your email templates from `automation script/email_config.md`:

- **Subject**: "Exploring Internship Opportunities at {company}"
- **Body**: Your professional template with experience highlights
- **Variables**: `{hr_name}`, `{company}`, `{sender_name}`, `{sender_email}`

## 🔑 Gmail Setup

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Under "2-Step Verification", click "App passwords"
4. Generate a password for "Mail"
5. Use this 16-character password in the application

## 📊 CSV Format

Your contacts CSV should have these columns:

```csv
name,email,company
John Smith,john@company.com,Tech Corp
Jane Doe,jane@startup.com,Startup Inc
```

## 🌐 API Endpoints

When running, the backend provides:

- `GET /health` - Health check
- `POST /api/test-connection` - Test Gmail credentials  
- `POST /api/send-emails` - Send email campaign
- `POST /api/preview-email` - Preview email content

## 🔍 Troubleshooting

### Backend Not Starting
- Check Python installation: `python --version`
- Install dependencies: `pip install -r requirements_backend.txt`
- Check port 5000 is not in use

### Frontend Can't Connect
- Ensure backend is running on http://localhost:5000
- Check browser console for errors
- Verify no firewall blocking localhost connections

### Gmail Authentication Fails
- Use Gmail App Password, not regular password
- Ensure 2FA is enabled on Google Account
- Check password is exactly 16 characters

### Emails Not Sending
- Verify Gmail credentials are correct
- Check internet connection
- Ensure resume file is a valid PDF
- Check CSV has proper format

## 🎯 Benefits of Integration

1. **Proven Logic**: Uses your tested automation script functions
2. **Modern Interface**: Easy-to-use web frontend
3. **Local Control**: No external dependencies or API costs
4. **Real Emails**: Direct Gmail SMTP, not simulation
5. **Enhanced Features**: Better error handling and progress tracking

## 📋 Dependencies

**Backend (Python):**
- Flask 2.3.3
- Flask-CORS 4.0.0
- Pandas 2.0.3
- Werkzeug 2.3.7

**Frontend:**
- Modern web browser with JavaScript
- No additional dependencies (uses CDN resources)

## 🔐 Security

- Gmail credentials only used locally, never stored
- Temporary files automatically cleaned up
- No external API calls or data sharing
- Local-only operation for complete privacy

## 🎉 Ready to Use!

Your automation script is now integrated with a modern web interface. Start the backend, open the frontend, and enjoy automated email campaigns with the power of your proven Python logic!

---

**Note**: This integrates your existing `automation script/` directly as the backend, ensuring consistency and reliability while adding a user-friendly web interface.