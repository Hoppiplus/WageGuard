
// This service manages the "Pay & Activate" flow with Expiration Logic.

const STORAGE_KEY = "wg_license_data"; // Changed key to avoid conflicts with old format
const ZIINA_URL = "https://pay.ziina.com/ChiChi27/KfLxzYEVC";

// --- LICENSE KEY SYSTEM CONFIGURATION ---
const KEY_PREFIX = "WG-";
const SALT = "WAGEGUARD_SECURE_2024_UAE";

// Simple hash function for checksum
const simpleHash = (str: string): string => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).toUpperCase().slice(-4).padStart(4, '0');
};

interface LicenseData {
    status: 'active' | 'expired';
    expiryDate: string; // ISO String
}

export const PaymentService = {
  // 1. Check status (Is active AND not expired)
  isPremium: (): boolean => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return false;
        
        const license: LicenseData = JSON.parse(data);
        if (license.status !== 'active') return false;

        const now = new Date();
        const expiry = new Date(license.expiryDate);
        
        return now < expiry;
    } catch (e) {
        return false;
    }
  },

  // 2. Get Days Remaining
  getDaysRemaining: (): number => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return 0;
        
        const license: LicenseData = JSON.parse(data);
        const now = new Date();
        const expiry = new Date(license.expiryDate);
        
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
      } catch (e) {
          return 0;
      }
  },

  getPaymentLink: (): string => {
    return ZIINA_URL; 
  },

  // 3. Validate and Activate (Set 30 Day Timer)
  activateLicense: async (code: string): Promise<boolean> => {
    const normalizedCode = code.trim().toUpperCase();

    // Demo Override
    if (normalizedCode === "WG-DEMO-TEST") {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30); // +30 Days
        const data: LicenseData = { status: 'active', expiryDate: expiry.toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    }

    // Validation Logic
    if (!normalizedCode.startsWith(KEY_PREFIX)) return false;

    const parts = normalizedCode.split('-');
    if (parts.length !== 3) return false;

    const randomPart = parts[1];
    const userChecksum = parts[2];

    const calculatedChecksum = simpleHash(randomPart + SALT);

    if (userChecksum === calculatedChecksum) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30); // +30 Days
        
        const data: LicenseData = { 
            status: 'active', 
            expiryDate: expiry.toISOString() 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    }

    return false;
  },

  // 4. Check if a previous subscription existed but is now expired
  isExpired: (): boolean => {
     try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return false; // Never subscribed
        
        const license: LicenseData = JSON.parse(data);
        const now = new Date();
        const expiry = new Date(license.expiryDate);
        
        return now >= expiry;
     } catch (e) {
         return false;
     }
  },

  restorePurchases: async (): Promise<boolean> => {
     return PaymentService.isPremium();
  },

  purchaseSubscription: async (): Promise<boolean> => {
     if (typeof window !== 'undefined') {
         window.open(ZIINA_URL, '_blank');
     }
     return false; 
  },

  adminGenerateKey: (random4Chars: string) => {
      const r = random4Chars.toUpperCase().slice(0, 4);
      const checksum = simpleHash(r + SALT);
      const fullKey = `${KEY_PREFIX}${r}-${checksum}`;
      console.log(`%c GENERATED KEY: ${fullKey} `, 'background: #222; color: #bada55; font-size: 16px; padding: 4px;');
      return fullKey;
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

if (typeof window !== 'undefined') {
    (window as any).GenerateLicense = PaymentService.adminGenerateKey;
}
