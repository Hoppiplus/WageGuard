import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHaptic } from './HapticContext';

interface BiometricContextType {
  isBiometricEnabled: boolean;
  isBiometricAuthenticated: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  authenticateBiometrics: () => Promise<boolean>;
  resetAuth: () => void;
  showBioDialog: boolean;
  setShowBioDialog: (show: boolean) => void;
  bioStatus: 'idle' | 'scanning' | 'success' | 'failed';
  setBioStatus: (status: 'idle' | 'scanning' | 'success' | 'failed') => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { triggerHaptic } = useHaptic();
  const [isBiometricEnabled, setIsBiometricEnabledState] = useState<boolean>(false);
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState<boolean>(false);
  
  // Dialog visual states
  const [showBioDialog, setShowBioDialog] = useState<boolean>(false);
  const [bioStatus, setBioStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('wg_biometric_enabled');
    if (saved === 'true') {
      setIsBiometricEnabledState(true);
      // App starts in locked state if enabled
      setIsBiometricAuthenticated(false);
    } else {
      setIsBiometricAuthenticated(true);
    }
  }, []);

  const setBiometricEnabled = (enabled: boolean) => {
    setIsBiometricEnabledState(enabled);
    localStorage.setItem('wg_biometric_enabled', String(enabled));
    if (!enabled) {
      setIsBiometricAuthenticated(true);
    } else {
      setIsBiometricAuthenticated(false);
    }
  };

  const resetAuth = () => {
    if (isBiometricEnabled) {
      setIsBiometricAuthenticated(false);
    }
  };

  // Triggers WebAuthn API or full-featured offline high-fidelity simulator
  const authenticateBiometrics = async (): Promise<boolean> => {
    triggerHaptic('light-tap');
    setShowBioDialog(true);
    setBioStatus('scanning');

    // 1. Attempt Real WebAuthn API if supported
    if (window.PublicKeyCredential && navigator.credentials) {
      try {
        // Run a lightweight dummy challenge response check
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        // This is safe even in sandboxed frames, if it fails we fall back beautifully to physical scanning
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 2000,
            userVerification: 'required',
            rpId: window.location.hostname,
            allowCredentials: [],
          },
          // Trigger fallback dynamically if aborted/unsupported in sandbox
          signal: AbortSignal.timeout(1000)
        });
        
        if (credential) {
          triggerHaptic('success');
          setBioStatus('success');
          setTimeout(() => {
            setIsBiometricAuthenticated(true);
            setShowBioDialog(false);
          }, 1000);
          return true;
        }
      } catch (e) {
        console.log('[Biometric] WebAuthn API restriction/absence. Launching tactile simulator fallback.', e);
      }
    }

    // 2. High-fidelity Interactive Simulation Fallback
    // Delay 1.5 seconds to simulate a gorgeous optic or touch scan
    return new Promise((resolve) => {
      setTimeout(() => {
        triggerHaptic('success');
        setBioStatus('success');
        setTimeout(() => {
          setIsBiometricAuthenticated(true);
          setShowBioDialog(false);
          resolve(true);
        }, 1000);
      }, 1800);
    });
  };

  return (
    <BiometricContext.Provider value={{
      isBiometricEnabled,
      isBiometricAuthenticated,
      setBiometricEnabled,
      authenticateBiometrics,
      resetAuth,
      showBioDialog,
      setShowBioDialog,
      bioStatus,
      setBioStatus,
    }}>
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = () => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within a BiometricProvider');
  }
  return context;
};
