import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUPPORTED_LANGUAGES } from '../translations';
import { Globe, Shield, Check, ChevronRight, Key, Copy, Unlock, Lock, AlertCircle, Crown, Clock, Eye, Sliders } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useHaptic } from '../contexts/HapticContext';
import { useTheme } from '../contexts/ThemeContext';
import { useBiometric } from '../contexts/BiometricContext';

const ADMIN_PIN = "198319"; // <--- YOUR SECRET PIN

const Settings: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { isPremium, daysRemaining, setShowPaywall } = useSubscription();
  const { soundEnabled, setSoundEnabled, vibrationEnabled, setVibrationEnabled, triggerHaptic } = useHaptic();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isBiometricEnabled, setBiometricEnabled, authenticateBiometrics } = useBiometric();
  const navigate = useNavigate();
  
  // Secret Admin Mode Logic
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [tapCount, setTapCount] = useState(0);

  const handleSecretTap = () => {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 5) {
          setShowPinInput(true);
          setTapCount(0);
      }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (pin === ADMIN_PIN) {
          setShowPinInput(false);
          setPin('');
          navigate('/admin'); // Redirect to new Dashboard
      } else {
          alert("Incorrect PIN");
          setPin('');
          setShowPinInput(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={dir}>
      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('nav_settings')}</h2>

      {/* Subscription Card */}
      <Link to="/subscription" className="block group">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-amber-200 hover:shadow-md transition-all">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center">
               <Crown className={`w-5 h-5 mr-3 rtl:ml-3 rtl:mr-0 ${isPremium ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
               <h3 className="font-bold text-slate-800">Subscription Status</h3>
            </div>
            {isPremium && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Active</span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="p-6">
              {isPremium ? (
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-slate-900 font-bold text-lg">Premium Plan</p>
                          <p className="text-slate-500 text-sm flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1.5" />
                              Expires in <strong className={`mx-1 ${daysRemaining <= 3 ? 'text-red-600' : 'text-slate-900'}`}>{daysRemaining}</strong> days
                          </p>
                      </div>
                  </div>
              ) : (
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-slate-900 font-bold text-lg">Free Plan</p>
                          <p className="text-slate-500 text-sm mt-1">Limited daily chats & tools.</p>
                      </div>
                      <div className="bg-gradient-to-r from-royal-600 to-royal-800 text-white text-xs font-bold px-4 py-3 rounded-xl hover:shadow-lg transition flex items-center">
                          <Unlock className="w-3 h-3 mr-1.5" /> Upgrade
                      </div>
                  </div>
              )}
          </div>
        </div>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
          <Globe className="w-5 h-5 text-indigo-600 mr-3 rtl:ml-3 rtl:mr-0" />
          <h3 className="font-bold text-slate-800">Language Selection</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full text-left rtl:text-right px-6 py-4 transition-colors flex justify-between items-center group ${
                language === lang.code
                  ? 'bg-slate-50'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col">
                <span className={`font-bold text-base ${language === lang.code ? 'text-slate-900' : 'text-slate-700'}`}>
                    {lang.nativeName}
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {lang.name}
                </span>
              </div>
              {language === lang.code && <Check className="w-5 h-5 text-indigo-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Touch, Sound & Display Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 rtl:ml-3 rtl:mr-0" />
          <h3 className="font-bold text-slate-800 dark:text-white">Preferences & Security</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Acoustic Playback</p>
              <p className="text-xs text-slate-400 dark:text-slate-400">Play low-latency audio chimes during taps and wizards</p>
            </div>
            <button 
              onClick={() => {
                const newVal = !soundEnabled;
                setSoundEnabled(newVal);
                if (newVal) {
                  triggerHaptic('light-tap');
                }
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Tactile Vibration</p>
              <p className="text-xs text-slate-400 dark:text-slate-400">Trigger physical micro-vibration feedback on mobile steps</p>
            </div>
            <button 
              onClick={() => {
                const newVal = !vibrationEnabled;
                setVibrationEnabled(newVal);
                if (newVal) {
                  triggerHaptic('tap');
                }
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${vibrationEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${vibrationEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Dark Theme Mode</p>
              <p className="text-xs text-slate-400 dark:text-slate-400">Render eye-safe high-contrast dark color palette</p>
            </div>
            <button 
              onClick={() => {
                triggerHaptic('tap');
                toggleDarkMode();
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Biometric Security Lock</p>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Protect legal documents and cases with FaceID or Fingerprint</p>
            </div>
            <button 
              onClick={async () => {
                const newVal = !isBiometricEnabled;
                if (newVal) {
                  const success = await authenticateBiometrics();
                  if (success) {
                    setBiometricEnabled(true);
                  }
                } else {
                  setBiometricEnabled(false);
                  triggerHaptic('tap');
                }
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isBiometricEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isBiometricEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* PIN INPUT MODAL */}
      {showPinInput && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in scale-in">
                  <h3 className="font-bold text-lg mb-4 text-center">Admin Access</h3>
                  <form onSubmit={handlePinSubmit}>
                      <input 
                        type="password" 
                        autoFocus
                        className="w-full text-center text-2xl tracking-widest p-3 border rounded-xl mb-4 bg-slate-50"
                        placeholder="PIN"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        maxLength={6}
                      />
                      <div className="flex space-x-2">
                          <button type="button" onClick={() => setShowPinInput(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                          <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold">Enter</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
          <Shield className="w-5 h-5 text-indigo-600 mr-3 rtl:ml-3 rtl:mr-0" />
          <h3 className="font-bold text-slate-800">Legal Disclaimers</h3>
        </div>
        <div className="p-6 text-sm text-slate-600 space-y-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">Terms of Use</h4>
            <p className="leading-relaxed text-slate-500">WageGuard is an automated information tool designed to assist with labor disputes. We do not provide legal representation. By using this app, you acknowledge that you are solely responsible for your actions and decisions.</p>
          </div>
          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">Data Privacy</h4>
            <p className="leading-relaxed text-slate-500">Data Privacy is our priority. Your case data is stored locally on your device. We do not share your data with third parties or employers unless you explicitly opt-in to a future cloud service.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center pb-8 space-y-2 select-none">
         <p 
            onClick={handleSecretTap}
            className="text-xs text-slate-400 cursor-default active:text-slate-600 transition-colors"
         >
            WageGuard v1.0.0 (Beta) {tapCount > 0 && tapCount < 5 && <span className="text-slate-200">({5 - tapCount})</span>}
         </p>
      </div>
    </div>
  );
};

export default Settings;