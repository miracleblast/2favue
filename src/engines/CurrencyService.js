// ============ REAL CURRENCY SERVICE ============
export class CurrencyService {
    constructor() {
        this.baseCurrency = 'USD';
        this.rates = new Map();
        this.lastUpdate = null;
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
    }

    async fetchExchangeRates() {
        try {
            // Using free exchange rate API (no API key required)
            const response = await fetch('https://api.exchangerate.host/latest?base=USD');
            const data = await response.json();
            
            if (data.success) {
                this.rates = new Map(Object.entries(data.rates));
                this.lastUpdate = new Date();
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.warn('Failed to fetch exchange rates, using fallback:', error);
            // Fallback rates (updated periodically)
            this.setFallbackRates();
        }
        
        return false;
    }

    setFallbackRates() {
        // Fallback rates (approximate values)
        this.rates = new Map([
            ['USD', 1],
            ['EUR', 0.85],
            ['GBP', 0.73],
            ['THB', 33.5],    // Thai Baht
            ['ZAR', 18.2],    // South African Rand
            ['NGN', 460],     // Nigerian Naira
            ['EGP', 30.9],    // Egyptian Pound
            ['RUB', 75.4],    // Russian Ruble
            ['INR', 74.5],    // Indian Rupee
            ['CNY', 6.45],    // Chinese Yuan
            ['KRW', 1180],    // South Korean Won
            ['BRL', 5.25],    // Brazilian Real
            ['KES', 113.5],   // Kenyan Shilling
            ['DZD', 134.5],   // Algerian Dinar
            ['MAD', 9.1],     // Moroccan Dirham
            ['GHS', 5.85],    // Ghanaian Cedi
            ['UGX', 3550],    // Ugandan Shilling
            ['XAF', 660],     // CFA Franc (Central Africa)
            ['XOF', 660]      // CFA Franc (West Africa)
        ]);
        this.lastUpdate = new Date();
    }

    async convertPrice(priceUSD, targetCurrency) {
        // Ensure we have rates
        if (this.rates.size === 0 || this.shouldRefresh()) {
            await this.fetchExchangeRates();
        }

        const rate = this.rates.get(targetCurrency);
        if (!rate) {
            console.warn(`No exchange rate for ${targetCurrency}, using USD`);
            return priceUSD;
        }

        return priceUSD * rate;
    }

    formatPrice(price, currency) {
        const formatters = {
            'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
            'EUR': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
            'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
            'THB': new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }),
            'ZAR': new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }),
            'NGN': new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
            'EGP': new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }),
            'RUB': new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }),
            'INR': new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
            'CNY': new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
            'KRW': new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }),
            'BRL': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
            'KES': new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }),
            'DZD': new Intl.NumberFormat('ar-DZ', { style: 'currency', currency: 'DZD' }),
            'MAD': new Intl.NumberFormat('ar-MA', { style: 'currency', currency: 'MAD' }),
            'GHS': new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }),
            'UGX': new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }),
            'XAF': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }),
            'XOF': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
        };

        const formatter = formatters[currency];
        if (formatter) {
            return formatter.format(price);
        }

        // Fallback formatting
        return `${getCurrencySymbol(currency)}${price.toFixed(2)}`;
    }

    shouldRefresh() {
        if (!this.lastUpdate) return true;
        return Date.now() - this.lastUpdate.getTime() > this.cacheDuration;
    }

    saveToStorage() {
        const data = {
            rates: Object.fromEntries(this.rates),
            lastUpdate: this.lastUpdate.getTime()
        };
        localStorage.setItem('authflow-currency-rates', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('authflow-currency-rates');
        if (saved) {
            const data = JSON.parse(saved);
            this.rates = new Map(Object.entries(data.rates));
            this.lastUpdate = new Date(data.lastUpdate);
            
            if (this.shouldRefresh()) {
                this.fetchExchangeRates(); // Refresh in background
            }
        } else {
            this.setFallbackRates();
        }
    }

    getSupportedCurrencies() {
        return [
            { code: 'USD', name: 'US Dollar', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' },
            { code: 'GBP', name: 'British Pound', symbol: '£' },
            { code: 'THB', name: 'Thai Baht', symbol: '฿' },
            { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
            { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
            { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
            { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
            { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
            { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
            { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
            { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA' },
            { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
            { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
            { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
            { code: 'XAF', name: 'CFA Franc BEAC', symbol: 'FCFA' },
            { code: 'XOF', name: 'CFA Franc BCEAO', symbol: 'CFA' }
        ];
    }
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'THB': '฿', 'ZAR': 'R',
        'NGN': '₦', 'EGP': 'E£', 'RUB': '₽', 'INR': '₹', 'CNY': '¥',
        'KRW': '₩', 'BRL': 'R$', 'KES': 'KSh', 'DZD': 'DA', 'MAD': 'MAD',
        'GHS': 'GH₵', 'UGX': 'USh', 'XAF': 'FCFA', 'XOF': 'CFA'
    };
    return symbols[currency] || currency;
}