/**
 * Phone number normalization utilities
 * Handles various international formats and country codes
 */

export interface NormalizedPhone {
  original: string;
  normalized: string;
  countryCode?: string;
  nationalNumber?: string;
}

/**
 * Common country codes and their patterns
 */
const COUNTRY_CODES = {
  '973': 'BH', // Bahrain
  '966': 'SA', // Saudi Arabia
  '971': 'AE', // UAE
  '965': 'KW', // Kuwait
  '968': 'OM', // Oman
  '974': 'QA', // Qatar
  '1': 'US',   // USA/Canada
  '44': 'GB',  // UK
  // Add more as needed
};

/**
 * Remove all non-digit characters from phone number
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Normalize phone number to international format
 * Handles various input formats:
 * - +973 1234 5678
 * - 00973 1234 5678
 * - 973 1234 5678
 * - 1234 5678 (local format, assumes Bahrain +973)
 */
export const normalizePhoneNumber = (phone: string, defaultCountryCode: string = '973'): NormalizedPhone => {
  const original = phone;
  let cleaned = cleanPhoneNumber(phone);
  
  // Handle empty or invalid input
  if (!cleaned || cleaned.length < 7) {
    return {
      original,
      normalized: cleaned,
    };
  }
  
  let normalized = '';
  let countryCode = '';
  let nationalNumber = '';
  
  // Remove leading zeros (00 prefix for international)
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // Check if it already has a country code
  for (const code of Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length)) {
    if (cleaned.startsWith(code)) {
      countryCode = code;
      nationalNumber = cleaned.substring(code.length);
      normalized = code + nationalNumber;
      break;
    }
  }
  
  // If no country code found, assume it's a local number
  if (!countryCode) {
    // For Bahrain, local numbers are typically 8 digits
    if (cleaned.length === 8 || cleaned.length === 7) {
      countryCode = defaultCountryCode;
      nationalNumber = cleaned;
      normalized = countryCode + nationalNumber;
    } else {
      // Unknown format, return as is
      normalized = cleaned;
    }
  }
  
  return {
    original,
    normalized,
    countryCode,
    nationalNumber,
  };
};

/**
 * Generate a single normalized E.164 format phone number
 * This is more efficient than generating multiple variants
 */
export const normalizeToE164 = (phone: string, defaultCountryCode: string = '973'): string => {
  const cleaned = cleanPhoneNumber(phone);
  
  if (!cleaned || cleaned.length < 7) {
    return '';
  }
  
  // Remove leading zeros (00 prefix for international)
  let processedNumber = cleaned;
  if (processedNumber.startsWith('00')) {
    processedNumber = processedNumber.substring(2);
  }
  
  // Check if it already has a country code
  const commonCodes = ['973', '966', '971', '965', '968', '974', '1', '44'];
  for (const code of commonCodes) {
    if (processedNumber.startsWith(code)) {
      return `+${processedNumber}`;
    }
  }
  
  // If no country code found, assume it's a local number
  if (processedNumber.length === 8 || processedNumber.length === 7) {
    return `+${defaultCountryCode}${processedNumber}`;
  }
  
  // Return as is if we can't determine format
  return processedNumber.length >= 7 ? `+${processedNumber}` : '';
};

/**
 * Generate minimal phone number variants for better matching
 * Only generates the most likely formats to reduce Firebase queries
 */
export const generatePhoneVariants = (phone: string): string[] => {
  const e164 = normalizeToE164(phone);
  if (!e164) return [];
  
  const variants = new Set<string>();
  variants.add(e164);
  
  // Also add without the + for compatibility
  variants.add(e164.substring(1));
  
  return Array.from(variants);
};

/**
 * Format phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized.countryCode || !normalized.nationalNumber) {
    return phone;
  }
  
  const { countryCode, nationalNumber } = normalized;
  
  // Format based on country
  switch (countryCode) {
    case '973': // Bahrain
      if (nationalNumber.length === 8) {
        return `+973 ${nationalNumber.substring(0, 4)} ${nationalNumber.substring(4)}`;
      }
      break;
    case '966': // Saudi Arabia
      if (nationalNumber.length === 9) {
        return `+966 ${nationalNumber.substring(0, 2)} ${nationalNumber.substring(2, 5)} ${nationalNumber.substring(5)}`;
      }
      break;
    case '1': // US/Canada
      if (nationalNumber.length === 10) {
        return `+1 (${nationalNumber.substring(0, 3)}) ${nationalNumber.substring(3, 6)}-${nationalNumber.substring(6)}`;
      }
      break;
  }
  
  // Default format
  return `+${countryCode} ${nationalNumber}`;
};

/**
 * Check if two phone numbers are the same
 */
export const arePhoneNumbersEqual = (phone1: string, phone2: string): boolean => {
  const variants1 = generatePhoneVariants(phone1);
  const variants2 = generatePhoneVariants(phone2);
  
  // Check if any variant of phone1 matches any variant of phone2
  return variants1.some(v1 => variants2.includes(v1));
};
