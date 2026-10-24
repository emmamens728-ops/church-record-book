import React, { useState } from 'react';
import { Phone, MessageSquare, Send, X, Check, Copy, AlertCircle, ExternalLink } from 'lucide-react';
import { formatGhanaianWhatsApp, formatNativeCall, formatNativeSms } from '../../utils/phoneUtils';

interface MemberPhoneActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  memberName?: string;
  memberCode?: string;
  department?: string;
}

export const MemberPhoneActionModal: React.FC<MemberPhoneActionModalProps> = ({
  isOpen,
  onClose,
  phone,
  memberName = 'Church Member',
  memberCode,
  department,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const waResult = formatGhanaianWhatsApp(phone);
  const callUrl = formatNativeCall(phone);
  const smsUrl = formatNativeSms(phone);

  const handleCopy = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-amber-400/50 overflow-hidden transform transition-all">
        {/* Modal Header with Church Branding */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white p-5 flex items-start justify-between border-b-2 border-amber-400/40">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase block">
              Direct Member Communication
            </span>
            <h3 id="phone-modal-title" className="font-serif font-black text-lg text-white mt-0.5">
              {memberName}
            </h3>
            {(memberCode || department) && (
              <p className="text-xs text-blue-200 mt-0.5 font-medium">
                {memberCode && <span className="font-mono text-amber-200">{memberCode} · </span>}
                {department}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-full hover:bg-blue-800/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Phone Number Display & Copy Button */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Saved Profile Number
              </span>
              <span className="font-mono font-black text-slate-900 text-lg">
                {phone || 'No phone number'}
              </span>
              {waResult.isValid && (
                <span className="text-[11px] text-emerald-700 block font-medium">
                  WhatsApp: {waResult.displayFormatted}
                </span>
              )}
            </div>

            {phone && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
                title="Copy phone number to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Validation Feedback */}
          {!waResult.isValid && phone && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{waResult.errorMessage || 'Please check the number format.'}</span>
            </div>
          )}

          {!phone && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>No telephone number is saved on this member profile.</span>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center font-medium">
            Select how you would like to connect with this member:
          </p>

          {/* THE 3 DISTINCT INTERACTIVE OPTIONS */}
          <div className="grid grid-cols-1 gap-3">
            {/* 1. CALL */}
            <a
              href={phone ? callUrl : undefined}
              onClick={() => {
                if (phone) onClose();
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all min-h-[56px] ${
                phone
                  ? 'bg-blue-900 hover:bg-blue-800 text-white border-blue-950 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-serif font-black text-sm tracking-wide block uppercase">
                    1. CALL
                  </span>
                  <span className="text-[11px] text-blue-200 block">
                    Opens native phone dialler with {phone}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-800/80 rounded-lg text-amber-300 border border-amber-400/40">
                Dial
              </span>
            </a>

            {/* 2. SMS */}
            <a
              href={phone ? smsUrl : undefined}
              onClick={() => {
                if (phone) onClose();
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all min-h-[56px] ${
                phone
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-950 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-serif font-black text-sm tracking-wide block uppercase">
                    2. SMS
                  </span>
                  <span className="text-[11px] text-slate-300 block">
                    Opens messaging app with recipient pre-filled
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-800 rounded-lg text-amber-300 border border-amber-400/40">
                Text
              </span>
            </a>

            {/* 3. WHATSAPP */}
            <a
              href={phone && waResult.isValid ? waResult.waLink : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (phone && waResult.isValid) onClose();
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all min-h-[56px] ${
                phone && waResult.isValid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Send className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-serif font-black text-sm tracking-wide block uppercase">
                    3. WHATSAPP
                  </span>
                  <span className="text-[11px] text-emerald-100 block">
                    Opens WhatsApp chat with {waResult.displayFormatted}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-700 rounded-lg text-white border border-emerald-400/40 inline-flex items-center gap-1">
                <span>Chat</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-normal pt-1">
            Note: The phone number will be pre-filled automatically. You review and send any calls or messages yourself.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
