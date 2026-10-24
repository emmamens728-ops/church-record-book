/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * Phone utilities for Calling, SMS, and WhatsApp integration
 */

export interface WhatsAppFormatResult {
  internationalNumber: string;
  waLink: string;
  isValid: boolean;
  errorMessage?: string;
  displayFormatted: string;
}

/**
 * Format a phone number for official WhatsApp click-to-chat:
 * Format: https://wa.me/<international-phone-number>
 * 
 * Ghanaian phone rules:
 * - Local numbers starting with '0' (e.g. '0241234567') are converted to international format '233241234567'
 * - Remove spaces, brackets, dashes, and '+'
 * - Do NOT add '233' again if the number already begins with '233'
 * - Validate the phone number before creating link
 * - Never invent or alter the member's actual phone number
 */
export function formatGhanaianWhatsApp(phone: string): WhatsAppFormatResult {
  if (!phone || typeof phone !== 'string') {
    return {
      internationalNumber: '',
      waLink: '',
      isValid: false,
      errorMessage: 'No phone number provided.',
      displayFormatted: 'N/A',
    };
  }

  // Strip all non-digits
  const digitsOnly = phone.replace(/\D/g, '');

  if (!digitsOnly) {
    return {
      internationalNumber: '',
      waLink: '',
      isValid: false,
      errorMessage: 'Phone number contains no valid digits.',
      displayFormatted: phone,
    };
  }

  let internationalNumber = digitsOnly;

  // If local Ghanaian format (starts with 0, e.g. 024XXXXXXX or 050XXXXXXX, typically 10 digits)
  if (digitsOnly.startsWith('0')) {
    internationalNumber = '233' + digitsOnly.slice(1);
  } else if (digitsOnly.startsWith('233')) {
    // Already has 233 country code - do not duplicate
    internationalNumber = digitsOnly;
  } else if (digitsOnly.length === 9) {
    // 9 digits without leading 0 (e.g. 241234567)
    internationalNumber = '233' + digitsOnly;
  }

  // Validation: Ghanaian numbers are typically 233 followed by 9 digits = 12 digits
  // Foreign/International numbers may be 10-15 digits
  if (internationalNumber.length < 9 || internationalNumber.length > 15) {
    return {
      internationalNumber,
      waLink: `https://wa.me/${internationalNumber}`,
      isValid: false,
      errorMessage: 'Phone number length appears incomplete or invalid.',
      displayFormatted: `+${internationalNumber}`,
    };
  }

  const waLink = `https://wa.me/${internationalNumber}`;
  const displayFormatted = `+${internationalNumber}`;

  return {
    internationalNumber,
    waLink,
    isValid: true,
    displayFormatted,
  };
}

/**
 * Format a phone number for native telephone dialer (tel:)
 * Opens phone's native dialer with number pre-filled.
 * Does not place the call automatically.
 */
export function formatNativeCall(phone: string): string {
  if (!phone) return '';
  const sanitized = phone.trim().replace(/[^\d+]/g, '');
  return `tel:${sanitized || phone.trim()}`;
}

/**
 * Format a phone number for native SMS app (sms:)
 * Opens default messaging app with recipient pre-filled.
 */
export function formatNativeSms(phone: string): string {
  if (!phone) return '';
  const sanitized = phone.trim().replace(/[^\d+]/g, '');
  return `sms:${sanitized || phone.trim()}`;
}
