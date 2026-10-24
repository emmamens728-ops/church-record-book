/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * SMS Messaging & Church Notifications Type Definitions
 */

export type SmsMessageType = 'sunday_service' | 'custom_announcement';

export type SmsRecipientScope = 'all_members' | 'selected_members' | 'absent_members';

export type SmsDeliveryStatus =
  | 'Queued'
  | 'Submitted to Provider'
  | 'Delivered'
  | 'Failed'
  | 'Unknown';

export interface SmsRecipientDetail {
  memberId: string;
  memberName: string;
  originalPhone: string;
  normalizedPhone: string;
  network?: string; // MTN, Telecel, AT Ghana
  status: 'valid' | 'invalid' | 'opted_out' | 'missing';
  deliveryStatus: SmsDeliveryStatus;
  providerMessageId?: string;
  deliveredAt?: string;
  errorMessage?: string;
}

export interface SmsCampaign {
  id: string;
  campaignName: string;
  messageType: SmsMessageType;
  title?: string; // For custom announcements
  messageText: string;
  senderId: string; // e.g. "HOP Mankess"
  initiatedBy: {
    id: string;
    name: string;
    role: string;
  };
  recipientScope: SmsRecipientScope;
  serviceDateFilter?: string; // Specific Sunday date if absent members selected
  serviceSessionName?: string;
  totalRecipientsTargeted: number;
  validRecipientsCount: number;
  invalidRecipientsCount: number;
  segmentsPerMessage: number;
  encoding: 'GSM-7' | 'Unicode';
  characterCount: number;
  estimatedCostGhs: number;
  submittedAt: string;
  status: 'Completed' | 'Partially Delivered' | 'Processing' | 'Failed' | 'Scheduled';
  providerName: 'Hubtel Ghana' | 'Arkesel Ghana' | 'Simulation Gateway';
  providerReference?: string;
  recipients: SmsRecipientDetail[];
}

export interface SmsScheduleConfig {
  enabled: boolean;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayName: string; // 'Saturday' | 'Sunday'
  sendTime: string; // 'HH:mm' e.g. '18:00' or '06:30'
  recipientScope: SmsRecipientScope;
  messageTemplate: string;
  timezone: string; // 'Africa/Accra'
  lastRunAt?: string;
  nextRunAt?: string;
  confirmedByAdminId?: string;
  confirmedAt?: string;
}

export interface SmsGatewayConfigStatus {
  configured: boolean;
  provider: 'hubtel' | 'arkesel' | 'simulation';
  providerDisplayName: string;
  senderId: string;
  mode: 'live' | 'simulation';
  balanceGhs?: number;
  ratePerSegmentGhs: number;
  schedulerActive: boolean;
  instructions: string;
}

export interface SmsEstimateResult {
  characterCount: number;
  encoding: 'GSM-7' | 'Unicode';
  segmentsPerRecipient: number;
  totalValidRecipients: number;
  totalInvalidRecipients: number;
  totalSegments: number;
  estimatedTotalCostGhs: number;
  hasSpecialCharacters: boolean;
  currency: string;
}
