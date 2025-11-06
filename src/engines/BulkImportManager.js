import { EncryptionService } from './EncryptionService.js'

// ============ BULK IMPORT MANAGER ============
export class BulkImportManager {
    constructor() {
        this.encryption = new EncryptionService();
        this.batchSize = 50;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    validateCSV(content) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) return { valid: false, error: 'File is empty or has no data' };
        
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const required = ['name', 'secret', 'platform'];
        const missing = required.filter(field => !headers.includes(field));
        
        if (missing.length > 0) {
            return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
        }
        
        return { valid: true, headers };
    }

    validateJSON(content) {
        try {
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                return { valid: false, error: 'JSON must be an array of accounts' };
            }
            
            if (data.length === 0) {
                return { valid: false, error: 'No accounts found in JSON' };
            }

            const required = ['name', 'secret', 'platform'];
            const invalidAccounts = data.filter(account => 
                !required.every(field => account[field])
            );

            if (invalidAccounts.length > 0) {
                return { valid: false, error: `${invalidAccounts.length} accounts missing required fields` };
            }

            return { valid: true, data };
        } catch (error) {
            return { valid: false, error: 'Invalid JSON format' };
        }
    }

    parseCSV(content, headers) {
        const lines = content.split('\n').filter(line => line.trim());
        const headerMap = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        return lines.slice(1).map((line, index) => {
            const values = this.parseCSVLine(line);
            const account = {};
            
            headerMap.forEach((header, i) => {
                if (values[i]) {
                    account[header] = values[i].trim();
                }
            });

            return {
                id: `imported_${Date.now()}_${index}`,
                name: account.name || 'Imported Account',
                secret: account.secret,
                platform: account.platform || 'custom',
                issuer: account.issuer || account.platform || 'Unknown',
                type: account.type || 'TOTP',
                group: account.group || 'default',
                username: account.username || '',
                cookies: account.cookies ? JSON.parse(account.cookies) : null,
                added: new Date(),
                lastUsed: null
            };
        }).filter(account => account.secret); // Remove accounts without secrets
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    async processFile(file) {
        return new Promise((resolve, reject) => {
            if (file.size > this.maxFileSize) {
                reject(new Error('File size too large. Maximum 10MB allowed.'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    let accounts = [];
                    let validation;

                    if (file.type === 'application/json' || file.name.endsWith('.json')) {
                        validation = this.validateJSON(content);
                        if (validation.valid) {
                            accounts = validation.data.map((account, index) => ({
                                id: `imported_${Date.now()}_${index}`,
                                name: account.name,
                                secret: account.secret,
                                platform: account.platform || 'custom',
                                issuer: account.issuer || account.platform || 'Unknown',
                                type: account.type || 'TOTP',
                                group: account.group || 'default',
                                username: account.username || '',
                                cookies: account.cookies || null,
                                added: new Date(),
                                lastUsed: null
                            }));
                        }
                    } else {
                        validation = this.validateCSV(content);
                        if (validation.valid) {
                            accounts = this.parseCSV(content, validation.headers);
                        }
                    }

                    if (!validation.valid) {
                        reject(new Error(validation.error));
                        return;
                    }

                    resolve(accounts);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async processInBatches(accounts, progressCallback) {
        const results = {
            success: [],
            failed: [],
            total: accounts.length
        };

        for (let i = 0; i < accounts.length; i += this.batchSize) {
            const batch = accounts.slice(i, i + this.batchSize);
            
            for (const account of batch) {
                try {
                    // Validate TOTP secret format (basic validation)
                    if (account.type === 'TOTP' && !this.isValidSecret(account.secret)) {
                        throw new Error('Invalid TOTP secret format');
                    }

                    results.success.push(account);
                } catch (error) {
                    results.failed.push({
                        account,
                        error: error.message
                    });
                }
            }

            if (progressCallback) {
                progressCallback(i + batch.length, accounts.length);
            }

            // Small delay to prevent UI blocking
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    }

    isValidSecret(secret) {
        // Basic Base32 validation (should only contain A-Z2-7 and = for padding)
        return /^[A-Z2-7]+=*$/.test(secret.toUpperCase());
    }

    getImportTemplate(format) {
        if (format === 'json') {
            return JSON.stringify([
                {
                    "name": "Account Name",
                    "secret": "JBSWY3DPEHPK3PXP",
                    "platform": "google",
                    "issuer": "Google",
                    "type": "TOTP",
                    "group": "work",
                    "username": "user@example.com"
                }
            ], null, 2);
        } else {
            return `name,secret,platform,issuer,type,group,username
Google Account,JBSWY3DPEHPK3PXP,google,Google,TOTP,work,user@example.com`;
        }
    }
}