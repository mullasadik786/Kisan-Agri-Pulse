import React, { useState, useRef } from 'react';
import { Sparkles, Heart, Volume2, VolumeX, Sliders, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import kisanPulseBg from '../assets/images/kisan_agripulse_main_1782283113360.jpg';

interface LiveWallpaperCardProps {
  isLiveWallpaper: boolean;
  setIsLiveWallpaper: (v: boolean) => void;
  wallpaperOpacity: number;
  setWallpaperOpacity: (v: number) => void;
  lang: 'en' | 'te' | 'hi';
  isDarkMode: boolean;
  wallpaperTheme: 'light' | 'dark';
  setWallpaperTheme: (t: 'light' | 'dark') => void;
}

const cardTranslations = {
  en: {
    title: "AgriPulse Mitra Wallpaper",
    subtitle: "Digital Agriculture Live Wallpaper",
    brightness: "Wallpaper Visibility / Brightness",
    active: "Live Background Active",
    low: "Soft",
    med: "Balanced",
    high: "Vivid",
    ambient: "Ambient Sound"
  },
  te: {
    title: "అగ్రిపల్స్ లైవ్ వాల్‌పేపర్",
    subtitle: "డిజిటల్ వ్యవసాయ లైవ్ బ్యాక్‌గ్రౌండ్",
    brightness: "వాల్‌పేపర్ ప్రకాశం / బ్రైట్‌నెస్",
    active: "లైవ్ బ్యాక్‌గ్రౌండ్ ఆన్",
    low: "లేత",
    med: "మధ్యస్థం",
    high: "పూర్తి",
    ambient: "అంబియంట్ సౌండ్"
  },
  hi: {
    title: "एग्रीपल्स लाइव वॉलपेपर",
    subtitle: "डिजिटल कृषि लाइव पृष्ठभूमि",
    brightness: "वॉलपेपर दृश्यता / ब्राइटनेस",
    active: "लाइव बैकग्राउंड सक्रिय",
    low: "हल्का",
    med: "संतुलित",
    high: "स्पष्ट",
    ambient: "परिवेश ध्वनि"
  }
};

export default function LiveWallpaperCard({
  isLiveWallpaper,
  setIsLiveWallpaper,
  wallpaperOpacity,
  setWallpaperOpacity,
  lang,
  isDarkMode,
  wallpaperTheme,
  setWallpaperTheme
}: LiveWallpaperCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const t = cardTranslations[lang || 'en'] || cardTranslations.en;

  const startSoundscape = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.15, ctx.currentTime);
      mainGain.connect(ctx.destination);
      
      // Create continuous peaceful synthesizers representing birds and wind
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, ctx.currentTime); // soft low note
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime); // gentle melody
      
      // LFO for swaying wind effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2; // 0.2 Hz
      lfoGain.gain.value = 50;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(mainGain);
      
      lfo.start();
      osc1.start();
      osc2.start();
      
      setIsPlayingAudio(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopSoundscape = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  return (
    <div className={`rounded-2xl border p-4 overflow-hidden relative group transition duration-300 shadow-sm hover:shadow-md ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-white border-emerald-100 text-gray-800'
    }`}>
      {/* Header Info */}
      <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
        isDarkMode ? 'border-slate-800' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-600">
            <Heart className="w-4 h-4 fill-emerald-500 stroke-emerald-600" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm">{t.title}</h3>
            <p className="text-[10px] text-gray-400 font-medium">{t.subtitle}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full flex items-center gap-1 ${
          isDarkMode 
            ? 'bg-amber-950/40 text-amber-300 border-amber-900/50' 
            : 'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          <Sparkles className="w-3 h-3 text-amber-500" /> Ambient Active
        </span>
      </div>

      {/* Main Wallpaper Preview Frame */}
      <div className="relative h-36 w-full rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950 shadow-inner mb-4">
        <div className="absolute inset-0 select-none overflow-hidden">
          <img 
            src={kisanPulseBg} 
            alt="Kisan AgriPulse Live Preview" 
            className="w-full h-full object-cover transition-all duration-300"
            style={{ filter: `brightness(${Math.max(0.4, wallpaperOpacity)})` }}
          />
        </div>

        {/* Ambient Darkened Gradient Cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 flex flex-col justify-between p-3">
          <div className="flex justify-between items-start">
            <span className="bg-rose-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
              Live Background
            </span>
            <button 
              onClick={() => isPlayingAudio ? stopSoundscape() : startSoundscape()}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide"
              title={t.ambient}
            >
              {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-white">
            <p className="font-display font-bold text-xs">కిసాన్-అగ్రిపల్స్ • Kisan-AgriPulse</p>
            <p className="text-[9px] text-slate-300 line-clamp-1">All services, one app — powering Indian farmers with digital intelligence.</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Brightness Slider */}
      <div className="space-y-3.5">
        {/* Toggle On/Off Switch */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setIsLiveWallpaper(!isLiveWallpaper)}
              className={`p-1.5 rounded-lg transition-all ${
                isLiveWallpaper 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
              }`}
            >
              {isLiveWallpaper ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <span className="text-xs font-bold">{t.active}</span>
          </label>
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
            isLiveWallpaper ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          }`}>
            {isLiveWallpaper ? "ON" : "OFF"}
          </span>
        </div>

        {/* Visibility / Brightness Slider */}
        {isLiveWallpaper && (
          <div className="space-y-2 pt-1 border-t border-dashed border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                {t.brightness}
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {Math.round(wallpaperOpacity * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={wallpaperOpacity}
                onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:bg-slate-800"
              />
            </div>

            {/* Quick Presets for visibility */}
            <div className="flex justify-between gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setWallpaperOpacity(0.15)}
                className={`flex-1 text-[10px] font-bold py-1 px-2 rounded-lg border transition ${
                  Math.abs(wallpaperOpacity - 0.15) < 0.05
                    ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold'
                    : isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.low} (15%)
              </button>
              <button
                type="button"
                onClick={() => setWallpaperOpacity(0.45)}
                className={`flex-1 text-[10px] font-bold py-1 px-2 rounded-lg border transition ${
                  Math.abs(wallpaperOpacity - 0.45) < 0.05
                    ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold'
                    : isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.med} (45%)
              </button>
              <button
                type="button"
                onClick={() => setWallpaperOpacity(0.75)}
                className={`flex-1 text-[10px] font-bold py-1 px-2 rounded-lg border transition ${
                  Math.abs(wallpaperOpacity - 0.75) < 0.05
                    ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold'
                    : isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.high} (75%)
              </button>
            </div>

            {/* Wallpaper Style / Tone Toggle (Light & Dark Adjustable Button) */}
            <div className="pt-2.5 border-t border-dashed border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                Wallpaper Theme
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setWallpaperTheme('light')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    wallpaperTheme === 'light'
                      ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-500" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setWallpaperTheme('dark')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    wallpaperTheme === 'dark'
                      ? 'bg-slate-800 text-amber-300 dark:bg-emerald-950 dark:text-emerald-300 shadow-sm font-extrabold'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3 h-3 text-emerald-500" /> Dark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
