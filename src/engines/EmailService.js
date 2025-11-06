// ============ EMAIL SERVICE FOR INVITATIONS ============
export class EmailService {
    constructor() {
        this.apiKey = null;
        this.provider = 'smtp'; // Default to SMTP
    }

    // Method to send invitation emails
    async sendInvitation(invitationData) {
        const { email, licenseKey, role, customMessage, adminName } = invitationData;
        
        try {
            // For local hosting, we'll simulate email sending
            // In production, you'd integrate with your email API
            console.log('📧 Sending invitation email:', {
                to: email,
                licenseKey,
                role,
                adminName
            });

            // Simulate API call
            await this.simulateEmailSending(invitationData);
            
            return {
                success: true,
                message: `Invitation sent to ${email}`,
                licenseKey: licenseKey
            };
            
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send invitation email');
        }
    }

    async simulateEmailSending(invitationData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('✅ Email sent successfully:', invitationData);
                resolve(true);
            }, 2000);
        });
    }

    // Method to configure email provider
    configureEmail(provider, apiKey, config = {}) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.config = config;
        
        console.log('📧 Email service configured:', {
            provider,
            hasApiKey: !!apiKey,
            config
        });
    }

    // Template for invitation email
    getInvitationTemplate(invitationData) {
        const { email, licenseKey, role, customMessage, adminName } = invitationData;
        
        return `
Subject: You're invited to join AuthFlow Pro Team!

Hello,

You have been invited by ${adminName || 'your team administrator'} to join their AuthFlow Pro account.

Your license key: ${licenseKey}
Your role: ${role}

${customMessage ? `Message from ${adminName}: ${customMessage}` : ''}

To get started:
1. Download AuthFlow Pro from our website
2. Launch the application
3. Enter your license key when prompted
4. Start managing your 2FA accounts securely

This license key is tied to your email and cannot be transferred.

Best regards,
AuthFlow Pro Team

Privacy First: Your data stays on your device. No tracking, no analytics.
        `.trim();
    }
}