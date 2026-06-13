import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Home, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  MessageCircle, 
  Crown, 
  AlertTriangle, 
  Clock,
  Wifi,
  Battery,
  BatteryCharging,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  RefreshCw,
  Info,
  ChevronRight,
  Shield,
  Smartphone as PhoneIcon,
  HelpCircle,
  Mail,
  Zap,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useHaptic } from '../contexts/HapticContext';
import { FloatingActions } from './FloatingActions';

// Refined Logo: Shield with Gold Core
const WageGuardLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="url(#blue-gradient-layouts)" stroke="#ffffff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="11" r="3.5" fill="url(#gold-gradient-layouts)" stroke="white" strokeWidth="1" />
        <path d="M10 17L14 17" stroke="#e0e7ff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
        <defs>
            <linearGradient id="blue-gradient-layouts" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f46e5"/>
                <stop offset="1" stopColor="#312e81"/>
            </linearGradient>
             <linearGradient id="gold-gradient-layouts" x1="12" y1="7.5" x2="12" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fcd34d"/>
                <stop offset="1" stopColor="#d97706"/>
            </linearGradient>
        </defs>
    </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { isPremium, isExpired, daysRemaining, setShowPaywall } = useSubscription();

  // Mobile App Emulation States (For desktop viewing)
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [signalStrength, setSignalStrength] = useState<'excellent' | 'good' | 'fair' | 'none'>('excellent');
  const { soundEnabled, setSoundEnabled, triggerHaptic: playHapticSound } = useHaptic();
  const [currentTime, setCurrentTime] = useState<string>("12:00");
  const [pushNotification, setPushNotification] = useState<{ show: boolean; text: string; link: string } | null>(null);
  const [showLowBatteryAlert, setShowLowBatteryAlert] = useState<boolean>(false);
  const [unlockedSecret, setUnlockedSecret] = useState<boolean>(false);
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);

  const isActive = (path: string) => location.pathname === path;

  // Clock Update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setCurrentTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Low Battery popup if battery level drops to 20
  useEffect(() => {
    if (batteryLevel <= 20 && !showLowBatteryAlert) {
      setShowLowBatteryAlert(true);
      playHapticSound('battery');
    }
  }, [batteryLevel]);

  // Handle simulation sound of a navigation push
  const handleNavClick = (target: string) => {
    playHapticSound('tap');
    navigate(target);
  };

  // Simulate shaking the smartphone device
  const handleShakeDevice = () => {
    setShakeTrigger(true);
    playHapticSound('warn');
    setTimeout(() => {
      setShakeTrigger(false);
      alert("📱 Feedback Received! Real-time telemetry: Device shook successfully.");
    }, 600);
  };

  // Create a customized simulated App update Push Notification
  const triggerMockNotification = () => {
    const alerts = [
      { text: "⚖️ MOHRE simulated update: Your evidence has high relevance score!", link: "/chat" },
      { text: "💎 Premium unlocked successfully? Tap to view subscriptions status.", link: "/subscription" },
      { text: "💡 Gratuity Calculation ready: Check your settlement forecast now.", link: "/gratuity" },
      { text: "⚡ WageGuard Alert: 3 company flags processed inside Dubai Multi Commodities.", link: "/rights" }
    ];
    const picked = alerts[Math.floor(Math.random() * alerts.length)];
    setPushNotification({
      show: true,
      text: picked.text,
      link: picked.link
    });
    playHapticSound('notif');

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setPushNotification(prev => prev ? { ...prev, show: false } : null);
    }, 6000);
  };

  // Action to toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => playHapticSound('tap'), 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-900 selection:bg-indigo-200" dir={dir}>
      
      {/* 1. TOP TITLE BANNER (Only for desktop screens size) */}
      <div className="hidden lg:flex w-full max-w-7xl justify-between items-center px-10 py-4 text-white border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100]">
        <div className="flex items-center space-x-3">
          <WageGuardLogo />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">WageGuard Mobile Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Dual-Skin iOS/Android App Simulator</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[11px] font-bold text-slate-400">Current Device: </span>
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => { setDeviceType('ios'); playHapticSound('success'); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${deviceType === 'ios' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              iOS (Apple)
            </button>
            <button 
              onClick={() => { setDeviceType('android'); playHapticSound('success'); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${deviceType === 'android' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Android (Material)
            </button>
          </div>
          <button 
            onClick={toggleSound}
            className={`p-2.5 rounded-full border transition-all ${soundEnabled ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC ENVIRONMENT WRAPPER */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center p-0 md:p-6 lg:p-10 gap-8 xl:gap-12 flex-grow">
        
        {/* SIDE BAR: DESKTOP SIMULATION CONTROLLER (Only on screens width > lg) */}
        <div className="hidden lg:flex flex-col w-[300px] shrink-0 space-y-5 text-white bg-slate-900/40 p-6 rounded-[2rem] border border-slate-900 backdrop-blur-xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400">Interactive Controller</span>
            <h2 className="text-xl font-black mt-1">Device Deck</h2>
          </div>

          {/* Sound, Battery, Signal Adjusters */}
          <div className="space-y-4">
            
            {/* Battery Level Simulation */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center">
                  <Battery className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Battery Level
                </span>
                <span className="text-xs font-black">{batteryLevel}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={batteryLevel} 
                onChange={(e) => {
                  setBatteryLevel(Number(e.target.value));
                  if (Number(e.target.value) === 100) {
                     playHapticSound('success');
                  }
                }}
                className="w-full accent-indigo-500 h-1 bg-slate-850 rounded-lg cursor-pointer" 
              />
              <div className="flex items-center mt-2.5 justify-between">
                <label className="text-[10px] text-slate-400 font-semibold cursor-pointer flex items-center">
                  <input 
                    type="checkbox" 
                    checked={isCharging} 
                    onChange={(e) => {
                      setIsCharging(e.target.checked);
                      if (e.target.checked) playHapticSound('charge');
                    }}
                    className="mr-2 rounded accent-indigo-500 bg-slate-800"
                  />
                  Simulate Charging Mode
                </label>
              </div>
            </div>

            {/* Signal Strength Selector */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center">
                <Wifi className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Carrier Connection
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(['excellent', 'good', 'fair', 'none'] as const).map((sig) => (
                  <button
                    key={sig}
                    onClick={() => { setSignalStrength(sig); playHapticSound('tap'); }}
                    className={`py-1 text-[9px] font-bold rounded capitalize border transition-all ${
                      signalStrength === sig 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sig === 'none' ? 'No Service' : sig}
                  </button>
                ))}
              </div>
              {signalStrength === 'none' && (
                <p className="text-[9px] text-red-400 font-semibold mt-1.5 flex items-center anim-pulse">
                  ⚠️ Simulated offline mode active.
                </p>
              )}
            </div>

            {/* Test Interactive Push Notification */}
            <button 
              onClick={triggerMockNotification}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Receive Simulated Alert</span>
            </button>

            {/* Shake Simulated Phone */}
            <button 
              onClick={handleShakeDevice}
              className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-medium rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Shake Virtual Device</span>
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-4 text-[11px] text-slate-400 leading-relaxed font-medium">
            <span className="text-amber-400 font-bold block mb-1">💡 Pro Tips:</span>
            Switch layouts side-by-side or rotate skins to view how safe-areas, and tab-vibrations dynamically calibrate to Android or iOS styles!
          </div>
        </div>

        {/* 3. SIMULATED DEVICE SHELL */}
        <div className={`relative transition-all duration-500 ${shakeTrigger ? 'animate-bounce' : ''}`}>
          
          {/* MOCK VOLUME BUTTONS AND SLIDERS */}
          <div className="hidden lg:block absolute -left-1.5 top-28 w-1.5 h-10 bg-slate-800 rounded-l.5 z-0"></div>
          <div className="hidden lg:block absolute -left-1.5 top-44 w-1.5 h-14 bg-slate-800 rounded-l.5 z-0"></div>
          <div className="hidden lg:block absolute -left-1.5 top-60 w-1.5 h-14 bg-slate-800 rounded-l.5 z-0"></div>
          <div className="hidden lg:block absolute -right-1.5 top-36 w-1.5 h-16 bg-slate-800 rounded-r.5 z-0"></div>

          {/* CHROME FRAME */}
          <div className="lg:w-[410px] lg:h-[840px] lg:rounded-[4rem] lg:border-[12px] lg:border-slate-800 lg:bg-slate-900 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden lg:flex lg:flex-col relative lg:ring-4 lg:ring-slate-900/60 w-full min-h-screen lg:min-h-0 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 transition-colors">
            
            {/* SCREEN REFLECTION/GLARE OVERLAY (Only visible on desktop) */}
            <div className="hidden lg:block pointer-events-none absolute inset-0 z-30 rounded-[3.2rem] bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12]" />

            {/* TOP DYNAMIC STATUS BAR */}
            <div className={`shrink-0 z-30 px-6 py-2 select-none flex justify-between items-center text-xs font-bold ${
              deviceType === 'ios' ? 'bg-slate-950 text-white h-11' : 'bg-slate-900 text-white h-11'
            }`}>
              
              {/* Left Side: Clock */}
              <div className="flex items-center">
                <span>{currentTime}</span>
              </div>

              {/* iOS: Centered Notch / Dynamic Island */}
              {deviceType === 'ios' ? (
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-2 h-[26px] w-[110px] bg-black rounded-full z-45 flex items-center justify-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                </div>
              ) : (
                // Android Centered Camera hole
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-3 h-[14px] w-[14px] bg-black rounded-full z-45" />
              )}

              {/* Right Side: Network signals and Battery */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* Simulated Network Signal Icon */}
                <div className="flex items-end space-x-0.5 h-3">
                  <div className={`w-[2.5px] h-[3px] rounded-sm ${signalStrength !== 'none' ? 'bg-current' : 'bg-current/20'}`} />
                  <div className={`w-[2.5px] h-[5px] rounded-sm ${(['excellent', 'good', 'fair'] as any).includes(signalStrength) ? 'bg-current' : 'bg-current/20'}`} />
                  <div className={`w-[2.5px] h-[7px] rounded-sm ${(['excellent', 'good'] as any).includes(signalStrength) ? 'bg-current' : 'bg-current/20'}`} />
                  <div className={`w-[2.5px] h-[9px] rounded-sm ${signalStrength === 'excellent' ? 'bg-current' : 'bg-current/20'}`} />
                </div>

                {/* WiFi Strength indication */}
                {signalStrength !== 'none' && <Wifi className="w-3.5 h-3.5 text-white" />}

                {/* Battery icon styling with level */}
                <span className="text-[10px] opacity-80">{batteryLevel}%</span>
                <div className="relative flex items-center">
                  {isCharging && <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse mr-0.5" />}
                  <Battery className={`w-4 h-4 ${batteryLevel <= 20 ? 'text-red-500' : 'text-white'}`} />
                </div>
              </div>
            </div>

            {/* MOCK SLIDING PUSH NOTIFICATION */}
            {pushNotification?.show && (
              <div 
                onClick={() => {
                  setPushNotification(null);
                  handleNavClick(pushNotification.link);
                }}
                className="absolute left-3 right-3 top-14 z-[200] bg-slate-900/95 backdrop-blur-xl rounded-[20px] text-white p-4 shadow-2xl border border-white/15 cursor-pointer animate-in slide-in-from-top-4 duration-500 hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="bg-indigo-600 rounded-lg p-1.5 shrink-0">
                    <WageGuardLogo />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">WageGuard Pro</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{t('now') || 'Now'}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-100 leading-normal">{pushNotification.text}</p>
                  </div>
                </div>
              </div>
            )}

            {/* MOCK LOW BATTERY ALERT POPUP */}
            {showLowBatteryAlert && (
              <div className="absolute inset-0 bg-black/60 z-[210] flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-white/95 rounded-[2rem] p-6 text-center max-w-[280px] shadow-2xl border border-slate-100 flex flex-col items-center">
                  <div className="bg-red-50 p-4 rounded-3xl text-red-600 mb-4 animate-bounce">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-slate-950 text-lg">Low Battery Simulation</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">Your device's simulated battery level is less than {batteryLevel}%. Plug in your imaginary charger or increase slider.</p>
                  <button 
                    onClick={() => { setShowLowBatteryAlert(false); playHapticSound('tap'); }}
                    className="mt-5 w-full bg-slate-900 hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition shadow-md"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* INTERNAL PHONE VIEWER (CONTENT BOX) */}
            <div className="flex-grow overflow-y-auto relative bg-slate-50/50 dark:bg-slate-950/95 flex flex-col h-full no-scrollbar transition-colors">
              
              {/* Expiration Banner - Shows before expiry */}
              {isPremium && daysRemaining <= 3 && !isExpired && (
                <div className={`${daysRemaining <= 1 ? 'bg-red-500' : 'bg-amber-500'} text-white px-4 py-2.5 flex items-center justify-between shadow-md relative z-40 animate-in slide-in-from-top-2 text-xs`}>
                    <div className="flex items-center font-bold uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                        <span>Premium Expires in {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    <button 
                        onClick={() => { playHapticSound('tap'); setShowPaywall(true); }} 
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-[10px] font-bold transition"
                    >
                        Renew Now
                    </button>
                </div>
              )}

              {/* Glass Header Header inside App */}
              <header className="glass sticky top-0 z-40 transition-all duration-300">
                <div className="px-5 py-3.5 flex items-center justify-between">
                  {/* Dynamic Interactive Home Link with sounds */}
                  <div 
                    onClick={() => handleNavClick('/')} 
                    className="flex items-center space-x-2.5 rtl:space-x-reverse cursor-pointer group"
                  >
                    <div className="group-hover:scale-105 transition-transform duration-350">
                        <WageGuardLogo />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-base font-black text-slate-905 tracking-tight leading-none flex items-center">
                        {t('app_name')}
                        <Sparkles className="w-3 h-3 text-amber-500 ml-1 fill-amber-400" />
                      </h1>
                      <span className="text-[9px] uppercase tracking-widest text-royal-650 font-bold opacity-75">
                        UAE Employment Helper
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {!isPremium ? (
                         <button 
                            onClick={() => { playHapticSound('success'); setShowPaywall(true); }}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-wage-500 to-wage-600 text-white rounded-full text-[10px] font-black shadow-md shadow-wage-500/20 hover:scale-105 transition-all"
                         >
                             <Crown className="w-3 h-3 mr-1" /> 
                             <span>{isExpired ? 'Renew' : 'Upgrade'}</span>
                         </button>
                    ) : (
                        <div className="flex items-center px-2.5 py-1 bg-royal-100 text-royal-800 rounded-full text-[9px] font-extrabold border border-royal-200">
                            <Crown className="w-2.5 h-2.5 mr-1 fill-current" /> Pro
                        </div>
                    )}
                    
                    <div 
                        onClick={() => handleNavClick('/settings')} 
                        className="p-1.5 text-slate-500 hover:text-royal-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                    >
                        <SettingsIcon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>
              </header>

              {/* Main App Content body viewport with constraints */}
              <main className="flex-grow px-4 py-5 font-sans relative z-0">
                {children}
              </main>

              {/* Bottom Spacer specifically for mobile viewport scrollings */}
              <div className="h-28"></div>
            </div>

            {/* MOCK BOTTOM SYSTEM GESTURES OVERLAY */}
            <div className={`shrink-0 z-40 relative flex items-center justify-center ${
              deviceType === 'ios' ? 'bg-slate-950 h-9' : 'bg-slate-900 h-11'
            }`}>
              {deviceType === 'ios' ? (
                // iOS Home indicator line
                <div 
                  onClick={() => {
                    playHapticSound('tap');
                    navigate('/');
                  }}
                  className="w-32 h-1.5 bg-white/70 rounded-full cursor-pointer hover:bg-white transition-colors"
                  title="iOS Touch Indicator: Slide Home"
                />
              ) : (
                // Android standard capacitive bar
                <div className="flex justify-around items-center w-full max-w-xs text-white/60">
                  <button 
                    onClick={() => { playHapticSound('tap'); window.history.back(); }} 
                    className="p-1.5 hover:text-white transition"
                    title="Simulate Back"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button 
                    onClick={() => { playHapticSound('tap'); navigate('/'); }} 
                    className="p-1.5 hover:text-white transition"
                    title="Simulate Home"
                  >
                    <svg className="w-4.5 h-4.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="12" cy="12" r="6" /></svg>
                  </button>
                  <button 
                    onClick={() => { playHapticSound('tap'); navigate('/settings'); }} 
                    className="p-1.5 hover:text-white transition"
                    title="Simulate Settings Matrix"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* NATIVE BOTTOM NAVIGATION NAVIGATION WITH HAPTICS */}
            <nav className="absolute bottom-11 left-0 right-0 z-40 px-3 pointer-events-none">
              <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-white/85 dark:bg-slate-900/90 shadow-2xl border border-white/40 dark:border-slate-800/80 rounded-2xl flex justify-between items-center py-2 px-5 backdrop-blur-md">
                  
                  <div onClick={() => handleNavClick('/')} className="group flex flex-col items-center cursor-pointer">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/') ? 'bg-royal-50/80 text-royal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                       <Home className={`w-5.5 h-5.5 transition-transform duration-300 ${isActive('/') ? 'scale-110' : ''}`} strokeWidth={isActive('/') ? 2.5 : 2} />
                    </div>
                  </div>

                  <div onClick={() => handleNavClick('/rights')} className="group flex flex-col items-center cursor-pointer">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/rights') ? 'bg-royal-50/80 text-royal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                       <CheckCircle2 className={`w-5.5 h-5.5 transition-transform duration-300 ${isActive('/rights') ? 'scale-110' : ''}`} strokeWidth={isActive('/rights') ? 2.5 : 2} />
                    </div>
                  </div>

                  {/* High prominent mobile floating button layout */}
                  <div onClick={() => handleNavClick('/new')} className="flex flex-col items-center justify-center -mt-9 mx-1 group cursor-pointer">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-3 rounded-full shadow-lg shadow-indigo-650/40 group-hover:scale-105 active:scale-95 transition-all duration-300 border-[4px] border-slate-50 relative overflow-hidden">
                      <Plus className="w-5.5 h-5.5 relative z-10" strokeWidth={3} />
                    </div>
                  </div>

                  <div onClick={() => handleNavClick('/knowledge')} className="group flex flex-col items-center cursor-pointer">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/knowledge') ? 'bg-royal-50/80 text-royal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                       <BookOpen className={`w-5.5 h-5.5 transition-transform duration-300 ${isActive('/knowledge') ? 'scale-110' : ''}`} strokeWidth={isActive('/knowledge') ? 2.5 : 2} />
                    </div>
                  </div>
                  
                  <div onClick={() => handleNavClick('/chat')} className="group flex flex-col items-center cursor-pointer">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/chat') ? 'bg-royal-50/80 text-royal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                       <MessageCircle className={`w-5.5 h-5.5 transition-transform duration-300 ${isActive('/chat') ? 'scale-110' : ''}`} strokeWidth={isActive('/chat') ? 2.5 : 2} />
                    </div>
                  </div>

                </div>
              </div>
            </nav>
            
            {/* PERSISTENT FLOATING QUICK ACTION BUTTON SPEED DIAL */}
            <FloatingActions />
            
          </div>
        </div>

        {/* INFO STATS PANEL: APP SPECIFICATION (Visible on desktop view screens) */}
        <div className="hidden xl:flex flex-col w-[300px] shrink-0 space-y-5 text-white bg-slate-900/40 p-6 rounded-[2rem] border border-slate-900 backdrop-blur-xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400">Environment Spec</span>
            <h2 className="text-xl font-black mt-1">WageGuard PWA</h2>
          </div>

          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-semibold">Native Interface</span>
              <span className="text-white font-bold bg-slate-800 px-2.5 py-0.5 rounded-full capitalize">{deviceType} Mode</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-semibold">Haptic Feedback</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" /> Live Synth
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-semibold">Engine Status</span>
              <span className="text-emerald-400 font-bold flex items-center">
                Online (1.0.4)
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-450 font-semibold">Premium Code status</span>
              <span className="text-amber-400 font-extrabold flex items-center">
                 Ziina Direct link
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">Device Features active:</span>
            <ul className="text-[10px] text-slate-400 space-y-1 font-medium list-disc pl-3">
              <li>Low Latency Web Audio Synth</li>
              <li>iOS Notch Dynamic Island / Pixel cutout layout styling</li>
              <li>Functional iOS battery warning box trigger (Slider &lt; 20%)</li>
              <li>Elastic touch bottom indicators</li>
              <li>Clickable sliding notifications support</li>
            </ul>
          </div>

          <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-900/30 flex items-center space-x-3 text-indigo-200">
             <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
             <p className="text-[10px] leading-relaxed">WageGuard employs native device encryption standard under localStorage storage block structure.</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Layout;