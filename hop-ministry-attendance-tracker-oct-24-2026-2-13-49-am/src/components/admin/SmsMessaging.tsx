/**
 * House of Power Ministry International Church, Mankessim, Ghana
 * SMS Messaging & Church Notification Management System
 * 
 * Features:
 * 1. SUNDAY SERVICE NOTIFICATION (Ready-made default message, fully previewable/editable, no auto-send on open)
 * 2. CUSTOM CHURCH ANNOUNCEMENT (Flexible custom SMS with live character/segment counter and Unicode warning)
 * 3. Shared Recipient System (All Registered, Selected Members with Search/Checkboxes, Absent Members by recorded Sunday date)
 * 4. Strict Review & Confirmation Screen before any SMS is dispatched
 * 5. Secure Backend API Proxy with Hubtel/Arkesel support and Ghana phone normalization (+233)
 * 6. SMS Message History & Delivery Reports
 * 7. Optional Scheduled Sunday Notifications (Disabled by default, explicit confirmation required)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { useAuth } from '../../context/AuthContext';
import { Member, AttendanceRecord } from '../../types/church';
import {
  SmsCampaign,
  SmsScheduleConfig,
  SmsGatewayConfigStatus,
  SmsRecipientDetail,
  SmsMessageType,
  SmsRecipientScope,
} from '../../types/sms';
import {
  normalizeGhanaPhone,
  analyzeSmsMessage,
  estimateCampaignCostGhs,
  GHANA_SMS_RATE_PER_SEGMENT_GHS,
  DEFAULT_SUNDAY_SERVICE_MESSAGE,
} from '../../utils/smsUtils';
import { SmsService } from '../../services/smsService';
import {
  MessageSquare,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  RefreshCw,
  Info,
  Shield,
  Phone,
  DollarSign,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { VoiceSearchBar } from '../common/VoiceSearchBar';

export const SmsMessaging: React.FC = () => {
  const { members, attendanceRecords, branchSettings } = useChurchData();
  const { currentUser } = useAuth();

  // Gateway Connection Status
  const [gatewayStatus, setGatewayStatus] = useState<SmsGatewayConfigStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [showGatewayInfoModal, setShowGatewayInfoModal] = useState(false);

  // ==========================================
  // OPTION 1: SUNDAY SERVICE NOTIFICATION STATE
  // ==========================================
  const [sundayMessage, setSundayMessage] = useState(DEFAULT_SUNDAY_SERVICE_MESSAGE);
  const [sundayRecipientScope, setSundayRecipientScope] = useState<SmsRecipientScope>('all_members');
  const [sundaySelectedMemberIds, setSundaySelectedMemberIds] = useState<string[]>([]);
  const [sundayAbsentServiceDate, setSundayAbsentServiceDate] = useState<string>(() => {
    return attendanceRecords.length > 0 ? attendanceRecords[0].date : '';
  });
  const [sundayMemberSearch, setSundayMemberSearch] = useState('');

  // ==========================================
  // OPTION 2: CUSTOM CHURCH ANNOUNCEMENT STATE
  // ==========================================
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customRecipientScope, setCustomRecipientScope] = useState<SmsRecipientScope>('all_members');
  const [customSelectedMemberIds, setCustomSelectedMemberIds] = useState<string[]>([]);
  const [customAbsentServiceDate, setCustomAbsentServiceDate] = useState<string>(() => {
    return attendanceRecords.length > 0 ? attendanceRecords[0].date : '';
  });
  const [customMemberSearch, setCustomMemberSearch] = useState('');

  // ==========================================
  // CONFIRMATION MODAL & SUBMISSION STATE
  // ==========================================
  const [confirmationModalData, setConfirmationModalData] = useState<{
    isOpen: boolean;
    messageType: SmsMessageType;
    title?: string;
    messageText: string;
    recipientScope: SmsRecipientScope;
    serviceDateFilter?: string;
    serviceSessionName?: string;
    recipients: SmsRecipientDetail[];
    validCount: number;
    invalidCount: number;
    segments: number;
    totalCostGhs: number;
  }>({
    isOpen: false,
    messageType: 'sunday_service',
    messageText: '',
    recipientScope: 'all_members',
    recipients: [],
    validCount: 0,
    invalidCount: 0,
    segments: 1,
    totalCostGhs: 0,
  });

  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // ==========================================
  // MESSAGE HISTORY & DELIVERY REPORTS STATE
  // ==========================================
  const [campaignHistory, setCampaignHistory] = useState<SmsCampaign[]>([]);
  const [historyFilterType, setHistoryFilterType] = useState<string>('all');
  const [historyFilterStatus, setHistoryFilterStatus] = useState<string>('all');
  const [selectedCampaignForDetails, setSelectedCampaignForDetails] = useState<SmsCampaign | null>(null);

  // ==========================================
  // SCHEDULED SUNDAY NOTIFICATIONS STATE
  // ==========================================
  const [scheduleConfig, setScheduleConfig] = useState<SmsScheduleConfig>(() =>
    SmsService.getScheduleConfig()
  );
  const [showScheduleConfirmModal, setShowScheduleConfirmModal] = useState(false);
  const [pendingScheduleToggle, setPendingScheduleToggle] = useState<boolean | null>(null);

  // Load gateway status and campaign history on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingStatus(true);
      const status = await SmsService.getGatewayStatus();
      setGatewayStatus(status);
      setIsLoadingStatus(false);

      const history = SmsService.getCampaignHistory();
      setCampaignHistory(history);
    };

    loadInitialData();
  }, []);

  // Compute absent member IDs for selected attendance record
  const getAbsentMemberIdsForDate = (dateStr: string): string[] => {
    const record = attendanceRecords.find((r) => r.date === dateStr);
    if (!record) return [];

    // If explicit status map exists
    if (record.memberAttendanceStatus) {
      return Object.entries(record.memberAttendanceStatus)
        .filter(([_, status]) => status === 'absent')
        .map(([id]) => id);
    }

    // Otherwise members not in rollCallMemberIds
    const presentSet = new Set(record.rollCallMemberIds || []);
    return members.filter((m) => !presentSet.has(m.id)).map((m) => m.id);
  };

  // Recipient resolution for Sunday Notification
  const sundayAbsentIds = useMemo(() => {
    return getAbsentMemberIdsForDate(sundayAbsentServiceDate);
  }, [sundayAbsentServiceDate, attendanceRecords, members]);

  const sundayRecipientsPrepared = useMemo(() => {
    return SmsService.prepareRecipients(
      members,
      sundayRecipientScope,
      sundaySelectedMemberIds,
      sundayAbsentIds
    );
  }, [members, sundayRecipientScope, sundaySelectedMemberIds, sundayAbsentIds]);

  // Recipient resolution for Custom Announcement
  const customAbsentIds = useMemo(() => {
    return getAbsentMemberIdsForDate(customAbsentServiceDate);
  }, [customAbsentServiceDate, attendanceRecords, members]);

  const customRecipientsPrepared = useMemo(() => {
    return SmsService.prepareRecipients(
      members,
      customRecipientScope,
      customSelectedMemberIds,
      customAbsentIds
    );
  }, [members, customRecipientScope, customSelectedMemberIds, customAbsentIds]);

  // Live message analysis
  const sundayMessageAnalysis = useMemo(() => analyzeSmsMessage(sundayMessage), [sundayMessage]);
  const customMessageAnalysis = useMemo(() => analyzeSmsMessage(customMessage), [customMessage]);

  // Sunday estimated cost
  const sundayEstimatedCost = useMemo(() => {
    const totalSegments = sundayRecipientsPrepared.valid.length * sundayMessageAnalysis.segments;
    return estimateCampaignCostGhs(totalSegments);
  }, [sundayRecipientsPrepared.valid.length, sundayMessageAnalysis.segments]);

  // Custom estimated cost
  const customEstimatedCost = useMemo(() => {
    const totalSegments = customRecipientsPrepared.valid.length * customMessageAnalysis.segments;
    return estimateCampaignCostGhs(totalSegments);
  }, [customRecipientsPrepared.valid.length, customMessageAnalysis.segments]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // Open confirmation for Option 1
  const handleOpenSundayConfirmation = () => {
    if (!sundayMessage.trim()) {
      setFeedbackAlert({
        type: 'error',
        text: 'Please enter a Sunday Service notification message before sending.',
      });
      return;
    }

    if (sundayRecipientsPrepared.valid.length === 0) {
      setFeedbackAlert({
        type: 'error',
        text: 'No valid recipient phone numbers found for the selected recipient group.',
      });
      return;
    }

    const session = attendanceRecords.find((r) => r.date === sundayAbsentServiceDate);

    setConfirmationModalData({
      isOpen: true,
      messageType: 'sunday_service',
      title: 'Sunday Service Outreach',
      messageText: sundayMessage,
      recipientScope: sundayRecipientScope,
      serviceDateFilter: sundayRecipientScope === 'absent_members' ? sundayAbsentServiceDate : undefined,
      serviceSessionName: session ? session.serviceType : undefined,
      recipients: sundayRecipientsPrepared.intended,
      validCount: sundayRecipientsPrepared.valid.length,
      invalidCount: sundayRecipientsPrepared.invalid.length,
      segments: sundayMessageAnalysis.segments,
      totalCostGhs: sundayEstimatedCost,
    });
  };

  // Open confirmation for Option 2
  const handleOpenCustomConfirmation = () => {
    if (!customMessage.trim()) {
      setFeedbackAlert({
        type: 'error',
        text: 'Please write your custom announcement message before reviewing.',
      });
      return;
    }

    if (customRecipientsPrepared.valid.length === 0) {
      setFeedbackAlert({
        type: 'error',
        text: 'No valid recipient phone numbers found for the selected recipient group.',
      });
      return;
    }

    const session = attendanceRecords.find((r) => r.date === customAbsentServiceDate);

    setConfirmationModalData({
      isOpen: true,
      messageType: 'custom_announcement',
      title: customTitle.trim() || 'Church Announcement',
      messageText: customMessage,
      recipientScope: customRecipientScope,
      serviceDateFilter: customRecipientScope === 'absent_members' ? customAbsentServiceDate : undefined,
      serviceSessionName: session ? session.serviceType : undefined,
      recipients: customRecipientsPrepared.intended,
      validCount: customRecipientsPrepared.valid.length,
      invalidCount: customRecipientsPrepared.invalid.length,
      segments: customMessageAnalysis.segments,
      totalCostGhs: customEstimatedCost,
    });
  };

  // Execute actual campaign submission
  const handleConfirmAndSend = async () => {
    if (isSubmittingCampaign) return;

    setIsSubmittingCampaign(true);

    const adminUser = {
      id: currentUser?.id || 'admin',
      name: currentUser?.fullName || 'Rev. Administrator',
      role: currentUser?.role || 'Super Administrator',
    };

    try {
      const result = await SmsService.sendCampaign({
        messageType: confirmationModalData.messageType,
        title: confirmationModalData.title,
        messageText: confirmationModalData.messageText,
        senderId: gatewayStatus?.senderId || 'HOP Mankess',
        recipientScope: confirmationModalData.recipientScope,
        serviceDateFilter: confirmationModalData.serviceDateFilter,
        serviceSessionName: confirmationModalData.serviceSessionName,
        recipients: confirmationModalData.recipients,
        adminUser,
      });

      if (result.success) {
        setFeedbackAlert({
          type: 'success',
          text: `Campaign "${result.campaign.campaignName}" successfully dispatched to ${result.campaign.validRecipientsCount} members.`,
        });

        // Refresh campaign history
        setCampaignHistory(SmsService.getCampaignHistory());

        // Close confirmation modal
        setConfirmationModalData((prev) => ({ ...prev, isOpen: false }));

        // If custom message sent, optionally reset message box
        if (confirmationModalData.messageType === 'custom_announcement') {
          setCustomMessage('');
          setCustomTitle('');
        }
      } else {
        setFeedbackAlert({
          type: 'error',
          text: result.message || 'Failed to submit campaign. Please check gateway configuration.',
        });
      }
    } catch (err: any) {
      setFeedbackAlert({
        type: 'error',
        text: err.message || 'An unexpected error occurred while communicating with the SMS gateway.',
      });
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  // Schedule Toggle Handler
  const handleToggleSchedule = (newEnabled: boolean) => {
    setPendingScheduleToggle(newEnabled);
    setShowScheduleConfirmModal(true);
  };

  const handleConfirmScheduleToggle = async () => {
    if (pendingScheduleToggle === null) return;

    const updated: SmsScheduleConfig = {
      ...scheduleConfig,
      enabled: pendingScheduleToggle,
      confirmedByAdminId: currentUser?.id,
      confirmedAt: new Date().toISOString(),
    };

    await SmsService.saveScheduleConfig(updated);
    setScheduleConfig(updated);
    setShowScheduleConfirmModal(false);
    setPendingScheduleToggle(null);

    setFeedbackAlert({
      type: updated.enabled ? 'success' : 'info',
      text: updated.enabled
        ? `Automated Sunday Service SMS scheduler is now ACTIVE for ${updated.dayName} at ${updated.sendTime} (Africa/Accra).`
        : 'Automated Sunday Service SMS scheduler has been DISABLED.',
    });
  };

  // Filtered History
  const filteredCampaigns = useMemo(() => {
    return campaignHistory.filter((c) => {
      const matchesType =
        historyFilterType === 'all' || c.messageType === historyFilterType;
      const matchesStatus =
        historyFilterStatus === 'all' || c.status.toLowerCase().includes(historyFilterStatus.toLowerCase());
      return matchesType && matchesStatus;
    });
  }, [campaignHistory, historyFilterType, historyFilterStatus]);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* 
        TOP HEADER WITH SMS GATEWAY STATUS
      */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-blue-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-amber-500 text-blue-950 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Messaging &amp; Church Notifications</span>
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                gatewayStatus?.mode === 'live'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>
                {gatewayStatus?.mode === 'live' ? 'Gateway Live & Connected' : 'Gateway Simulation & Audit Ready'}
              </span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-white pt-1">
            House of Power Pastoral SMS Broadcast Center
          </h2>
          <p className="text-xs text-blue-200">
            Mankessim Central Branch • Sender ID: <strong className="text-amber-300 font-mono">HOP Mankess</strong> • Ghana E.164 (+233)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowGatewayInfoModal(true)}
            className="px-3.5 py-2 bg-blue-900/80 hover:bg-blue-800 text-blue-100 hover:text-white rounded-xl text-xs font-semibold border border-blue-700/60 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span>Gateway Architecture</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT BANNER */}
      {feedbackAlert && (
        <div
          role="alert"
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-md border ${
            feedbackAlert.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : feedbackAlert.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : feedbackAlert.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span className="font-semibold">{feedbackAlert.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackAlert(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 
        TWO MAIN MESSAGE OPTIONS (SEPARATE CARDS AS MANDATED)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================= */}
        {/* OPTION ONE: READY-MADE SUNDAY SERVICE NOTIFICATION CARD   */}
        {/* ========================================================= */}
        <div className="bg-white/95 rounded-3xl border-2 border-amber-400/50 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white p-5 border-b border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Option One • Ready-Made
                </span>
                <span className="text-xs text-blue-200 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manual Send Control</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-amber-300 mt-2 uppercase tracking-wide">
                SUNDAY SERVICE NOTIFICATION
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                Prewritten Sunday invitation available immediately. Does not send automatically; review and send whenever you decide.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Message Preview & Edit Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Message Text (Editable)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSundayMessage(DEFAULT_SUNDAY_SERVICE_MESSAGE)}
                    className="text-[11px] text-blue-800 hover:text-blue-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Restore the original default church invitation"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-600" />
                    <span>Restore Default Message</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={sundayMessage}
                    onChange={(e) => setSundayMessage(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed transition-all resize-y"
                    placeholder="Type or customize your Sunday Service notification..."
                  />
                </div>

                {/* Live Character & Segment Metrics */}
                <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-600 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span>
                      Characters: <strong className="font-mono text-slate-900 font-bold">{sundayMessageAnalysis.characterCount}</strong>
                    </span>
                    <span>
                      Segments: <strong className="font-mono text-blue-900 font-bold">{sundayMessageAnalysis.segments} SMS</strong>
                    </span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                      {sundayMessageAnalysis.encoding}
                    </span>
                  </div>
                  <span className="text-amber-800 font-medium">
                    Est. per recipient: <strong>~{(sundayMessageAnalysis.segments * GHANA_SMS_RATE_PER_SEGMENT_GHS).toFixed(3)} GHS</strong>
                  </span>
                </div>
              </div>

              {/* Recipient Selection for Sunday Notification */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Intended Recipients
                </label>

                {/* Scope selector tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSundayRecipientScope('all_members')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      sundayRecipientScope === 'all_members'
                        ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Members ({members.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSundayRecipientScope('selected_members')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      sundayRecipientScope === 'selected_members'
                        ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Selected Members ({sundaySelectedMemberIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSundayRecipientScope('absent_members')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      sundayRecipientScope === 'absent_members'
                        ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Members Absent ({sundayAbsentIds.length})</span>
                  </button>
                </div>

                {/* Sub-Panel: If Absent Members selected, pick specific recorded Sunday date */}
                {sundayRecipientScope === 'absent_members' && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <label className="font-bold text-amber-950 block">
                      Choose Recorded Sunday Service Session:
                    </label>
                    <select
                      value={sundayAbsentServiceDate}
                      onChange={(e) => setSundayAbsentServiceDate(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      {attendanceRecords.map((rec) => (
                        <option key={rec.id} value={rec.date}>
                          {rec.date} • {rec.serviceType.replace('Sunday 1st Service', '1st Service').replace('Sunday 2nd Service', '2nd Service')}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-amber-800">
                      Identifies members marked <strong>ABSENT</strong> on {sundayAbsentServiceDate}. Excludes those present or unrecorded.
                    </p>
                  </div>
                )}

                {/* Sub-Panel: If Selected Members, display searchable checkbox list */}
                {sundayRecipientScope === 'selected_members' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Search member name or phone..."
                        value={sundayMemberSearch}
                        onChange={(e) => setSundayMemberSearch(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (sundaySelectedMemberIds.length === members.length) {
                            setSundaySelectedMemberIds([]);
                          } else {
                            setSundaySelectedMemberIds(members.map((m) => m.id));
                          }
                        }}
                        className="whitespace-nowrap px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-[11px]"
                      >
                        {sundaySelectedMemberIds.length === members.length ? 'Clear All' : 'Select All'}
                      </button>
                    </div>

                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 p-1">
                      {members
                        .filter(
                          (m) =>
                            m.fullName.toLowerCase().includes(sundayMemberSearch.toLowerCase()) ||
                            m.phone.includes(sundayMemberSearch)
                        )
                        .map((m) => {
                          const isSelected = sundaySelectedMemberIds.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              className="flex items-center justify-between p-2 hover:bg-blue-50/60 rounded cursor-pointer text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSundaySelectedMemberIds((prev) => prev.filter((id) => id !== m.id));
                                    } else {
                                      setSundaySelectedMemberIds((prev) => [...prev, m.id]);
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-900 rounded"
                                />
                                <div>
                                  <span className="font-semibold text-slate-900 block">{m.fullName}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{m.phone}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                                {m.department}
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Recipient summary metric box */}
                <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold uppercase block tracking-wider">
                      Prepared Recipients
                    </span>
                    <span className="text-sm font-bold text-blue-950 font-serif">
                      {sundayRecipientsPrepared.valid.length} Valid Phone Numbers
                    </span>
                    {sundayRecipientsPrepared.invalid.length > 0 && (
                      <span className="text-[11px] text-rose-600 block">
                        ({sundayRecipientsPrepared.invalid.length} missing/invalid phone numbers excluded)
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Estimated Cost
                    </span>
                    <span className="text-sm font-bold text-amber-700 font-mono">
                      ~{sundayEstimatedCost} GHS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Send Button */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={handleOpenSundayConfirmation}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-blue-950 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300 active:scale-[0.99]"
            >
              <Send className="w-4 h-4 text-blue-950" />
              <span>SEND SUNDAY SERVICE NOTIFICATION</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Opens verification screen. Messages are never sent without your final confirmation.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* OPTION TWO: CUSTOM CHURCH ANNOUNCEMENT CARD               */}
        {/* ========================================================= */}
        <div className="bg-white/95 rounded-3xl border-2 border-blue-400/50 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-950 text-white p-5 border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-200 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  Option Two • Flexible Announcement
                </span>
                <span className="text-xs text-amber-300 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Custom Composition</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-white mt-2 uppercase tracking-wide">
                CUSTOM CHURCH ANNOUNCEMENT
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                Compose custom notices for meetings, prayer vigils, fasting, conferences, or emergency updates.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Optional Title */}
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Announcement Title (Optional Reference)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wednesday Prophetic Service &amp; Miracle Fasting"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Custom Announcement Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                    <span>Announcement Message</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Type announcement text for members
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed transition-all resize-y"
                    placeholder="Dear member, please be reminded of our upcoming 3-day fasting and prayer programme starting this Wednesday at 6:00 PM at Mankessim branch..."
                  />
                </div>

                {/* Unicode Warning if emojis or special characters detected */}
                {customMessageAnalysis.hasSpecialCharacters && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Unicode / Non-GSM Characters Detected:</strong>
                      <span>
                        Characters like emojis or special accents require Unicode (UCS-2) encoding, reducing single SMS capacity to 70 characters (instead of 160).
                      </span>
                    </div>
                  </div>
                )}

                {/* Live Character & Segment Metrics */}
                <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-600 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span>
                      Characters: <strong className="font-mono text-slate-900 font-bold">{customMessageAnalysis.characterCount}</strong>
                    </span>
                    <span>
                      Segments: <strong className="font-mono text-blue-900 font-bold">{customMessageAnalysis.segments} SMS</strong>
                    </span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                      {customMessageAnalysis.encoding}
                    </span>
                  </div>
                  <span className="text-amber-800 font-medium">
                    Est. per recipient: <strong>~{(customMessageAnalysis.segments * GHANA_SMS_RATE_PER_SEGMENT_GHS).toFixed(3)} GHS</strong>
                  </span>
                </div>
              </div>

              {/* Recipient Selection for Custom Announcement */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Intended Recipients
                </label>

                {/* Scope selector tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomRecipientScope('all_members')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      customRecipientScope === 'all_members'
                        ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Members ({members.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomRecipientScope('selected_members')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      customRecipientScope === 'selected_members'
                        ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Selected Members ({customSelectedMemberIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomRecipientScope('absent_members')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      customRecipientScope === 'absent_members'
                        ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Members Absent ({customAbsentIds.length})</span>
                  </button>
                </div>

                {/* Sub-Panel: If Absent Members selected, pick specific recorded Sunday date */}
                {customRecipientScope === 'absent_members' && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <label className="font-bold text-amber-950 block">
                      Choose Recorded Sunday Service Session:
                    </label>
                    <select
                      value={customAbsentServiceDate}
                      onChange={(e) => setCustomAbsentServiceDate(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      {attendanceRecords.map((rec) => (
                        <option key={rec.id} value={rec.date}>
                          {rec.date} • {rec.serviceType.replace('Sunday 1st Service', '1st Service').replace('Sunday 2nd Service', '2nd Service')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub-Panel: If Selected Members, display searchable checkbox list */}
                {customRecipientScope === 'selected_members' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Search member name or phone..."
                        value={customMemberSearch}
                        onChange={(e) => setCustomMemberSearch(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSelectedMemberIds.length === members.length) {
                            setCustomSelectedMemberIds([]);
                          } else {
                            setCustomSelectedMemberIds(members.map((m) => m.id));
                          }
                        }}
                        className="whitespace-nowrap px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-[11px]"
                      >
                        {customSelectedMemberIds.length === members.length ? 'Clear All' : 'Select All'}
                      </button>
                    </div>

                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 p-1">
                      {members
                        .filter(
                          (m) =>
                            m.fullName.toLowerCase().includes(customMemberSearch.toLowerCase()) ||
                            m.phone.includes(customMemberSearch)
                        )
                        .map((m) => {
                          const isSelected = customSelectedMemberIds.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              className="flex items-center justify-between p-2 hover:bg-blue-50/60 rounded cursor-pointer text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setCustomSelectedMemberIds((prev) => prev.filter((id) => id !== m.id));
                                    } else {
                                      setCustomSelectedMemberIds((prev) => [...prev, m.id]);
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-900 rounded"
                                />
                                <div>
                                  <span className="font-semibold text-slate-900 block">{m.fullName}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{m.phone}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                                {m.department}
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Recipient summary metric box */}
                <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold uppercase block tracking-wider">
                      Prepared Recipients
                    </span>
                    <span className="text-sm font-bold text-blue-950 font-serif">
                      {customRecipientsPrepared.valid.length} Valid Phone Numbers
                    </span>
                    {customRecipientsPrepared.invalid.length > 0 && (
                      <span className="text-[11px] text-rose-600 block">
                        ({customRecipientsPrepared.invalid.length} missing/invalid phone numbers excluded)
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Estimated Cost
                    </span>
                    <span className="text-sm font-bold text-amber-700 font-mono">
                      ~{customEstimatedCost} GHS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Review & Send Button */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={handleOpenCustomConfirmation}
              className="w-full py-3.5 px-6 bg-blue-900 hover:bg-blue-800 text-amber-300 hover:text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-700 active:scale-[0.99]"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>REVIEW &amp; SEND ANNOUNCEMENT</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Opens recipient review modal before transmission.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: OPTIONAL SCHEDULED SUNDAY NOTIFICATIONS        */}
      {/* ========================================================= */}
      <div className="bg-white/95 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Automated Background Scheduling
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  scheduleConfig.enabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {scheduleConfig.enabled ? 'ACTIVE' : 'DISABLED BY DEFAULT'}
              </span>
            </div>
            <h3 className="text-lg font-serif font-black text-blue-950 mt-1 uppercase">
              SCHEDULE SUNDAY SERVICE NOTIFICATION
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-0.5">
              Optionally configure an automated weekly dispatch. Must be explicitly confirmed by an administrator.
              Timezone locked to <strong>Africa/Accra (GMT/UTC+0)</strong>.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleToggleSchedule(!scheduleConfig.enabled)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                scheduleConfig.enabled
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{scheduleConfig.enabled ? 'Disable Schedule' : 'Configure & Enable Schedule'}</span>
            </button>
          </div>
        </div>

        {/* Schedule settings controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-700 block mb-1">Dispatch Day</label>
            <select
              disabled={!scheduleConfig.enabled}
              value={scheduleConfig.dayOfWeek}
              onChange={(e) => {
                const day = Number(e.target.value);
                const dayName = day === 6 ? 'Saturday' : 'Sunday';
                const updated = { ...scheduleConfig, dayOfWeek: day, dayName };
                setScheduleConfig(updated);
                SmsService.saveScheduleConfig(updated);
              }}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value={6}>Saturday Evening (Eve of Service)</option>
              <option value={0}>Sunday Morning (Early Call)</option>
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-700 block mb-1">Dispatch Time (Africa/Accra)</label>
            <input
              type="time"
              disabled={!scheduleConfig.enabled}
              value={scheduleConfig.sendTime}
              onChange={(e) => {
                const updated = { ...scheduleConfig, sendTime: e.target.value };
                setScheduleConfig(updated);
                SmsService.saveScheduleConfig(updated);
              }}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-700 block mb-1">Timezone &amp; Status</label>
            <p className="font-mono font-bold text-slate-800 text-xs">Africa/Accra (UTC+0)</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Last triggered: {scheduleConfig.lastRunAt ? new Date(scheduleConfig.lastRunAt).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: SMS MESSAGE HISTORY & DELIVERY REPORTS         */}
      {/* ========================================================= */}
      <div className="bg-white/95 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Audit Trail &amp; Provider Receipts
            </span>
            <h3 className="text-lg font-serif font-black text-blue-950 mt-1 uppercase">
              SMS MESSAGE HISTORY
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every dispatched SMS campaign is logged with provider references and member receipt reports.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={historyFilterType}
              onChange={(e) => setHistoryFilterType(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value="all">All Campaign Types</option>
              <option value="sunday_service">Sunday Service Invitations</option>
              <option value="custom_announcement">Custom Announcements</option>
            </select>

            <select
              value={historyFilterStatus}
              onChange={(e) => setHistoryFilterStatus(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Delivered</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Campaign List */}
        {filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">NO SMS CAMPAIGNS MATCH CURRENT FILTER</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Previous SMS records will appear here as soon as you send or schedule messages.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto table-responsive-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-950 text-white font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">Campaign &amp; Date</th>
                  <th className="p-3.5">Message Type</th>
                  <th className="p-3.5">Message Snippet</th>
                  <th className="p-3.5 text-center">Recipients</th>
                  <th className="p-3.5 text-center">Segments / Cost</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block font-serif text-sm">
                        {camp.campaignName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(camp.submittedAt).toLocaleString('en-GB')}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {camp.messageType === 'sunday_service' ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold">
                          Sunday Service
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md text-[10px] font-bold">
                          Custom Notice
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 max-w-xs truncate text-slate-600">
                      {camp.messageText}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">
                        {camp.validRecipientsCount} Sent
                      </span>
                      {camp.invalidRecipientsCount > 0 && (
                        <span className="text-[10px] text-rose-500 font-mono block">
                          {camp.invalidRecipientsCount} Excluded
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="text-slate-700 block font-mono font-semibold">
                        {camp.segmentsPerMessage} SMS/pers
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold block">
                        ~{camp.estimatedCostGhs} GHS
                      </span>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{camp.status}</span>
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignForDetails(camp)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. MESSAGE REVIEW & CONFIRMATION MODAL (CRITICAL FEATURE) */}
      {/* ========================================================= */}
      {confirmationModalData.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-amber-400 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-950 text-white p-5 border-b border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-blue-950 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-amber-300 uppercase tracking-wide">
                    Review &amp; Confirm SMS Campaign
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    House of Power Ministry International • Mankessim Dispatch
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmationModalData((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Mandatory Prominent Warning */}
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-3 text-amber-950">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-bold leading-relaxed">
                  "Please review the message and recipients carefully. Once sent, SMS messages may not be retractable, and charges may apply."
                </p>
              </div>

              {/* Message Details */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Message Type:
                  </span>
                  <span className="font-bold text-blue-950">
                    {confirmationModalData.messageType === 'sunday_service'
                      ? 'Sunday Service Notification'
                      : confirmationModalData.title || 'Custom Church Announcement'}
                  </span>
                </div>

                {confirmationModalData.serviceSessionName && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Service Filter:</span>
                    <span className="font-mono text-slate-800">
                      {confirmationModalData.serviceDateFilter} ({confirmationModalData.serviceSessionName})
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Full Message Text:
                  </span>
                  <div className="p-3 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {confirmationModalData.messageText}
                  </div>
                </div>
              </div>

              {/* Recipient & Cost Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">Total Target</span>
                  <span className="text-base font-black text-blue-950 font-mono">
                    {confirmationModalData.recipients.length}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Valid Ghana Numbers</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {confirmationModalData.validCount}
                  </span>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">SMS Segments</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {confirmationModalData.segments} / person
                  </span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block">Total Est. Cost</span>
                  <span className="text-base font-black text-amber-700 font-mono">
                    ~{confirmationModalData.totalCostGhs} GHS
                  </span>
                </div>
              </div>

              {/* Sample of Valid Recipients */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Recipient Preview ({confirmationModalData.validCount} Verified Ghanaian Numbers):
                </span>
                <div className="max-h-32 overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-2 divide-y divide-slate-200/60 font-mono text-[11px]">
                  {confirmationModalData.recipients
                    .filter((r) => r.status === 'valid')
                    .map((r, i) => (
                      <div key={i} className="py-1 flex items-center justify-between">
                        <span className="text-slate-900 font-medium">{r.memberName}</span>
                        <span className="text-blue-900 font-bold">{r.normalizedPhone} ({r.network})</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmittingCampaign}
                onClick={() => setConfirmationModalData((prev) => ({ ...prev, isOpen: false }))}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={isSubmittingCampaign}
                onClick={handleConfirmAndSend}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-blue-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmittingCampaign ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-950" />
                    <span>TRANSMITTING SMS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-blue-950" />
                    <span>CONFIRM &amp; SEND SMS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CAMPAIGN DOSSIER INSPECTOR MODAL                          */}
      {/* ========================================================= */}
      {selectedCampaignForDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-300">
                  Campaign Dossier #{selectedCampaignForDetails.id}
                </span>
                <h3 className="font-serif font-black text-base text-white">
                  {selectedCampaignForDetails.campaignName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaignForDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Dispatched By</span>
                  <span className="font-bold text-slate-900">{selectedCampaignForDetails.initiatedBy.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Gateway Provider</span>
                  <span className="font-bold text-blue-900">{selectedCampaignForDetails.providerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Total Cost</span>
                  <span className="font-bold text-amber-700">{selectedCampaignForDetails.estimatedCostGhs} GHS</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Timestamp</span>
                  <span className="font-bold text-slate-700">
                    {new Date(selectedCampaignForDetails.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Message Text:</span>
                <div className="p-3 bg-white border border-slate-300 rounded-xl font-mono text-xs whitespace-pre-wrap">
                  {selectedCampaignForDetails.messageText}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Recipient Transmission Ledger ({selectedCampaignForDetails.recipients.length}):
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-56 overflow-y-auto">
                  {selectedCampaignForDetails.recipients.map((rec, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-900 block">{rec.memberName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {rec.normalizedPhone || rec.originalPhone}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.deliveryStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.deliveryStatus === 'Submitted to Provider'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.deliveryStatus}
                        </span>
                        {rec.providerMessageId && (
                          <span className="text-[9px] text-slate-400 font-mono block">
                            Ref: {rec.providerMessageId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCampaignForDetails(null)}
                className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCHEDULE CONFIRMATION MODAL                               */}
      {/* ========================================================= */}
      {showScheduleConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-blue-950">
                  {pendingScheduleToggle ? 'Enable Automated Sunday Notifications?' : 'Disable Automated Schedule?'}
                </h3>
                <p className="text-xs text-slate-500">Explicit Pastoral Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {pendingScheduleToggle
                ? 'Enabling this setting instructs the backend scheduler to automatically dispatch Sunday Service invitations every week at the configured day and time (Africa/Accra timezone). You can disable this setting at any time.'
                : 'Disabling this setting will halt all future automated weekly notifications. Manual sending from the dashboard will remain available.'}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleConfirmModal(false);
                  setPendingScheduleToggle(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmScheduleToggle}
                className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-amber-300 rounded-xl text-xs font-bold shadow-sm"
              >
                Yes, Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GATEWAY ARCHITECTURE & CREDENTIALS INFO MODAL             */}
      {/* ========================================================= */}
      {showGatewayInfoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-white">
                  Ghana SMS Gateway Architecture &amp; Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGatewayInfoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-blue-950 text-sm">Real SMS Delivery Architecture</h4>
                <p className="leading-relaxed">
                  The application is configured to route SMS traffic through Ghanaian SMS gateways (Hubtel Ghana or Arkesel Ghana) via secure backend proxy routes (<code>POST /api/sms/send</code>).
                </p>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-blue-200 text-blue-900">
                  Admin Dashboard ➔ Secure Express Proxy ➔ Hubtel / Arkesel Gateway ➔ Recipient Handsets (MTN / Telecel / AT)
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">How to Connect Your Church SMS Gateway Account:</h4>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-600 pl-1">
                  <li>
                    Register a business SMS account at <strong>Hubtel.com</strong> or <strong>Arkesel.com</strong>.
                  </li>
                  <li>
                    Register your official Church Sender ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">HOP Mankess</code> with the National Communications Authority (NCA) through your provider portal.
                  </li>
                  <li>
                    In your hosting environment or <code>.env</code> file, set:
                    <pre className="mt-1 p-2 bg-slate-900 text-amber-300 rounded-lg font-mono text-[10px] overflow-x-auto">
                      HUBTEL_CLIENT_ID="your_client_id"<br />
                      HUBTEL_CLIENT_SECRET="your_client_secret"<br />
                      SMS_SENDER_ID="HOP Mankess"
                    </pre>
                  </li>
                  <li>
                    API keys are stored strictly in backend server environment variables and never exposed to the frontend browser.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600">
                <strong>Current Runtime State:</strong> {gatewayStatus?.instructions}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGatewayInfoModal(false)}
                className="px-5 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
