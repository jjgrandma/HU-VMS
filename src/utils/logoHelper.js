// Logo Helper Utility for Haramaya University Logo Integration
// This utility helps load and set the university logo for PDF reports

import pdfGenerator from './pdfGenerator';

class LogoHelper {
    constructor() {
        this.logoLoaded = false;
    }

    // Load logo from file input (for admin settings page)
    async loadFromFile(file) {
        try {
            const base64String = await pdfGenerator.loadLogoFromFile(file);
            this.logoLoaded = true;

            // Store in localStorage for persistence
            localStorage.setItem('haramayaUniversityLogo', base64String);

            return {
                success: true,
                message: 'University logo loaded successfully',
                base64: base64String
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to load logo: ' + error.message,
                error
            };
        }
    }

    // Load logo from URL (if logo is hosted online)
    async loadFromUrl(imageUrl) {
        try {
            const base64String = await pdfGenerator.loadLogoFromUrl(imageUrl);
            this.logoLoaded = true;

            // Store in localStorage for persistence
            localStorage.setItem('haramayaUniversityLogo', base64String);

            return {
                success: true,
                message: 'University logo loaded from URL successfully',
                base64: base64String
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to load logo from URL: ' + error.message,
                error
            };
        }
    }

    // Load logo from localStorage (on app startup)
    loadFromStorage() {
        try {
            const storedLogo = localStorage.getItem('haramayaUniversityLogo');
            if (storedLogo) {
                pdfGenerator.setHaramayaLogo(storedLogo);
                this.logoLoaded = true;
                console.log('University logo loaded from storage');
                return true;
            } else {
                // If no stored logo, try to load from public folder
                this.loadFromPublicFolder();
            }
            return false;
        } catch (error) {
            console.error('Failed to load logo from storage:', error);
            return false;
        }
    }

    // Load the university logo from public/Haramaya-768x576.png automatically
    async loadFromPublicFolder() {
        try {
            const logoUrl = '/Haramaya-768x576.png';
            const result = await this.loadFromUrl(logoUrl);
            console.log('✅ University logo loaded from public/Haramaya-768x576.png');
            return {
                success: true,
                message: 'University logo loaded from public folder',
                base64: result
            };
        } catch (error) {
            console.log('Could not load logo from public folder:', error.message);
            return {
                success: false,
                message: 'Could not load logo from public folder: ' + error.message,
                error
            };
        }
    }

    // Remove logo
    removeLogo() {
        pdfGenerator.setUniversityLogo(null);
        localStorage.removeItem('haramayaUniversityLogo');
        this.logoLoaded = false;
        console.log('University logo removed');
    }

    // Check if logo is loaded
    isLogoLoaded() {
        return this.logoLoaded;
    }

    // Get logo status
    getStatus() {
        return {
            loaded: this.logoLoaded,
            hasStoredLogo: !!localStorage.getItem('haramayaUniversityLogo'),
            message: this.logoLoaded ? 'Logo is active' : 'Using placeholder logo'
        };
    }
}

// Create singleton instance
const logoHelper = new LogoHelper();

// Auto-load logo from storage on import
logoHelper.loadFromStorage();

export default logoHelper;