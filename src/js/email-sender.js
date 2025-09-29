

class EmailSender {
    constructor() {
        this.currentStep = 1;
        this.contacts = [];
        this.resumeFile = null;
        this.senderEmail = '';
        this.gmailPassword = '';
        this.emailTemplate = this.getDefaultTemplate();
        this.emailSubject = 'Exploring Internship Opportunities at {company}';
        this.isAuthenticated = false;
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Helper function to safely add event listener
        const safeAddEventListener = (id, event, callback) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, callback);
            } else {
                console.warn(`Element with ID '${id}' not found`);
            }
        };

        // Step 1 form submission
        safeAddEventListener('step1Form', 'submit', (e) => {
            e.preventDefault();
            this.handleStep1Submit();
        });
        
        // Step 2 form submission (email template)
        safeAddEventListener('step2Form', 'submit', (e) => {
            e.preventDefault();
            this.handleStep2Submit();
        });
        
        // Step 3 form submission (Gmail auth)
        safeAddEventListener('step3Form', 'submit', (e) => {
            e.preventDefault();
            this.handleStep3Submit();
        });
        
        // File uploads
        safeAddEventListener('contacts', 'change', (e) => {
            this.handleContactsUpload(e);
        });
        
        safeAddEventListener('resume', 'change', (e) => {
            this.handleResumeUpload(e);
        });
        
        // Navigation buttons
        safeAddEventListener('backToStep1', 'click', () => {
            this.goToStep(1);
        });
        
        safeAddEventListener('backToStep2', 'click', () => {
            this.goToStep(2);
        });
        
        safeAddEventListener('backToStep3', 'click', () => {
            this.goToStep(3);
        });
        
        // Gmail connection test
        safeAddEventListener('testConnection', 'click', () => {
            this.testGmailConnection();
        });
        
        // Template preview
        safeAddEventListener('previewTemplate', 'click', () => {
            this.previewEmailTemplate();
        });
        
        // Start campaign
        safeAddEventListener('startCampaign', 'click', () => {
            this.startEmailCampaign();
        });
    }
    
    async handleStep1Submit() {
        const senderEmail = document.getElementById('senderEmail').value.trim();
        
        // Debug current state
        console.log('Step 1 Submit - Current State:', {
            senderEmail,
            contactsLength: this.contacts.length,
            resumeFile: this.resumeFile ? this.resumeFile.name : 'none',
            contacts: this.contacts
        });
        
        // Validate Gmail address
        if (!senderEmail.endsWith('@gmail.com')) {
            this.showAlert('danger', '❌ Please enter a valid Gmail address (must end with @gmail.com)');
            return;
        }
        
        // Validate files with more specific messages
        if (this.contacts.length === 0) {
            const contactsInput = document.getElementById('contacts');
            if (!contactsInput.files.length) {
                this.showAlert('danger', '❌ Please select a CSV file with HR contacts');
            } else {
                this.showAlert('danger', '❌ CSV file processing failed. Please check the file format and try again.');
            }
            return;
        }
        
        if (!this.resumeFile) {
            this.showAlert('danger', '❌ Please upload your resume (PDF)');
            return;
        }
        
        this.senderEmail = senderEmail;
        this.goToStep(2);
    }
    
    async handleStep2Submit() {
        // Save email template
        this.emailSubject = document.getElementById('emailSubject').value.trim();
        this.emailTemplate = document.getElementById('emailBody').value.trim();
        
        if (!this.emailSubject || !this.emailTemplate) {
            this.showAlert('danger', '❌ Please fill in both subject and body template');
            return;
        }
        
        this.showAlert('success', '✅ Email template saved successfully');
        this.goToStep(3);
    }
    
    async handleStep3Submit() {
        if (!this.isAuthenticated) {
            this.showAlert('danger', '❌ Please test and verify your Gmail connection first');
            return;
        }
        
        this.prepareCampaignSummary();
        this.goToStep(4);
    }
    
    goToStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show target step
        document.getElementById(`step-${stepNumber}`).style.display = 'block';
        
        // Update progress indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });
        
        this.currentStep = stepNumber;
    }
    
    async handleContactsUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
            this.showAlert('danger', '❌ Please upload a CSV file (.csv extension)');
            return;
        }
        
        try {
            this.showAlert('info', '📊 Parsing CSV file with automation script integration...');
            console.log('File info:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            
            // Parse CSV using existing handler
            const rawContacts = await CSVHandler.parseCSV(file);
            console.log('Raw contacts from CSV parser:', rawContacts);
            
            // The CSVHandler already validates and cleans the data
            this.contacts = rawContacts;
            console.log('Final contacts assigned:', this.contacts);
            
            this.showAlert('success', 
                `✅ Successfully loaded and validated ${this.contacts.length} contacts`);
            
            // Show contact preview
            this.displayContactPreview();
            
        } catch (error) {
            console.error('CSV parsing error:', error);
            console.error('Error stack:', error.stack);
            this.showAlert('danger', `❌ CSV Error: ${error.message}`);
            this.contacts = [];
            
            // Add detailed error information for debugging
            console.log('File details when error occurred:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                lastModified: new Date(file.lastModified).toISOString()
            });
        }
    }
    
    displayContactPreview() {
        if (this.contacts.length === 0) return;
        
        const currentStepCard = document.querySelector(`#step-${this.currentStep} .card-body`);
        
        // Remove existing preview
        const existingPreview = currentStepCard.querySelector('.contact-preview-container');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        let previewHTML = `
            <div class="contact-preview-container mt-3">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">📋 Contact Preview (${this.contacts.length} contacts)</h6>
                    </div>
                    <div class="card-body contact-preview">
        `;
        
        // Show first 5 contacts
        const previewContacts = this.contacts.slice(0, 5);
        previewContacts.forEach((contact, index) => {
            previewHTML += `
                <div class="contact-item">
                    <strong>${contact.name}</strong><br>
                    <small class="text-muted">${contact.email} • ${contact.company}</small>
                </div>
            `;
        });
        
        if (this.contacts.length > 5) {
            previewHTML += `
                <div class="contact-item text-center">
                    <small class="text-muted">... and ${this.contacts.length - 5} more contacts</small>
                </div>
            `;
        }
        
        previewHTML += `
                    </div>
                </div>
            </div>
        `;
        
        currentStepCard.insertAdjacentHTML('beforeend', previewHTML);
    }
    
    handleResumeUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            this.showAlert('warning', '⚠️ Please upload a PDF file for your resume');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showAlert('warning', '⚠️ Resume file is too large. Please upload a file smaller than 10MB');
            return;
        }
        
        this.resumeFile = file;
        this.showAlert('success', `✅ Resume uploaded: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`);
    }
    
    async testGmailConnection() {
        const passwordInput = document.getElementById('gmailPassword');
        const statusDiv = document.getElementById('connectionStatus');
        const proceedBtn = document.getElementById('proceedToStep4');
        
        if (!passwordInput) {
            console.error('Gmail password input not found');
            return;
        }
        
        if (!statusDiv) {
            console.error('Connection status div not found');
            return;
        }
        
        const password = passwordInput.value.trim();
        
        if (!password) {
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="connection-error">Please enter your Gmail App Password</div>';
            }
            return;
        }
        
        if (password.length !== 16) {
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="connection-error">Gmail App Password should be 16 characters long</div>';
            }
            return;
        }
        
        // Show testing status
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="connection-testing">
                    <i class="fas fa-spinner fa-spin me-2"></i>Testing Gmail connection via API...
                </div>
            `;
        }
        
        try {
            // Test Gmail connection via local backend
            const result = await APIConfig.makeRequest('/api/test-connection', {
                method: 'POST',
                body: JSON.stringify({
                    email: this.senderEmail,
                    appPassword: password
                })
            });
            
            if (result.success) {
                this.gmailPassword = password;
                this.isAuthenticated = true;
                statusDiv.innerHTML = `
                    <div class="connection-success">
                        <i class="fas fa-check-circle me-2"></i>✅ Gmail Connection Successful
                        <br><small class="text-muted">Backend: ${APIConfig.BASE_URL} (Local Automation Script)</small>
                        <br><small class="text-muted">${result.message}</small>
                    </div>
                `;
                if (proceedBtn) {
                    proceedBtn.disabled = false;
                }
            } else {
                this.isAuthenticated = false;
                statusDiv.innerHTML = `
                    <div class="connection-error">
                        <i class="fas fa-times-circle me-2"></i>❌ ${result.message}
                    </div>
                `;
                if (proceedBtn) {
                    proceedBtn.disabled = true;
                }
            }
            
        } catch (error) {
            console.error('Connection test error:', error);
            this.isAuthenticated = false;
            
            let errorMessage = error.message;
            let troubleshooting = '';
            
            if (error.message.includes('Cannot connect to local backend')) {
                troubleshooting = `
                    <div class="mt-2 p-3 bg-light rounded">
                        <strong>� Local Backend Not Running:</strong>
                        <br>• Run: <code>python backend_server.py</code>
                        <br>• Or double-click: <code>start_backend.bat</code>
                        <br>• Backend should run on: <code>http://localhost:5000</code>
                        <br>• Make sure you have Flask installed: <code>pip install -r requirements_backend.txt</code>
                    </div>
                `;
            }
            
            statusDiv.innerHTML = `
                <div class="connection-error">
                    <i class="fas fa-times-circle me-2"></i>❌ Backend Connection Failed: ${errorMessage}
                    ${troubleshooting}
                </div>
            `;
            if (proceedBtn) {
                proceedBtn.disabled = true;
            }
        }
    }
    
    prepareCampaignSummary() {
        const summaryDiv = document.getElementById('campaignSummary');
        const previewDiv = document.getElementById('emailPreview');
        
        // Campaign summary
        summaryDiv.innerHTML = `
            <div class="campaign-summary">
                <h6><i class="fas fa-info-circle me-2"></i>Campaign Summary</h6>
                <div class="row">
                    <div class="col-md-6">
                        <strong>From:</strong> ${this.senderEmail}<br>
                        <strong>Contacts:</strong> ${this.contacts.length} recipients<br>
                        <strong>Resume:</strong> ${this.resumeFile.name}
                    </div>
                    <div class="col-md-6">
                        <strong>Authentication:</strong> ✅ Verified<br>
                        <strong>Estimated Time:</strong> ${Math.ceil(this.contacts.length * 2)} seconds<br>
                        <strong>Status:</strong> Ready to send
                    </div>
                </div>
            </div>
        `;
        
        // Email preview with enhanced personalization
        const sampleContact = this.contacts[0] || { name: 'John Doe', company: 'TechCorp Inc', email: 'john@techcorp.com' };
        const emailContent = this.generatePersonalizedEmail(sampleContact.name, sampleContact.company);
        const emailSubject = this.generatePersonalizedSubject(sampleContact.name, sampleContact.company);
        
        previewDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="fas fa-eye me-2"></i>Email Preview (Enhanced from Automation Script)</h6>
                </div>
                <div class="card-body">
                    <div class="email-preview">
                        <strong>To:</strong> ${sampleContact.name} &lt;${sampleContact.email}&gt;
                        <strong>From:</strong> ${this.senderEmail}
                        <strong>Subject:</strong> ${emailSubject}
                        <strong>Attachment:</strong> ${this.resumeFile.name}
                        
                        <hr>
                        
                        ${emailContent}
                    </div>
                </div>
            </div>
        `;
    }
    
    async startEmailCampaign() {
        const progressDiv = document.getElementById('emailProgress');
        progressDiv.style.display = 'block';
        
        // Show progress section
        const progressHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0"><i class="fas fa-paper-plane me-2"></i>Sending Real Emails...</h5>
                </div>
                <div class="card-body">
                    <div class="progress mb-3">
                        <div class="progress-bar" id="progressBar" role="progressbar" style="width: 0%">
                            0/${this.contacts.length}
                        </div>
                    </div>
                    <div id="emailLog" style="max-height: 400px; overflow-y: auto;"></div>
                    <div id="finalSummary" style="display: none;"></div>
                </div>
            </div>
        `;
        
        progressDiv.innerHTML = progressHTML;
        
        // Scroll to progress section
        progressDiv.scrollIntoView({ behavior: 'smooth' });
        
        const progressBar = document.getElementById('progressBar');
        const emailLog = document.getElementById('emailLog');
        const finalSummary = document.getElementById('finalSummary');
        
        try {
            // Send via deployed API
            console.log('Sending emails via deployed API...');
            console.log('Debug Info:', {
                contacts: this.contacts ? this.contacts.length : 0,
                senderEmail: this.senderEmail || 'NOT SET',
                gmailPassword: this.gmailPassword ? 'SET (' + this.gmailPassword.length + ' chars)' : 'NOT SET',
                apiUrl: APIConfig.BASE_URL
            });
            await this.sendViaAPI(progressBar, emailLog, finalSummary);
        } catch (error) {
            console.error('API error:', error);
            console.log('API not available, using simulation mode');
            // Clear any error messages and show simulation
            emailLog.innerHTML = '';
            await this.sendViaSimulation(progressBar, emailLog, finalSummary);
        }
    }
    
    async sendViaAPI(progressBar, emailLog, finalSummary) {
        console.log('Sending emails via API...');
        
        // Validate credentials are available
        if (!this.senderEmail || !this.gmailPassword) {
            console.error('Missing credentials:', { 
                senderEmail: !!this.senderEmail, 
                gmailPassword: !!this.gmailPassword 
            });
            throw new Error('Gmail credentials not available. Please test your connection first.');
        }

        if (!this.resumeFile) {
            throw new Error('Resume file not uploaded. Please upload your resume.');
        }

        if (this.contacts.length === 0) {
            throw new Error('No contacts available. Please upload a CSV file with contacts.');
        }

        emailLog.innerHTML += `
            <div class="alert alert-info">
                <i class="fas fa-cloud me-2"></i>
                Preparing to send emails via API...
                <br><small class="text-muted">API: ${APIConfig.BASE_URL}</small>
            </div>
        `;

        try {
            // Create FormData to send CSV, resume, credentials, and email template
            const formData = new FormData();
            
            // Add Gmail credentials
            formData.append('gmailEmail', this.senderEmail);
            formData.append('gmailPassword', this.gmailPassword);
            
            // Add email template data
            formData.append('emailSubject', this.emailSubject || 'Exploring Internship Opportunities at {company}');
            formData.append('emailBody', this.emailTemplate || '');
            
            // Add resume file
            formData.append('resume', this.resumeFile);
            
            // Create CSV content from contacts
            const csvContent = this.createCSVFromContacts();
            const csvBlob = new Blob([csvContent], { type: 'text/csv' });
            formData.append('contacts', csvBlob, 'contacts.csv');

            emailLog.innerHTML += `
                <div class="alert alert-info">
                    <i class="fas fa-upload me-2"></i>
                    Uploading files and starting email campaign...
                    <br><small class="text-muted">Contacts: ${this.contacts.length} | Resume: ${this.resumeFile.name}</small>
                </div>
            `;

            // Send POST request to local automation script backend
            const response = await fetch(`${APIConfig.BASE_URL}/api/send-emails`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                throw new Error(`API Error: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();

            // Update progress to completion
            progressBar.style.width = '100%';
            progressBar.textContent = `${this.contacts.length}/${this.contacts.length}`;

            // Show success results
            emailLog.innerHTML += `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    Email campaign completed successfully!
                </div>
            `;

            if (result.results) {
                result.results.forEach((emailResult, index) => {
                    const contact = this.contacts[index];
                    if (emailResult.success) {
                        emailLog.innerHTML += `
                            <div class="alert alert-success">
                                ✅ Successfully sent to ${contact ? contact.name : 'contact'} (${index + 1}/${this.contacts.length})
                            </div>
                        `;
                    } else {
                        emailLog.innerHTML += `
                            <div class="alert alert-danger">
                                ❌ Failed to send to ${contact ? contact.name : 'contact'}: ${emailResult.error || 'Unknown error'}
                            </div>
                        `;
                    }
                });
            }

            emailLog.scrollTop = emailLog.scrollHeight;

            // Show final summary
            const successCount = result.successful || 0;
            const totalCount = this.contacts.length;
            
            finalSummary.style.display = 'block';
            finalSummary.innerHTML = `
                <div class="alert alert-${successCount > 0 ? 'success' : 'danger'}">
                    <h6><i class="fas fa-flag-checkered me-2"></i>Email Campaign Completed!</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <ul class="mb-0">
                                <li><strong>✅ Successful:</strong> ${successCount}</li>
                                <li><strong>❌ Failed:</strong> ${totalCount - successCount}</li>
                                <li><strong>📧 Total:</strong> ${totalCount}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <ul class="mb-0">
                                <li><strong>Success Rate:</strong> ${totalCount > 0 ? Math.round((successCount/totalCount)*100) : 0}%</li>
                                <li><strong>Mode:</strong> API Gmail SMTP</li>
                                <li><strong>Resume:</strong> ${this.resumeFile.name}</li>
                            </ul>
                        </div>
                    </div>
                    ${successCount > 0 ? '<p class="mt-3 mb-0"><strong>🎉 REAL emails sent via API! Check your Gmail Sent folder!</strong></p>' : ''}
                </div>
            `;

        } catch (error) {
            console.error('API email sending error:', error);
            emailLog.innerHTML += `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    ❌ Email sending failed: ${error.message}
                </div>
            `;
            throw error;
        }
    }
    
    async sendViaSimulation(progressBar, emailLog, finalSummary) {
        let successful = 0;
        let failed = 0;
        
        // Add simulation notice
        emailLog.innerHTML += `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Simulation Mode:</strong> Local backend connection failed. No real emails will be sent.
                <br><small>To send REAL emails via automation script:</small>
                <br><small>1. Run: <code>python backend_server.py</code></small>
                <br><small>2. Or double-click: <code>start_backend.bat</code></small>
                <br><small>3. Backend URL: <code>${APIConfig.BASE_URL}</code></small>
                <br><small>4. Uses your automation script: <code>automation script/send_email.py</code></small>
            </div>
        `;
        
        // Simulate sending
        for (let i = 0; i < this.contacts.length; i++) {
            const contact = this.contacts[i];
            
            // Update progress
            const progress = ((i + 1) / this.contacts.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${i + 1}/${this.contacts.length}`;
            
            // Log current email
            emailLog.innerHTML += `
                <div class="alert alert-info">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Simulating send to ${contact.name} at ${contact.company}...
                </div>
            `;
            
            // Simulate processing time
            await this.sleep(2000);
            
            // Simulate success/failure (95% success rate for demo)
            const isSuccess = Math.random() > 0.05;
            
            // Update log
            const lastLog = emailLog.lastElementChild;
            if (isSuccess) {
                lastLog.className = 'alert alert-success';
                lastLog.innerHTML = `✅ [SIMULATED] Successfully sent to ${contact.name} (${contact.email})`;
                successful++;
            } else {
                lastLog.className = 'alert alert-danger';
                lastLog.innerHTML = `❌ [SIMULATED] Failed to send to ${contact.name} (${contact.email})`;
                failed++;
            }
            
            // Scroll to bottom
            emailLog.scrollTop = emailLog.scrollHeight;
        }
        
        // Show final summary
        finalSummary.style.display = 'block';
        finalSummary.innerHTML = `
            <div class="alert alert-warning">
                <h6><i class="fas fa-flag-checkered me-2"></i>Simulation Campaign Completed!</h6>
                <div class="row">
                    <div class="col-md-6">
                        <ul class="mb-0">
                            <li><strong>✅ Simulated Success:</strong> ${successful}</li>
                            <li><strong>❌ Simulated Failed:</strong> ${failed}</li>
                            <li><strong>📧 Total:</strong> ${this.contacts.length}</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <ul class="mb-0">
                            <li><strong>Success Rate:</strong> ${Math.round((successful/this.contacts.length)*100)}%</li>
                            <li><strong>Mode:</strong> Simulation Only</li>
                        </ul>
                    </div>
                </div>
                <p class="mt-3 mb-0"><strong>⚠️ No real emails sent. Start the local automation script backend!</strong></p>
            </div>
        `;
    }
    
    generatePersonalizedEmail(hrName, company) {
        // Use custom email template if available
        if (this.emailTemplate) {
            return this.emailTemplate
                .replace(/\{hr_name\}/g, hrName)
                .replace(/\{company\}/g, company)
                .replace(/\{sender_name\}/g, 'Adarsh Kumar Shukla')
                .replace(/\{sender_email\}/g, this.senderEmail);
        }
        
        // Fallback to enhanced configuration
        const personalizedEmail = EmailConfig.generatePersonalizedEmail(hrName, company, null, this.senderEmail);
        return personalizedEmail.body;
    }
    
    generatePersonalizedSubject(hrName, company) {
        // Use custom subject template if available
        if (this.emailSubject) {
            return this.emailSubject
                .replace(/\{hr_name\}/g, hrName)
                .replace(/\{company\}/g, company)
                .replace(/\{sender_name\}/g, 'Adarsh Kumar Shukla')
                .replace(/\{sender_email\}/g, this.senderEmail);
        }
        
        // Fallback to enhanced configuration
        const personalizedEmail = EmailConfig.generatePersonalizedEmail(hrName, company, null, this.senderEmail);
        return personalizedEmail.subject;
    }
    
    previewEmailTemplate() {
        const subjectTemplate = document.getElementById('emailSubject').value.trim();
        const bodyTemplate = document.getElementById('emailBody').value.trim();
        const previewDiv = document.getElementById('templatePreview');
        
        if (!subjectTemplate || !bodyTemplate) {
            this.showAlert('warning', '⚠️ Please fill in both subject and body template first');
            return;
        }
        
        // Sample data for preview
        const sampleHR = 'John Smith';
        const sampleCompany = 'TechCorp Solutions';
        const senderName = 'Adarsh Kumar Shukla';
        
        // Generate preview
        const previewSubject = subjectTemplate
            .replace(/\{hr_name\}/g, sampleHR)
            .replace(/\{company\}/g, sampleCompany)
            .replace(/\{sender_name\}/g, senderName)
            .replace(/\{sender_email\}/g, this.senderEmail);
            
        const previewBody = bodyTemplate
            .replace(/\{hr_name\}/g, sampleHR)
            .replace(/\{company\}/g, sampleCompany)
            .replace(/\{sender_name\}/g, senderName)
            .replace(/\{sender_email\}/g, this.senderEmail);
        
        previewDiv.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="fas fa-eye me-2"></i>Email Preview</h6>
                </div>
                <div class="card-body">
                    <div class="email-preview">
                        <strong>To:</strong> ${sampleHR} &lt;john.smith@techcorp.com&gt;<br>
                        <strong>From:</strong> ${this.senderEmail || 'your.email@gmail.com'}<br>
                        <strong>Subject:</strong> ${previewSubject}<br><br>
                        <div style="white-space: pre-wrap; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; background-color: #f8f9fa;">
${previewBody}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        previewDiv.style.display = 'block';
    }
    
    createCSVFromContacts() {
        if (this.contacts.length === 0) {
            return 'name,email,company\n';
        }
        
        // Create CSV header
        let csvContent = 'name,email,company\n';
        
        // Add each contact as a CSV row
        this.contacts.forEach(contact => {
            const escapedName = `"${(contact.name || '').replace(/"/g, '""')}"`;
            const escapedEmail = `"${(contact.email || '').replace(/"/g, '""')}"`;
            const escapedCompany = `"${(contact.company || '').replace(/"/g, '""')}"`;
            
            csvContent += `${escapedName},${escapedEmail},${escapedCompany}\n`;
        });
        
        return csvContent;
    }
    
    getDefaultTemplate() {
        return `Dear {hr_name},

I hope you're doing well. My name is Adarsh Kumar Shukla, and I'm currently a pre-final year B.Tech Computer Science student. I came across {company}'s work and would love the chance to explore internship opportunities with your team.

A little about me:

-Built an AI-driven customer support portal (with tracking, authentication, and RCA/CAPA suggestions)

-Developed a responsive news website with dynamic content loading

-Hands-on experience with JavaScript, React, Firebase, Supabase, and Python

I'm excited about the possibility of contributing to {company}, while also learning and growing under the guidance of your team. Please let me know if we could connect further about potential opportunities.

Looking forward to your response,
Adarsh Kumar Shukla`;
    }
    
    showAlert(type, message) {
        // Create alert element
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Find the current step's card body to show the alert
        const currentStepCard = document.querySelector(`#step-${this.currentStep} .card-body`);
        if (currentStepCard) {
            // Remove existing alerts
            const existingAlerts = currentStepCard.querySelectorAll('.alert');
            existingAlerts.forEach(alert => alert.remove());
            
            // Add new alert at the top of the card body
            currentStepCard.insertAdjacentHTML('afterbegin', alertHTML);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new EmailSender();
});