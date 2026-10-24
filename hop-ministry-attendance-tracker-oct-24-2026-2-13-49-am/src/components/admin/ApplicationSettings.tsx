import React, { useState } from 'react';
import { useChurchData } from '../../context/ChurchDataContext';
import { useImageAssets } from '../../context/ImageAssetsContext';
import { processLogoTransparency } from '../../utils/imageTransparency';
import { ChurchBranchSettings } from '../../types/church';
import { Settings, Save, CheckCircle2, Plus, Trash2, MapPin, Sparkles, Upload, HardDrive, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ChurchImage } from '../common/ChurchImage';

export const ApplicationSettings: React.FC = () => {
  const { branchSettings, updateBranchSettings } = useChurchData();
  const { images, updateImageCustomUrl, saveLogoPermanentlyToServer, isSavingPermanent, permanentSaveMessage } = useImageAssets();
  const [formData, setFormData] = useState<ChurchBranchSettings>(branchSettings);
  const [newDepartment, setNewDepartment] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoStatusMsg, setLogoStatusMsg] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoStatusMsg(`Processing ${file.name}...`);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const raw = event.target.result as string;
          const transparent = await processLogoTransparency(raw);
          await updateImageCustomUrl('primaryLogo', transparent);
          setLogoStatusMsg('✅ Logo successfully updated and permanently saved to server filesystem!');
          setTimeout(() => setLogoStatusMsg(null), 5000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCurrentLogoPermanently = async () => {
    if (images.primaryLogo.startsWith('data:')) {
      const res = await saveLogoPermanentlyToServer(images.primaryLogo);
      if (res.success) {
        setLogoStatusMsg('✅ Church logo permanently saved to server filesystem!');
      } else {
        setLogoStatusMsg(res.message);
      }
      setTimeout(() => setLogoStatusMsg(null), 5000);
    } else {
      setLogoStatusMsg('The active logo is already permanently stored on the server.');
      setTimeout(() => setLogoStatusMsg(null), 4000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranchSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) return;
    if (formData.departments.includes(newDepartment.trim() as any)) {
      alert('Department already exists.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      departments: [...prev.departments, newDepartment.trim() as any],
    }));
    setNewDepartment('');
  };

  const handleRemoveDepartment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-blue-950 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <span>Church Branch & Application Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure Mankessim church identity, weekly service schedules, and departmental units
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>Save Church Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50/95 backdrop-blur-md border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Church settings updated and saved to local storage!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Church Identity */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-100 pb-2">
            1. Official Church Identity & Secretariat
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Church Name</label>
              <input
                type="text"
                required
                value={formData.churchName}
                onChange={e => setFormData({ ...formData, churchName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                required
                value={formData.branchName}
                onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Geographic Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Motto</label>
              <input
                type="text"
                required
                value={formData.motto}
                onChange={e => setFormData({ ...formData, motto: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-serif italic"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">General Overseer & Spiritual Leader</label>
              <input
                type="text"
                required
                value={formData.spiritualLeader}
                onChange={e => setFormData({ ...formData, spiritualLeader: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resident Pastor in Charge</label>
              <input
                type="text"
                required
                value={formData.pastorInCharge}
                onChange={e => setFormData({ ...formData, pastorInCharge: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Church Logo & Permanent Branding Card */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-serif font-bold text-sm text-blue-950 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>2. Official Church Logo & Permanent Filesystem Storage</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The church logo is stored permanently on the server filesystem at <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono">/public/images/hop_logo_transparent.png</code>
              </p>
            </div>

            {images.primaryLogo.startsWith('data:') && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                <span>Custom Logo Active</span>
              </span>
            )}
          </div>

          {logoStatusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{logoStatusMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {/* Live Logo Preview against dark background */}
            <div className="w-36 h-36 bg-blue-950 rounded-2xl flex items-center justify-center p-3 shadow-inner shrink-0 border-2 border-amber-400/40">
              <ChurchImage
                imageKey="primaryLogo"
                alt="Active Church Logo"
                className="max-h-28 w-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                priority={true}
              />
            </div>

            <div className="space-y-3 flex-1 text-xs">
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Transparent Church Emblem
                </p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  The original circular emblem is displayed with 100% genuine transparency. Uploading a new file automatically cleans external white borders and writes the file directly to server disk.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / Replace Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSaveCurrentLogoPermanently}
                  disabled={isSavingPermanent}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingPermanent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <HardDrive className="w-3.5 h-3.5" />
                  )}
                  <span>Save Permanently to Server</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-100 pb-2">
            3. Contact & Postal Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Address</label>
              <input
                type="text"
                value={formData.postalAddress}
                onChange={e => setFormData({ ...formData, postalAddress: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Departments Manager */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-100 pb-2">
            3. Recognized Church Departments & Ministries
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new church department (e.g. Security Unit)..."
              value={newDepartment}
              onChange={e => setNewDepartment(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-lg"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-3 py-2 bg-blue-900 text-white rounded-lg font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {formData.departments.map((dept, i) => (
              <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="font-medium text-slate-800 truncate pr-2">{dept}</span>
                {dept !== 'None / General Congregation' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
