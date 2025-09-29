#!/usr/bin/env python3
"""
Flask Backend for Internship Email Automation
Integrated with the automation script logic
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import json
import smtplib
import tempfile
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import pandas as pd
from werkzeug.utils import secure_filename
import re

# Import functions from the automation script
import sys
sys.path.append('automation script')
try:
    from send_email import generate_personalized_email, load_email_config
except ImportError:
    print("⚠️ Could not import from automation script. Using built-in functions.")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'csv', 'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_text(text):
    """Clean text by removing problematic Unicode characters"""
    if not text:
        return ''
    
    # Remove Unicode characters that cause issues
    unicode_chars_to_remove = [
        '\xa0', '\u00a0', '\u2009', '\u2002', '\u2003', 
        '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', 
        '\u200a', '\u200b', '\u2060', '\ufeff'
    ]
    
    clean_text = str(text)
    for char in unicode_chars_to_remove:
        clean_text = clean_text.replace(char, ' ')
    
    # Normalize whitespace and convert to ASCII-safe
    clean_text = ' '.join(clean_text.split())
    clean_text = clean_text.encode('ascii', 'ignore').decode('ascii')
    
    return clean_text

def generate_email_content(hr_name, company, sender_name="Adarsh Kumar Shukla", sender_email="adarshshuklawork@gmail.com"):
    """Generate personalized email using automation script logic"""
    
    # Try to use automation script function first
    try:
        config = load_email_config()
        subject, body = generate_personalized_email(hr_name, company, config)
        if subject and body:
            return subject, body
    except:
        pass
    
    # Fallback to built-in template
    subject_template = "Exploring Internship Opportunities at {company}"
    body_template = """Dear {hr_name},

I hope you're doing well. My name is {sender_name}, and I'm currently a pre-final year B.Tech Computer Science student. I came across {company}'s work and would love the chance to explore internship opportunities with your team.

A little about me:

-Built an AI-driven customer support portal (with tracking, authentication, and RCA/CAPA suggestions)

-Developed a responsive news website with dynamic content loading

-Hands-on experience with JavaScript, React, Firebase, Supabase, and Python

I'm excited about the possibility of contributing to {company}, while also learning and growing under the guidance of your team. Please let me know if we could connect further about potential opportunities.

Looking forward to your response,
{sender_name}"""

    # Clean input data
    hr_name = clean_text(hr_name)
    company = clean_text(company)
    sender_name = clean_text(sender_name)
    
    # Generate personalized content
    subject = subject_template.format(company=company)
    body = body_template.format(
        hr_name=hr_name,
        company=company,
        sender_name=sender_name,
        sender_email=sender_email
    )
    
    return subject, body

def send_email_via_gmail(sender_email, sender_password, recipient_email, subject, body, attachment_path=None):
    """Send email via Gmail SMTP using automation script logic"""
    try:
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        # Add body to email with proper encoding
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        # Add attachment if provided
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                
            encoders.encode_base64(part)
            filename = os.path.basename(attachment_path)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {filename}',
            )
            msg.attach(part)
        
        # Gmail SMTP configuration
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        
        # Send email
        server.send_message(msg, sender_email, recipient_email)
        server.quit()
        
        return True, "Email sent successfully"
        
    except Exception as e:
        return False, str(e)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Automation Script Backend Running',
        'integration': 'Local Python Backend'
    })

@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """Test Gmail connection"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('appPassword')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email and password required'
            }), 400
        
        # Test SMTP connection
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(email, password)
            server.quit()
            
            return jsonify({
                'success': True,
                'message': 'Gmail connection successful'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Gmail connection failed: {str(e)}'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/send-emails', methods=['POST'])
def send_emails():
    """Send emails using automation script logic"""
    try:
        # Get form data
        gmail_email = request.form.get('gmailEmail')
        gmail_password = request.form.get('gmailPassword')
        email_subject = request.form.get('emailSubject', 'Exploring Internship Opportunities at {company}')
        email_body = request.form.get('emailBody', '')
        
        # Get uploaded files
        contacts_file = request.files.get('contacts')
        resume_file = request.files.get('resume')
        
        if not all([gmail_email, gmail_password, contacts_file, resume_file]):
            return jsonify({
                'success': False,
                'message': 'Missing required data: gmailEmail, gmailPassword, contacts, resume'
            }), 400
            
        if not email_body.strip():
            return jsonify({
                'success': False,
                'message': 'Email body template is required'
            }), 400
        
        # Save uploaded files temporarily
        contacts_filename = secure_filename(contacts_file.filename)
        resume_filename = secure_filename(resume_file.filename)
        
        contacts_path = os.path.join(UPLOAD_FOLDER, contacts_filename)
        resume_path = os.path.join(UPLOAD_FOLDER, resume_filename)
        
        contacts_file.save(contacts_path)
        resume_file.save(resume_path)
        
        # Read contacts from CSV
        try:
            df = pd.read_csv(contacts_path)
            required_columns = ['name', 'email', 'company']
            
            if not all(col in df.columns for col in required_columns):
                return jsonify({
                    'success': False,
                    'message': f'CSV must have columns: {required_columns}'
                }), 400
            
            # Clean and validate contacts
            df_clean = df.dropna(subset=required_columns)
            contacts = []
            
            for _, row in df_clean.iterrows():
                contact = {
                    'name': clean_text(row['name']),
                    'email': clean_text(row['email']),
                    'company': clean_text(row['company'])
                }
                
                # Validate email format
                if re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', contact['email']):
                    contacts.append(contact)
            
            if not contacts:
                return jsonify({
                    'success': False,
                    'message': 'No valid contacts found in CSV'
                }), 400
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error reading CSV: {str(e)}'
            }), 400
        
        # Send emails
        results = []
        successful = 0
        
        for contact in contacts:
            try:
                # Generate personalized email using custom templates
                subject = email_subject.format(
                    hr_name=contact['name'],
                    company=contact['company'],
                    sender_name=gmail_email.split('@')[0]  # Use email prefix as sender name
                )
                
                body = email_body.format(
                    hr_name=contact['name'],
                    company=contact['company'],
                    sender_name=gmail_email.split('@')[0]  # Use email prefix as sender name
                )
                
                # Send email
                success, message = send_email_via_gmail(
                    gmail_email,
                    gmail_password,
                    contact['email'],
                    subject,
                    body,
                    resume_path
                )
                
                results.append({
                    'contact': contact['name'],
                    'email': contact['email'],
                    'success': success,
                    'message': message
                })
                
                if success:
                    successful += 1
                
                # Add delay between emails
                time.sleep(2)
                
            except Exception as e:
                results.append({
                    'contact': contact['name'],
                    'email': contact['email'],
                    'success': False,
                    'error': str(e)
                })
        
        # Cleanup temporary files
        try:
            os.remove(contacts_path)
            os.remove(resume_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'message': f'Campaign completed. {successful}/{len(contacts)} emails sent.',
            'successful': successful,
            'total': len(contacts),
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/preview-email', methods=['POST'])
def preview_email():
    """Preview email content"""
    try:
        data = request.get_json()
        hr_name = data.get('hrName', 'John Doe')
        company = data.get('company', 'TechCorp Inc')
        sender_email = data.get('senderEmail', 'adarshshuklawork@gmail.com')
        
        subject, body = generate_email_content(hr_name, company, sender_email=sender_email)
        
        return jsonify({
            'success': True,
            'subject': subject,
            'body': body
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error generating preview: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Automation Script Backend...")
    print("📧 Integrated with local automation script logic")
    print("🌐 Running on http://localhost:5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)