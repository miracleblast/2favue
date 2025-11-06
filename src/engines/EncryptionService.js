// ============ ENCRYPTION SERVICE ============
export class EncryptionService {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.key = null;
    }

    async generateKey() {
        if (!this.key) {
            this.key = await crypto.subtle.generateKey(
                { name: this.algorithm, length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        }
        return this.key;
    }

    async encrypt(data) {
        const key = await this.generateKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(data);
        
        const encrypted = await crypto.subtle.encrypt(
            { name: this.algorithm, iv: iv },
            key,
            encoded
        );

        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encrypted), iv.length);
        
        return btoa(String.fromCharCode(...result));
    }

    async decrypt(encryptedData) {
        try {
            const key = await this.generateKey();
            const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            const iv = data.slice(0, 12);
            const encrypted = data.slice(12);
            
            const decrypted = await crypto.subtle.decrypt(
                { name: this.algorithm, iv: iv },
                key,
                encrypted
            );
            
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
}