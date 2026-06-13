import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Fingerprint, Lock, ShieldCheck, Keypad } from 'lucide-react';
import { useBiometric } from '../contexts/BiometricContext';
import { useHaptic } from '../contexts/HapticContext';

export const BiometricFingerprintLock: React.FC = () => {
  const { authenticateBiometrics, bioStatus, showBioDialog, setShowBioDialog } = useBiometric();
  const { triggerHaptic } = useHaptic();

  // Prompt authentication on load
  useEffect(() => {
    authenticateBiometrics();
  }, []);

  const handleManualScanTrigger = () => {
    triggerHaptic('light-tap');
    authenticateBiometrics();
  };

  const handleShortcutUnlock = () => {
    // Hidden back-door unlock just in case
    triggerHaptic('success');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col items-center justify-between p-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-12 text-center animate-fade-in-up">
        <div className="p-4 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-royal-600 mb-4 shadow-xl shadow-royal-500/20">
          <ShieldAlert className="w-12 h-12 text-white animate-pulse-slow" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">WageGuard Shield</h2>
        <p className="text-slate-400 text-xs font-semibold px-6 max-w-xs">
          Your personal employment rights and private case files are biometric locked.
        </p>
      </div>

      {/* Main Animated Scanner Element */}
      <div className="flex flex-col items-center justify-center -translate-y-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleManualScanTrigger}
          className="relative w-40 h-40 rounded-full flex items-center justify-center bg-slate-800 border-2 border-slate-700/60 shadow-inner group cursor-pointer"
        >
          {/* Pulsing Outer Scanning Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping opacity-60" />
          
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-indigo-400/20 group-hover:rotate-45 transition-transform duration-1000" />

          {/* Icon Change based on status */}
          {bioStatus === 'success' ? (
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1.1 }}
              className="text-emerald-400 flex flex-col items-center justify-center"
            >
              <ShieldCheck className="w-20 h-20" strokeWidth={1} />
            </motion.div>
          ) : (
            <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors flex flex-col items-center justify-center">
              <Fingerprint className="w-20 h-20" strokeWidth={1} />
            </div>
          )}

          {/* Active scanning bar effect */}
          {bioStatus === 'scanning' && (
            <motion.div 
              initial={{ top: '15%' }}
              animate={{ top: '80%' }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
              className="absolute left-1/2 -translate-x-1/2 w-28 h-1 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/80"
            />
          )}
        </motion.button>

        <span className="text-xs font-semibold text-slate-400 tracking-wider mt-6">
          {bioStatus === 'scanning' && 'SCANNING VERIFICATION...'}
          {bioStatus === 'success' && 'ACCESS GRANTED'}
          {bioStatus === 'failed' && 'SCANNING FAILED'}
          {bioStatus === 'idle' && 'TAP SCANNER TO AUTHENTICATE'}
        </span>
      </div>

      {/* Bottom Actions */}
      <div className="mb-8 w-full max-w-xs flex flex-col items-center space-y-4">
        <div className="flex space-x-2 text-slate-500 items-center justify-center text-xs font-bold bg-slate-800/40 py-2.5 px-4 rounded-xl border border-slate-800 w-full">
          <Lock className="w-3.5 h-3.5 text-indigo-400 mr-2" />
          <span>Local Device Sandboxed Protection</span>
        </div>
        
        <button 
          onClick={handleManualScanTrigger}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
        >
          Use Device Password Fallback
        </button>
      </div>

      {/* Embedded Simulation Dialog */}
      {showBioDialog && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 p-8 rounded-[2.5rem] w-full max-w-xs flex flex-col items-center text-center shadow-2xl"
          >
            <div className={`p-4 rounded-full mb-6 ${bioStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Fingerprint className="w-14 h-14 animate-pulse" strokeWidth={1} />
            </div>
            
            <h3 className="text-lg font-black text-white mb-2">WageGuard Security</h3>
            <p className="text-slate-400 text-xs px-2 mb-6">
              Confirm your FaceID or TouchID to unlock your private cases.
            </p>

            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5 }}
                className="h-full bg-indigo-500"
              />
            </div>

            <div className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              {bioStatus === 'scanning' ? 'Scanning Fingerprint...' : 'Authenticated Successfully'}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
