/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * SMS Utilities: Ghana Phone Normalization, Carrier Recognition & GSM Segmentation
 */

export interface NormalizedPhoneResult {
  isValid: boolean;
  original: string;
  normalized: string; // E.164 e.g. "+233241234567"
  national: string;   // e.g. "024 123 4567"
  carrier?: 'MTN Ghana' | 'Telecel Ghana' | 'AT (AirtelTigo)' | 'Other / Fixed';
  error?: string;
}

// GSM 7-bit default alphabet characters
const GSM_7BIT_REGEX = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1BÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;

/**
 * Normalizes and validates Ghanaian phone numbers into standard E.164 format.
 * Ghana country code: +233
 * Mobile networks:
 * - MTN Ghana: 024, 054, 055, 059, 053
 * - Telecel Ghana (formerly Vodafone): 020, 050
 * - AT Ghana (formerly AirtelTigo): 027, 057, 026, 056
 */
export function normalizeGhanaPhone(rawPhone: string): NormalizedPhoneResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      original: rawPhone || '',
      normalized: '',
      national: '',
      error: 'Phone number is empty or missing',
    };
  }

  // Strip spaces, dashes, parentheses, dots
  let digits = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Handle leading +
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }

  // Handle Ghanaian international format: 233XXXXXXXXX
  if (digits.startsWith('233')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // A valid Ghanaian subscriber number must be exactly 9 digits
  if (!/^\d{9}$/.test(digits)) {
    return {
      isValid: false,
      original: rawPhone,
      normalized: '',
      national: rawPhone,
      error: `Invalid length: Expected 9 or 10 digits for Ghana, got ${digits.length}`,
    };
  }

  const prefix = digits.slice(0, 2);
  let carrier: 'MTN Ghana' | 'Telecel Ghana' | 'AT (AirtelTigo)' | 'Other / Fixed' = 'Other / Fixed';

  if (['24', '54', '55', '59', '53'].includes(prefix)) {
    carrier = 'MTN Ghana';
  } else if (['20', '50'].includes(prefix)) {
    carrier = 'Telecel Ghana';
  } else if (['27', '57', '26', '56'].includes(prefix)) {
    carrier = 'AT (AirtelTigo)';
  }

  const normalized = `+233${digits}`;
  const national = `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;

  return {
    isValid: true,
    original: rawPhone,
    normalized,
    national,
    carrier,
  };
}

export interface SmsEncodingInfo {
  characterCount: number;
  encoding: 'GSM-7' | 'Unicode';
  segments: number;
  maxCharsForCurrentSegments: number;
  remainingInCurrentSegment: number;
  hasSpecialCharacters: boolean;
  specialCharsDetected: string[];
}

/**
 * Calculates SMS segment counts and detects Unicode characters (which reduce single SMS to 70 chars)
 */
export function analyzeSmsMessage(text: string): SmsEncodingInfo {
  if (!text) {
    return {
      characterCount: 0,
      encoding: 'GSM-7',
      segments: 1,
      maxCharsForCurrentSegments: 160,
      remainingInCurrentSegment: 160,
      hasSpecialCharacters: false,
      specialCharsDetected: [],
    };
  }

  const length = text.length;
  const isGsm = GSM_7BIT_REGEX.test(text);
  const encoding = isGsm ? 'GSM-7' : 'Unicode';

  // Identify special characters for helpful administrator warnings
  const specialCharsDetected: string[] = [];
  if (!isGsm) {
    for (const char of text) {
      if (!GSM_7BIT_REGEX.test(char) && !specialCharsDetected.includes(char)) {
        specialCharsDetected.push(char);
      }
    }
  }

  let segments = 1;
  let maxCharsForCurrentSegments = 160;

  if (isGsm) {
    if (length <= 160) {
      segments = 1;
      maxCharsForCurrentSegments = 160;
    } else {
      // Concatenated GSM SMS uses 153 characters per segment due to UDH header
      segments = Math.ceil(length / 153);
      maxCharsForCurrentSegments = segments * 153;
    }
  } else {
    if (length <= 70) {
      segments = 1;
      maxCharsForCurrentSegments = 70;
    } else {
      // Concatenated Unicode SMS uses 67 characters per segment due to UDH header
      segments = Math.ceil(length / 67);
      maxCharsForCurrentSegments = segments * 67;
    }
  }

  const remainingInCurrentSegment = maxCharsForCurrentSegments - length;

  return {
    characterCount: length,
    encoding,
    segments,
    maxCharsForCurrentSegments,
    remainingInCurrentSegment: Math.max(0, remainingInCurrentSegment),
    hasSpecialCharacters: !isGsm,
    specialCharsDetected: specialCharsDetected.slice(0, 10),
  };
}

/**
 * Standard Ghana Cedi cost estimation per segment
 * Typical Hubtel / Arkesel business bulk SMS is ~0.045 - 0.055 GHS
 */
export const GHANA_SMS_RATE_PER_SEGMENT_GHS = 0.048;

export function estimateCampaignCostGhs(totalSegments: number, rateGhs = GHANA_SMS_RATE_PER_SEGMENT_GHS): number {
  return Number((totalSegments * rateGhs).toFixed(2));
}

export const DEFAULT_SUNDAY_SERVICE_MESSAGE =
  'Dear Church Member, you are warmly invited to our Sunday Service at House of Power of Ministry International, Mankessim. Join us as we gather to worship God and receive His Word. We look forward to seeing you. God bless you!';
