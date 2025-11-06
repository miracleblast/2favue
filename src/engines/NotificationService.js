// ============ REAL NOTIFICATION SERVICE ============
export class NotificationService {
    constructor() {
        this.permission = null;
        this.isSupported = 'Notification' in window;
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.warn('Notifications not supported in this browser');
            return;
        }

        this.permission = Notification.permission;
        
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
    }

    async showNotification(title, options = {}) {
        if (!this.isSupported || this.permission !== 'granted') {
            console.warn('Notifications not granted or supported');
            return false;
        }

        try {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                tag: 'authflow',
                renotify: true,
                silent: false,
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return true;
        } catch (error) {
            console.error('Notification failed:', error);
            return false;
        }
    }

    // Security event notifications
    async notifySecurityEvent(event) {
        const { type, user, ip, platform, status } = event;
        
        const title = `Security ${status === 'Success' ? 'Event' : 'Alert'}`;
        const body = `${user} ${this.getEventDescription(type)} from ${platform}`;
        
        return this.showNotification(title, {
            body,
            icon: status === 'Success' ? '/icons/success.png' : '/icons/warning.png',
            badge: '/icons/shield.png'
        });
    }

    // Token notifications
    async notifyLowTokenTime(accountName, timeLeft) {
        return this.showNotification('Token Expiring Soon', {
            body: `${accountName} token expires in ${timeLeft} seconds`,
            icon: '/icons/token.png',
            tag: `token-${accountName}`
        });
    }

    // License notifications
    async notifyLicenseExpiry(daysLeft) {
        const title = daysLeft <= 7 ? 'License Expiring Soon!' : 'License Reminder';
        const body = daysLeft <= 7 
            ? `Your license expires in ${daysLeft} days!` 
            : `Your license expires in ${daysLeft} days`;
        
        return this.showNotification(title, {
            body,
            icon: '/icons/license.png',
            requireInteraction: daysLeft <= 7
        });
    }

    // Team activity notifications
    async notifyTeamActivity(activity) {
        return this.showNotification('Team Activity', {
            body: `${activity.user} ${activity.action}`,
            icon: '/icons/team.png'
        });
    }

    getEventDescription(type) {
        const events = {
            'login': 'logged in',
            'logout': 'logged out',
            'token_generated': 'generated a token',
            'account_added': 'added an account',
            'account_removed': 'removed an account',
            'license_generated': 'generated a license',
            'settings_updated': 'updated settings'
        };
        return events[type] || 'performed an action';
    }

    // Check if notifications are supported and granted
    canNotify() {
        return this.isSupported && this.permission === 'granted';
    }

    // Request permission if not granted
    async requestPermission() {
        if (!this.isSupported) return false;
        
        this.permission = await Notification.requestPermission();
        return this.permission === 'granted';
    }
}