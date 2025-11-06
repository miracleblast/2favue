// ============ LICENSE MANAGER ============
export class LicenseManager {
    constructor() {
        this.licenseKey = null;
        this.plan = null;
        this.expiryDate = null;
        this.features = {};
        this.pricing = {
            'starter': { price: 9.99, name: 'Starter', description: 'Perfect for freelancers' },
            'professional': { price: 15.99, name: 'Professional', description: 'Ideal for agencies' },
            'enterprise': { price: 49.99, name: 'Enterprise', description: 'For large teams' }
        };
    }

    async validateLicense(key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const demoLicenses = {
                    'AUTHFLOW-DEMO-1234': { 
                        plan: 'professional', 
                        expiry: '2024-12-31', 
                        active: true,
                        created: '2024-01-15'
                    },
                    'AUTHFLOW-TEST-5678': { 
                        plan: 'starter', 
                        expiry: '2024-06-30', 
                        active: true,
                        created: '2024-01-10'
                    }
                };
                
                const license = demoLicenses[key];
                if (license && license.active) {
                    this.licenseKey = key;
                    this.plan = license.plan;
                    this.expiryDate = new Date(license.expiry);
                    this.features = this.getFeaturesForPlan(license.plan);
                    
                    // Store ONLY license info - NO personal data
                    localStorage.setItem('authflow-license', JSON.stringify({
                        key: key,
                        plan: license.plan,
                        expiry: license.expiry,
                        features: this.features
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
            'starter': { 
                accounts: 10, 
                teamMembers: 3, 
                apiAccess: false, 
                advancedSecurity: false,
                prioritySupport: false
            },
            'professional': { 
                accounts: 50, 
                teamMembers: 10, 
                apiAccess: true, 
                advancedSecurity: true,
                prioritySupport: true
            },
            'enterprise': { 
                accounts: 9999, 
                teamMembers: 25, 
                apiAccess: true, 
                advancedSecurity: true,
                prioritySupport: true
            }
        };
        return features[plan] || features['starter'];
    }

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
            status: this.getLicenseStatus()
        };
    }
}