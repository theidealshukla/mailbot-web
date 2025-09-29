/**
 * CSV Handler Class for processing HR contact CSV files
 */
class CSVHandler {
    /**
     * Parse CSV file and return array of contact objects
     * @param {File} file - CSV file
     * @returns {Promise<Array>} Array of contact objects
     */
    static async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const csv = event.target.result;
                    const lines = csv.split('\n').filter(line => line.trim());
                    
                    if (lines.length < 2) {
                        reject(new Error('CSV file must have at least a header and one data row'));
                        return;
                    }
                    
                    // Parse header
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    
                    // Map common column name variations to standard names
                    const columnMapping = {
                        'name': ['name', 'hr_name', 'hr name', 'contact_name', 'contact name', 'person', 'recruiter'],
                        'email': ['email', 'email_address', 'email address', 'contact_email', 'contact email', 'hr_email', 'hr email'],
                        'company': ['company', 'company_name', 'company name', 'organization', 'org', 'firm']
                    };
                    
                    // Find column indices for required fields
                    const columnIndices = {};
                    const missingColumns = [];
                    
                    for (const [standardName, variations] of Object.entries(columnMapping)) {
                        const foundIndex = headers.findIndex(header => 
                            variations.some(variation => header.includes(variation))
                        );
                        
                        if (foundIndex !== -1) {
                            columnIndices[standardName] = foundIndex;
                        } else {
                            missingColumns.push(standardName);
                        }
                    }
                    
                    if (missingColumns.length > 0) {
                        reject(new Error(`Missing required columns: ${missingColumns.join(', ')}. Found columns: ${headers.join(', ')}. Please ensure your CSV has columns for name, email, and company.`));
                        return;
                    }
                    
                    // Parse data rows
                    const contacts = [];
                    for (let i = 1; i < lines.length; i++) {
                        const values = CSVHandler.parseCSVLine(lines[i]);
                        
                        if (values.length < Math.max(...Object.values(columnIndices)) + 1) {
                            console.warn(`Row ${i + 1} has insufficient columns. Skipping.`);
                            continue;
                        }
                        
                        // Extract data using column indices
                        const contact = {
                            name: values[columnIndices.name]?.trim() || '',
                            email: values[columnIndices.email]?.trim() || '',
                            company: values[columnIndices.company]?.trim() || ''
                        };
                        
                        // Validate required fields
                        if (contact.name && contact.email && contact.company) {
                            // Clean data
                            contact.name = CSVHandler.cleanText(contact.name);
                            contact.email = CSVHandler.cleanText(contact.email);
                            contact.company = CSVHandler.cleanText(contact.company);
                            
                            // Validate email format
                            if (CSVHandler.isValidEmail(contact.email)) {
                                contacts.push(contact);
                            } else {
                                console.warn(`Row ${i + 1}: Invalid email for ${contact.name}: ${contact.email}`);
                            }
                        } else {
                            console.warn(`Row ${i + 1}: Missing required data - Name: "${contact.name}", Email: "${contact.email}", Company: "${contact.company}"`);
                        }
                    }
                    
                    if (contacts.length === 0) {
                        reject(new Error(`No valid contacts found in CSV file. Please check that your CSV has valid data in the name, email, and company columns. Found columns: ${headers.join(', ')}`));
                        return;
                    }
                    
                    console.log(`Successfully parsed ${contacts.length} valid contacts from CSV`);
                    resolve(contacts);
                    
                } catch (error) {
                    reject(new Error(`Error parsing CSV: ${error.message}`));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error reading CSV file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Parse a CSV line handling quoted values
     * @param {string} line - CSV line
     * @returns {Array} Array of values
     */
    static parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }
    
    /**
     * Clean text by removing problematic characters
     * @param {string} text - Text to clean
     * @returns {string} Cleaned text
     */
    static cleanText(text) {
        if (!text) return '';
        return text.replace(/\xa0/g, ' ')
                  .replace(/\u00a0/g, ' ')
                  .replace(/[^\x20-\x7E]/g, ' ')
                  .trim();
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
     * Generate sample CSV content
     * @returns {string} Sample CSV content
     */
    static generateSampleCSV() {
        return `name,email,company
Sarah Johnson,sarah.johnson@techcorp.com,TechCorp Solutions
John Smith,john.smith@innovatesoft.com,InnovateSoft Inc
Priya Patel,priya.patel@startuptech.com,StartupTech Solutions
Mike Chen,mike.chen@digitalworks.com,Digital Works Ltd
Lisa Rodriguez,lisa.rodriguez@futuretech.com,FutureTech Industries`;
    }
    
    /**
     * Get information about expected CSV format
     * @returns {object} Format information
     */
    static getFormatInfo() {
        return {
            requiredColumns: ['name', 'email', 'company'],
            acceptedVariations: {
                name: ['name', 'hr_name', 'hr name', 'contact_name', 'contact name', 'person', 'recruiter'],
                email: ['email', 'email_address', 'email address', 'contact_email', 'contact email', 'hr_email', 'hr email'],
                company: ['company', 'company_name', 'company name', 'organization', 'org', 'firm']
            }
        };
    }
}