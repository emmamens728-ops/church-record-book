import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, CheckCircle, Upload, RotateCcw, AlertCircle, Info, HardDrive, Check, Loader2 } from 'lucide-react';
import { useImageAssets, ImageAssets } from '../../context/ImageAssetsContext';
import { processLogoTransparency } from '../../utils/imageTransparency';

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetUploadModal: React.FC<AssetUploadModalProps> = ({ isOpen, onClose }) => {
  const {
    images,
    imageLoadedStatus,
    updateImageCustomUrl,
    saveLogoPermanentlyToServer,
    isSavingPermanent,
    permanentSaveMessage,
    resetToDefaultPaths,
  } = useImageAssets();

  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (key: keyof ImageAssets, file: File) => {
    setLocalFeedback(`Reading ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const raw = e.target.result as string;
        setLocalFeedback('Processing logo transparency...');
        const finalUrl = key === 'primaryLogo' ? await processLogoTransparency(raw) : raw;
        await updateImageCustomUrl(key, finalUrl);
        setLocalFeedback('✅ Logo updated and permanently saved to server filesystem!');
        setTimeout(() => setLocalFeedback(null), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExplicitSave = async () => {
    if (images.primaryLogo.startsWith('data:')) {
      const result = await saveLogoPermanentlyToServer(images.primaryLogo);
      if (result.success) {
        setLocalFeedback('✅ Logo successfully written and permanently stored on server disk.');
      } else {
        setLocalFeedback(result.message);
      }
      setTimeout(() => setLocalFeedback(null), 5000);
    } else {
      setLocalFeedback('Current logo is already the official server standard asset.');
      setTimeout(() => setLocalFeedback(null), 4000);
    }
  };

  const assetList: {
    key: keyof ImageAssets;
    title: string;
    expectedFilename: string;
    purpose: string;
  }[] = [
    {
      key: 'primaryLogo',
      title: 'IMAGE 1: Primary Church Logo',
      expectedFilename: 'images (3).jpeg',
      purpose: 'Circular blue-and-gold HOP emblem containing the dove and church name. Used on splash screen, headers, and official documents.',
    },
    {
      key: 'prophetPortrait',
      title: 'IMAGE 2: Prophet Francis Kwarteng Portrait',
      expectedFilename: 'images (1).jpeg',
      purpose: 'Circular portrait image of the General Overseer. Used on the homepage and pastoral administration profile.',
    },
    {
      key: 'blueBanner',
      title: 'IMAGE 3: HOP Branded Blue Banner',
      expectedFilename: 'images.jpeg',
      purpose: 'The HOP church logo on blue background with radiant rays. Used as official background card and hero showcase.',
    },
    {
      key: 'mottoEmblem',
      title: 'IMAGE 4: HOP Motto Emblem',
      expectedFilename: 'images (2).jpeg',
      purpose: 'The large HOP emblem containing the church motto: “Heaven Oo!!! Ɛho ɛna Yɛpɛ”. Used for official seals and reports.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold tracking-wide">
                Church Official Images & Media Assets
              </h2>
              <p className="text-xs text-blue-200">
                House of Power Ministry International • Mankessim, Ghana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white p-1 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border-b border-blue-100 p-4 text-xs text-blue-900 flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-2.5 max-w-lg">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Permanent Church Asset Storage</p>
              <p className="text-blue-800/90 mt-0.5 leading-relaxed">
                When you upload a logo, it is automatically processed to remove background borders and written permanently to the church server filesystem.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExplicitSave}
            disabled={isSavingPermanent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-blue-950 font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
          >
            {isSavingPermanent ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HardDrive className="w-3.5 h-3.5" />
            )}
            <span>Save Logo Permanently</span>
          </button>
        </div>

        {/* Live Feedback Toast */}
        {(localFeedback || permanentSaveMessage) && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{localFeedback || permanentSaveMessage}</span>
          </div>
        )}

        {/* Image Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assetList.map((asset) => {
              const currentSrc = images[asset.key];
              const isLoaded = imageLoadedStatus[asset.key];
              const isCustom = currentSrc && currentSrc.startsWith('data:');

              return (
                <div
                  key={asset.key}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif font-bold text-xs text-blue-950">
                        {asset.title}
                      </span>
                      {isCustom ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                          <HardDrive className="w-3 h-3 text-amber-700" />
                          Custom Saved
                        </span>
                      ) : isLoaded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mb-2">
                      Expected file: <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-[10px]">{asset.expectedFilename}</code>
                    </p>

                    <p className="text-[11px] text-slate-600 leading-snug mb-3">
                      {asset.purpose}
                    </p>

                    {/* Image Preview Box with strict aspect-ratio & contain */}
                    <div className="w-full h-36 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 mb-3 overflow-hidden shadow-xs">
                      <img
                        src={currentSrc}
                        alt={asset.title}
                        className="max-h-full max-w-full object-contain"
                        onError={() => {}}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-2">
                    <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(asset.key, file);
                        }}
                      />
                    </label>

                    {asset.key === 'primaryLogo' && isCustom && (
                      <button
                        type="button"
                        onClick={handleExplicitSave}
                        disabled={isSavingPermanent}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Confirm Permanent Server Save</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={resetToDefaultPaths}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Paths</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
