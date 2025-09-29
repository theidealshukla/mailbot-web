/**
 * Enhanced Email Configuration - Integrated from Python Automation Script
 * This provides additional customization options from the automation script
 */
class EmailConfig {
    /**
     * Load enhanced email configuration
     * @returns {Object} Configuration object with templates and settings
     */
    static getEnhancedConfig() {
        return {
            // Email templates (matching the automation script)
            subjectTemplate: "Exploring Internship Opportunities at {company}",
            
            bodyTemplate: `Dear {hr_name},

I hope you're doing well. My name is Adarsh Kumar Shukla, and I'm currently a pre-final year B.Tech Computer Science student. I came across {company}'s work and would love the chance to explore internship opportunities with your team.

A little about me:

-Built an AI-driven customer support portal (with tracking, authentication, and RCA/CAPA suggestions)

-Developed a responsive news website with dynamic content loading

-Hands-on experience with JavaScript, React, Firebase, Supabase, and Python

I'm excited about the possibility of contributing to {company}, while also learning and growing under the guidance of your team. Please let me know if we could connect further about potential opportunities.

Looking forward to your response,
Adarsh Kumar Shukla`,

            // Sender information
            senderName: "Adarsh Kumar Shukla",
            senderEmail: "adarshshuklawork@gmail.com",
            
            // Email settings
            emailDelay: 3, // seconds between emails
            
            // Available template variables
            availableVariables: ['{hr_name}', '{company}', '{sender_name}', '{sender_email}']
        };
    }
    
    /**
     * Generate personalized email content
     * @param {string} hrName - HR contact name
     * @param {string} company - Company name
     * @param {string} senderName - Sender name (optional)
     * @param {string} senderEmail - Sender email (optional)
     * @returns {Object} Object with subject and body
     */
    static generatePersonalizedEmail(hrName, company, senderName = null, senderEmail = null) {
        const config = this.getEnhancedConfig();
        
        // Clean and normalize input data (matching Python script logic)
        hrName = this.cleanText(hrName);
        company = this.cleanText(company);
        
        // Create template variables
        const templateVars = {
            hr_name: hrName,
            company: company,
            sender_name: senderName || config.senderName,
            sender_email: senderEmail || config.senderEmail
        };
        
        // Generate subject and body
        let subject = config.subjectTemplate;
        let body = config.bodyTemplate;
        
        // Replace template variables
        Object.keys(templateVars).forEach(key => {
            const placeholder = `{${key}}`;
            subject = subject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), templateVars[key]);
            body = body.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), templateVars[key]);
        });
        
        return {
            subject: subject,
            body: body
        };
    }
    
    /**
     * Clean text by removing problematic characters (from Python script)
     * @param {string} text - Text to clean
     * @returns {string} Cleaned text
     */
    static cleanText(text) {
        if (!text) return '';
        
        // Remove Unicode characters that cause issues
        const unicodeCharsToRemove = [
            '\xa0', '\u00a0', '\u2009', '\u2002', '\u2003', 
            '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', 
            '\u200a', '\u200b', '\u2060', '\ufeff'
        ];
        
        let cleanText = String(text);
        unicodeCharsToRemove.forEach(char => {
            cleanText = cleanText.replace(new RegExp(char, 'g'), ' ');
        });
        
        // Normalize whitespace and convert to ASCII-safe
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
        // Remove non-ASCII characters for better compatibility
        cleanText = cleanText.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
        
        return cleanText;
    }
    
    /**
     * Validate contact data (from Python script logic)
     * @param {Array} contacts - Array of contact objects
     * @returns {Array} Cleaned and validated contacts
     */
    static validateAndCleanContacts(contacts) {
        if (!Array.isArray(contacts)) return [];
        
        return contacts
            .filter(contact => contact && contact.name && contact.email && contact.company)
            .map(contact => ({
                name: this.cleanText(contact.name),
                email: this.cleanText(contact.email),
                company: this.cleanText(contact.company)
            }))
            .filter(contact => this.isValidEmail(contact.email));
    }
    
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Get automation script status information
     * @returns {Object} Status and integration info
     */
    static getAutomationStatus() {
        return {
            integrated: true,
            version: "1.0",
            features: [
                "Enhanced email templates from automation script",
                "Advanced text cleaning and validation",
                "Personalized email generation",
                "Contact data validation",
                "ASCII-safe text processing"
            ],
            configSource: "automation script/email_config.md"
        };
    }
}