import React from 'react';
import { ChurchImage } from '../common/ChurchImage';
import { NavBarControls } from '../common/NavBarControls';
import { BookOpen, Shield, MapPin, Sparkles, Phone, Mail, Clock, Info, Image as ImageIcon, Flame, Heart, CheckCircle2 } from 'lucide-react';
import { useChurchData } from '../../context/ChurchDataContext';
import { NATURE_ASSETS, LION_BACKGROUND } from '../../constants/natureThemes';

interface HomePageProps {
  onOpenRecordBook: () => void;
  onOpenAdmin: () => void;
  onOpenArchitectureModal: () => void;
  onOpenAssetModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenRecordBook,
  onOpenAdmin,
  onOpenArchitectureModal,
  onOpenAssetModal,
}) => {
  const { branchSettings } = useChurchData();

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between text-slate-800 relative z-10">
      {/* Top Prestigious Header Bar with Navigation Controls */}
      <header className="bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-blue-950/95 backdrop-blur-md text-white border-b-2 border-amber-500/40 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Header Logo - Displayed directly with object-contain, NO circular frame or artificial background */}
            <div className="h-10 sm:h-12 w-auto flex items-center justify-center shrink-0 bg-transparent">
              <ChurchImage
                imageKey="primaryLogo"
                alt="House of Power Church Logo"
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
                priority={true}
              />
            </div>

            <div>
              <span className="font-serif font-black text-xs sm:text-sm tracking-wide text-amber-300 block uppercase leading-tight">
                HOUSE OF POWER
              </span>
              <span className="text-[10px] text-blue-200 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Mankessim, Central Region, Ghana</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Functional Backward and Forward Navigation Buttons */}
            <NavBarControls variant="dark" showHome={false} />

            <button
              onClick={onOpenAssetModal}
              className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 bg-blue-900/90 hover:bg-blue-800 px-3 py-1.5 rounded-lg border border-amber-400/40 transition-all shadow-2xs"
              title="Verify or load original church media files"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-semibold">Media Assets</span>
            </button>

            <button
              onClick={onOpenArchitectureModal}
              className="inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white bg-blue-900/50 hover:bg-blue-800 px-3 py-1.5 rounded-lg border border-blue-700/60 transition-all shadow-2xs"
              title="View system deployment and database architecture"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Architecture</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section blending seamlessly with Majestic Eagle Background */}
      <section className="relative overflow-hidden text-white py-8 sm:py-12">
        {/* Subtle Dark Blue Overlay for absolute clarity and contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/75 via-blue-900/60 to-slate-950/80" />

        <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
          {/* THE FIRST IMAGE AT THE TOP: DISPLAYED DIRECTLY AS ORIGINAL IMAGE WITHOUT ANY CIRCLE, FRAME, OR DECORATIVE SHAPE */}
          <div className="max-w-[260px] sm:max-w-[320px] max-h-48 sm:max-h-56 mx-auto mb-6 flex items-center justify-center bg-transparent">
            <ChurchImage
              imageKey="primaryLogo"
              alt="House of Power Ministry International Church Logo"
              className="max-h-44 sm:max-h-52 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
              showFallbackUploadPrompt={true}
              priority={true}
            />
          </div>

          {/* Church Official Name */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-tight leading-tight uppercase max-w-4xl mx-auto drop-shadow-md">
            HOUSE OF POWER OF MINISTRY INTERNATIONAL CHURCH
          </h1>

          {/* Location Badge */}
          <div className="mt-3.5 flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900/60 border border-amber-400/50 rounded-full text-amber-300 font-serif font-black text-xs sm:text-sm tracking-widest uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>MANKESSIM, GHANA</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          {/* Slogan */}
          <p className="mt-3 text-amber-300 font-serif italic text-lg sm:text-xl font-bold tracking-wide drop-shadow-xs">
            “Heaven Oo!!! Ɛho ɛna Yɛpɛ”
          </p>

          <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl mx-auto font-normal">
            Official Attendance & Membership Management System
          </p>

          {/* THE EXACT TWO MAIN NAVIGATION BUTTONS AS MANDATED */}
          <div className="max-w-2xl mx-auto w-full mt-8 sm:mt-12">
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-amber-400/60 text-slate-800">
              <div className="text-center mb-6">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Duty Stations
                </span>
                <h2 className="text-lg sm:text-xl font-serif font-extrabold text-blue-950 mt-2">
                  Select Your Authorized Section
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Touch-friendly navigation designed for Android phones and computers
                </p>
              </div>

              {/* THE TWO BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* BUTTON 1: RECORD BOOK */}
                <button
                  type="button"
                  onClick={onOpenRecordBook}
                  className="group relative flex flex-col items-center text-center p-6 bg-gradient-to-b from-blue-900 via-blue-950 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-amber-400/70 focus:outline-none focus:ring-4 focus:ring-blue-600/40 active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-amber-200 flex items-center justify-center text-blue-950 mb-3.5 group-hover:scale-105 transition-transform shadow-md">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <span className="font-serif font-black text-xl tracking-wider text-amber-300 uppercase">
                    RECORD BOOK
                  </span>
                  <span className="text-xs text-blue-200 mt-1.5 font-normal leading-relaxed">
                    Sunday Attendance Roster, Member Registration & Roll Call
                  </span>
                  <span className="mt-4 text-[11px] font-bold text-amber-200 bg-blue-900/90 px-3.5 py-1.5 rounded-full border border-amber-400/50 shadow-xs flex items-center gap-1">
                    <span>Open Record Book</span>
                    <span>→</span>
                  </span>
                </button>

                {/* BUTTON 2: ADMIN */}
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="group relative flex flex-col items-center text-center p-6 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-amber-300/80 focus:outline-none focus:ring-4 focus:ring-amber-500/40 active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-950 border-2 border-amber-300 flex items-center justify-center text-amber-300 mb-3.5 group-hover:scale-105 transition-transform shadow-md">
                    <Shield className="w-8 h-8" />
                  </div>
                  <span className="font-serif font-black text-xl tracking-wider text-white uppercase">
                    ADMIN
                  </span>
                  <span className="text-xs text-amber-100 mt-1.5 font-normal leading-relaxed">
                    Administrator Login, Analytics, Settings & Backup
                  </span>
                  <span className="mt-4 text-[11px] font-bold text-blue-950 bg-amber-300 hover:bg-amber-200 px-3.5 py-1.5 rounded-full border border-amber-100 shadow-xs flex items-center gap-1">
                    <span>ADMIN LOGIN</span>
                    <span>→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Official Church Imagery Showcase */}
        {/* Official Church Imagery Showcase */}
        <div>
          <div className="text-center mb-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-blue-950/80 border border-amber-400/50 px-3.5 py-1 rounded-full shadow-sm inline-block">
              Sacred Heritage
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-2 drop-shadow-md">
              Official Pastoral & Ministry Leadership
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* IMAGE 2: Prophet Francis Kwarteng Portrait */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60 flex flex-col items-center text-center hover:shadow-2xl transition-all">
              <div className="w-36 h-36 rounded-full overflow-hidden mb-3.5 border-4 border-amber-400 shadow-md flex items-center justify-center bg-slate-100">
                <ChurchImage
                  imageKey="prophetPortrait"
                  alt="Prophet Francis Kwarteng Portrait"
                  className="w-full h-full object-cover"
                  showFallbackUploadPrompt={true}
                />
              </div>
              <h3 className="font-serif font-bold text-sm text-blue-950">
                Prophet Francis Kwarteng
              </h3>
              <p className="text-xs text-amber-700 font-bold mt-0.5 uppercase tracking-wide">
                General Overseer & Founder
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                House of Power Ministry International
              </p>
            </div>

            {/* IMAGE 3: HOP Branded Blue Banner */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60 flex flex-col items-center text-center hover:shadow-2xl transition-all">
              <div className="w-full h-36 rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-3.5 relative bg-blue-950 flex items-center justify-center">
                <ChurchImage
                  imageKey="blueBanner"
                  alt="House of Power Ministry International Branded Banner"
                  className="w-full h-full object-cover"
                  showFallbackUploadPrompt={true}
                />
              </div>
              <h3 className="font-serif font-bold text-sm text-blue-950">
                Prophetic Power & Faith
              </h3>
              <p className="text-xs text-blue-900 font-bold mt-0.5 uppercase tracking-wide">
                Mankessim Central Altar
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Weekly Breakthrough & Deliverance Services
              </p>
            </div>

            {/* IMAGE 4: Large HOP Emblem with Motto */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60 flex flex-col items-center text-center hover:shadow-2xl transition-all">
              <div className="w-36 h-36 mb-3.5 flex items-center justify-center">
                <ChurchImage
                  imageKey="mottoEmblem"
                  alt="House of Power Ministry International Church Motto Emblem"
                  className="w-full h-full object-contain"
                  showFallbackUploadPrompt={true}
                />
              </div>
              <h3 className="font-serif font-bold text-sm text-blue-950">
                The Official Church Motto
              </h3>
              <p className="text-xs text-amber-700 font-bold mt-0.5 uppercase tracking-wide">
                Heaven Oo!!! Ɛho ɛna Yɛpɛ
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Grace, Power and Holy Fellowship
              </p>
            </div>
          </div>
        </div>

        {/* Peaceful Creation & Nature Accent Gallery */}
        <div className="bg-gradient-to-r from-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  Church Foundations & Faith
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold mt-1 text-white">
                  Our Divine Pillars of Ministry
                </h3>
              </div>
              <span className="text-xs text-blue-200 font-serif italic">
                “For where two or three are gathered in my name, there am I with them.” — Matthew 18:20
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-900/40 rounded-2xl p-5 border border-amber-400/30 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white">Prophetic Deliverance</h4>
                  <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                    Experiencing the supernatural breakthrough power of God through fervent intercession and truth.
                  </p>
                </div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-4">
                  Breakthrough Altar
                </span>
              </div>

              <div className="bg-blue-900/40 rounded-2xl p-5 border border-amber-400/30 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white">Loving Fellowship</h4>
                  <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                    Nurturing every family, youth, and child in Christ through warm community fellowship in Mankessim.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mt-4">
                  Community & Care
                </span>
              </div>

              <div className="bg-blue-900/40 rounded-2xl p-5 border border-amber-400/30 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-white">Eternity Focused</h4>
                  <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                    Walking in biblical holiness and preparing hearts for the eternal Kingdom of God.
                  </p>
                </div>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-4">
                  “Heaven Oo!!! Ɛho ɛna Yɛpɛ”
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mankessim Branch Schedule Information */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/60 shadow-2xl text-center">
          <h4 className="font-serif font-bold text-base sm:text-lg text-blue-950 mb-4 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Mankessim Weekly Service Schedules</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {branchSettings.servicesSchedule.map((svc, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs hover:bg-blue-50/40 transition-colors">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider bg-amber-100/70 px-2 py-0.5 rounded">
                  {svc.day}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-2">
                  {svc.title}
                </p>
                <p className="text-xs text-slate-600 mt-1 font-mono">
                  {svc.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-gradient-to-b from-blue-950 to-slate-950 text-white border-t-2 border-amber-500/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs">
          <div className="text-center sm:text-left flex items-center gap-3">
            {/* Footer uncropped logo */}
            <div className="h-10 w-auto flex items-center justify-center shrink-0 bg-transparent">
              <ChurchImage
                imageKey="primaryLogo"
                alt="House of Power Logo"
                className="h-10 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                priority={true}
              />
            </div>
            <div>
              <p className="font-serif font-bold text-sm text-amber-300">
                House of Power Ministry International Church
              </p>
              <p className="text-blue-200 text-[11px] mt-0.5">
                Mankessim Central Branch • Central Region, Ghana
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-blue-200 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              +233 24 123 4567
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              mankessim@houseofpower.org
            </span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-amber-400 font-serif italic">
            “Heaven Oo!!! Ɛho ɛna Yɛpɛ”
          </div>
        </div>
      </footer>
    </div>
  );
};
