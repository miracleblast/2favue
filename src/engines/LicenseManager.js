// ============ ENHANCED LICENSE MANAGER ============
export class LicenseManager {
    constructor() {
        this.licenseKey = null;
        this.plan = null;
        this.expiryDate = null;
        this.features = {};
        this.pricing = {
            'free': { price: 0.00, name: 'Free', description: 'Ideal for personal accounts' },
            'starter': { price: 9.99, name: 'Starter', description: 'Perfect for freelancers' },
            'professional': { price: 25.99, name: 'Professional', description: 'Ideal for agencies' },
            'enterprise': { price: 49.99, name: 'Enterprise', description: 'For large teams' }
        };
        
        // Track generated sub-licenses
        this.generatedLicenses = new Map();
    }

    async validateLicense(key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const demoLicenses = {
                    'AUTHFLOW-DEMO-1234': { 
                        plan: 'professional', 
                        expiry: '2024-12-31', 
                        active: true,
                        created: '2024-01-15',
                        isAdmin: true,
                        parentLicense: null // This is a root/admin license
                    },
                    'AUTHFLOW-TEST-5678': { 
                        plan: 'starter', 
                        expiry: '2024-06-30', 
                        active: true,
                        created: '2024-01-10',
                        isAdmin: true,
                        parentLicense: null
                    }
                };
                
                // Check if it's a generated sub-license
                const subLicense = this.generatedLicenses.get(key);
                if (subLicense) {
                    this.licenseKey = key;
                    this.plan = subLicense.plan;
                    this.expiryDate = new Date(subLicense.expiry);
                    this.features = this.getFeaturesForPlan(subLicense.plan);
                    
                    localStorage.setItem('authflow-license', JSON.stringify({
                        key: key,
                        plan: subLicense.plan,
                        expiry: subLicense.expiry,
                        features: this.features,
                        isAdmin: subLicense.isAdmin,
                        parentLicense: subLicense.parentLicense
                    }));
                    
                    resolve(true);
                    return;
                }
                
                const license = demoLicenses[key];
                if (license && license.active) {
                    this.licenseKey = key;
                    this.plan = license.plan;
                    this.expiryDate = new Date(license.expiry);
                    this.features = this.getFeaturesForPlan(license.plan);
                    
                    localStorage.setItem('authflow-license', JSON.stringify({
                        key: key,
                        plan: license.plan,
                        expiry: license.expiry,
                        features: this.features,
                        isAdmin: license.isAdmin,
                        parentLicense: license.parentLicense
                    }));
                    
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 1000);
        });
    }

    getFeaturesForPlan(plan) {
        const features = {
            'free': { 
                accounts: 10, 
                teamMembers: 1,
                apiAccess: false, 
                advancedSecurity: false,
                prioritySupport: false,
                canGenerateLicenses: false
            },
            'starter': { 
                accounts: 50, 
                teamMembers: 3,
                apiAccess: false, 
                advancedSecurity: false,
                prioritySupport: false,
                canGenerateLicenses: true
            },
            'professional': { 
                accounts: 1000, 
                teamMembers: 50,
                apiAccess: true, 
                advancedSecurity: true,
                prioritySupport: false,
                canGenerateLicenses: true
            },
            'enterprise': { 
                accounts: 9999, 
                teamMembers: 100,
                apiAccess: true, 
                advancedSecurity: true,
                prioritySupport: true,
                canGenerateLicenses: true
            }
        };
        return features[plan] || features['starter'];
    }

    // NEW: Generate sub-licenses for team members
    generateSubLicense(plan, parentLicense, userEmail, role = 'user') {
        if (!this.features.canGenerateLicenses) {
            throw new Error('Your plan does not support generating licenses for team members');
        }

        const usedLicenses = this.getGeneratedLicensesCount(parentLicense);
        const availableLicenses = this.getFeaturesForPlan(plan).teamMembers;
        
        if (usedLicenses >= availableLicenses) {
            throw new Error(`No available licenses. Used: ${usedLicenses}/${availableLicenses}`);
        }

        // Generate unique license key based on plan and parent
        const licenseNumber = (usedLicenses + 1).toString().padStart(3, '0');
        const prefix = this.getLicensePrefix(plan);
        const uniqueId = this.generateUniqueId();
        
        const licenseKey = `${prefix}-${uniqueId}-${licenseNumber}`;
        
        const subLicense = {
            key: licenseKey,
            plan: plan,
            expiry: this.expiryDate.toISOString().split('T')[0],
            active: true,
            created: new Date().toISOString(),
            isAdmin: role === 'admin',
            parentLicense: parentLicense,
            userEmail: userEmail,
            role: role,
            used: false
        };

        // Store in memory and localStorage
        this.generatedLicenses.set(licenseKey, subLicense);
        this.saveGeneratedLicenses();
        
        return subLicense;
    }

    getLicensePrefix(plan) {
        const prefixes = {
            'free': 'AUTHFLOW-FREE',
            'starter': 'AUTHFLOW-START',
            'professional': 'AUTHFLOW-PRO',
            'enterprise': 'AUTHFLOW-EN'
        };
        return prefixes[plan] || 'AUTHFLOW-START';
    }

    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    getGeneratedLicensesCount(parentLicense) {
        let count = 0;
        for (const [key, license] of this.generatedLicenses) {
            if (license.parentLicense === parentLicense && !license.used) {
                count++;
            }
        }
        return count;
    }

    getGeneratedLicenses(parentLicense) {
        const licenses = [];
        for (const [key, license] of this.generatedLicenses) {
            if (license.parentLicense === parentLicense) {
                licenses.push(license);
            }
        }
        return licenses.sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    saveGeneratedLicenses() {
        const licensesArray = Array.from(this.generatedLicenses.entries());
        localStorage.setItem('authflow-generated-licenses', JSON.stringify(licensesArray));
    }

    loadGeneratedLicenses() {
        const saved = localStorage.getItem('authflow-generated-licenses');
        if (saved) {
            const licensesArray = JSON.parse(saved);
            this.generatedLicenses = new Map(licensesArray);
        }
    }

    markLicenseUsed(licenseKey) {
        const license = this.generatedLicenses.get(licenseKey);
        if (license) {
            license.used = true;
            license.usedAt = new Date().toISOString();
            this.saveGeneratedLicenses();
        }
    }

    // Rest of your existing methods remain the same...
    checkLicenseStatus() {
        const saved = localStorage.getItem('authflow-license');
        if (!saved) return false;

        const license = JSON.parse(saved);
        const now = new Date();
        const expiry = new Date(license.expiry);

        if (now > expiry) {
            this.invalidateLicense();
            return false;
        }

        this.licenseKey = license.key;
        this.plan = license.plan;
        this.expiryDate = expiry;
        this.features = license.features;
        
        // Load generated licenses
        this.loadGeneratedLicenses();
        
        return true;
    }

    getDaysUntilExpiry() {
        if (!this.expiryDate) return 0;
        const now = new Date();
        const expiry = new Date(this.expiryDate);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    getLicenseStatus() {
        const days = this.getDaysUntilExpiry();
        if (days <= 0) return 'expired';
        if (days <= 7) return 'expiring';
        if (days <= 30) return 'warning';
        return 'active';
    }

    invalidateLicense() {
        localStorage.removeItem('authflow-license');
        this.licenseKey = null;
    }

    hasFeature(feature) {
        return this.features[feature] === true;
    }

    getAccountLimit() {
        return this.features.accounts || 5;
    }

    getTeamLimit() {
        return this.features.teamMembers || 1;
    }

    getPlanPrice(plan) {
        return this.pricing[plan]?.price || 0;
    }

    getPlanName(plan) {
        return this.pricing[plan]?.name || 'Starter';
    }

    getLicenseData() {
        return {
            key: this.licenseKey,
            plan: this.plan,
            expiry: this.expiryDate,
            features: this.features,
            daysUntilExpiry: this.getDaysUntilExpiry(),
            status: this.getLicenseStatus(),
            isAdmin: this.features.canGenerateLicenses,
            generatedLicenses: this.getGeneratedLicenses(this.licenseKey)
        };
    }

    // NEW: Check if current user is admin
    isAdmin() {
        return this.features.canGenerateLicenses;
    }
}