import CryptoJS from 'crypto-js'

// ============ REAL TOTP ENGINE ============
export class RealTOTPEngine {
    constructor() {
        this.accounts = new Map();
        this.intervals = new Map();
        this.visibleAccounts = new Set();
        this.isRunning = false;
        this.lastUpdate = Date.now();
        console.log('🔥 Real TOTP Engine Initialized!');
    }

    base32Decode(encoded) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let result = '';

        encoded = encoded.replace(/=+$/, '').replace(/\s/g, '').toUpperCase();

        for (let i = 0; i < encoded.length; i++) {
            const val = base32Chars.indexOf(encoded[i]);
            if (val === -1) throw new Error('Invalid base32 character');
            bits += val.toString(2).padStart(5, '0');
        }

        for (let i = 0; i + 8 <= bits.length; i += 8) {
            const byte = bits.substr(i, 8);
            result += String.fromCharCode(parseInt(byte, 2));
        }

        return result;
    }

    numToBytes(num) {
        const byteArray = [];
        for (let i = 7; i >= 0; i--) {
            byteArray.push((num >>> (i * 8)) & 0xFF);
        }
        return byteArray;
    }

    generateTOTP(secret, window = 0) {
        try {
            const key = this.base32Decode(secret);
            const time = Math.floor(Date.now() / 1000 / 30) + window;
            const timeBuffer = this.numToBytes(time);
            
            const timeWordArray = CryptoJS.lib.WordArray.create(new Uint8Array(timeBuffer));
            const keyWordArray = CryptoJS.enc.Latin1.parse(key);
            
            const hmac = CryptoJS.HmacSHA1(timeWordArray, keyWordArray);
            const hmacWords = hmac.words;
            
            const offset = hmacWords[19] & 0xf;
            const code = (
                ((hmacWords[offset] & 0x7f) << 24) |
                ((hmacWords[offset + 1] & 0xff) << 16) |
                ((hmacWords[offset + 2] & 0xff) << 8) |
                (hmacWords[offset + 3] & 0xff)
            ) % 1000000;
            
            return code.toString().padStart(6, '0');
            
        } catch (error) {
            console.error('TOTP generation error:', error);
            return '000000';
        }
    }

    addAccount(accountId, name, secret, issuer = 'Unknown', type = 'TOTP', group = 'default') {
        const account = {
            id: accountId,
            name,
            secret,
            issuer,
            type,
            group,
            backupCodes: this.generateBackupCodes(),
            added: new Date(),
            lastUsed: null
        };

        this.accounts.set(accountId, account);
        this.startRealTimeUpdates(accountId);
        
        console.log(`✅ Added account: ${name}`);
        return account;
    }

    startRealTimeUpdates(accountId) {
        if (this.intervals.has(accountId)) {
            clearInterval(this.intervals.get(accountId));
        }

        const interval = setInterval(() => {
            const account = this.accounts.get(accountId);
            if (!account) return;

            const token = this.generateTOTP(account.secret);
            const timeLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
            
            // Dispatch event for Vue components to listen to
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('realTokenUpdate', {
                    detail: {
                        accountId,
                        token: this.formatToken(token),
                        timeLeft,
                        valid: timeLeft > 3,
                        rawToken: token
                    }
                }));
            }
            
        }, 1000);

        this.intervals.set(accountId, interval);
    }

    formatToken(token) {
        return token.replace(/(\d{3})(\d{3})/, '$1 $2');
    }

    generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push({
                code: Math.random().toString(36).substring(2, 10).toUpperCase(),
                used: false,
                usedAt: null
            });
        }
        return codes;
    }

    validateToken(secret, token, window = 1) {
        const cleanToken = token.replace(/\s/g, '');
        for (let i = -window; i <= window; i++) {
            if (this.generateTOTP(secret, i) === cleanToken) {
                return true;
            }
        }
        return false;
    }

    getAllAccounts() {
        return Array.from(this.accounts.values());
    }

    removeAccount(accountId) {
        if (this.intervals.has(accountId)) {
            clearInterval(this.intervals.get(accountId));
            this.intervals.delete(accountId);
        }
        this.accounts.delete(accountId);
    }

    // Lazy updates for performance
    setVisibleAccounts(accountIds) {
        this.visibleAccounts = new Set(accountIds);
        
        if (this.visibleAccounts.size > 0 && !this.isRunning) {
            this.startLazyUpdates();
        } else if (this.visibleAccounts.size === 0 && this.isRunning) {
            this.stopLazyUpdates();
        }
    }

    startLazyUpdates() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const update = () => {
            if (!this.isRunning) return;
            
            const now = Date.now();
            const elapsed = now - this.lastUpdate;
            
            if (elapsed >= 1000) {
                this.updateVisibleTokens();
                this.lastUpdate = now;
            }
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    }

    stopLazyUpdates() {
        this.isRunning = false;
    }

    updateVisibleTokens() {
        this.visibleAccounts.forEach(accountId => {
            const account = this.accounts.get(accountId);
            if (!account) return;

            const token = this.generateTOTP(account.secret);
            const timeLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('realTokenUpdate', {
                    detail: {
                        accountId,
                        token: this.formatToken(token),
                        timeLeft,
                        valid: timeLeft > 3,
                        rawToken: token
                    }
                }));
            }
        });
    }
}