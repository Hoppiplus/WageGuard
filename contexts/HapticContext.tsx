import React, { createContext, useContext, useState, useEffect } from 'react';

type HapticType = 'tap' | 'light-tap' | 'success' | 'warn' | 'charge' | 'notif' | 'battery';

interface HapticContextType {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  triggerHaptic: (type: HapticType) => void;
}

const HapticContext = createContext<HapticContextType | undefined>(undefined);

export const HapticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem('wg_sound_enabled');
    const savedVibrate = localStorage.getItem('wg_vibration_enabled');
    if (savedSound !== null) {
      setSoundEnabledState(savedSound === 'true');
    }
    if (savedVibrate !== null) {
      setVibrationEnabledState(savedVibrate === 'true');
    }
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('wg_sound_enabled', String(enabled));
  };

  const setVibrationEnabled = (enabled: boolean) => {
    setVibrationEnabledState(enabled);
    localStorage.setItem('wg_vibration_enabled', String(enabled));
  };

  // Polyfilled synthesized Web Audio chime sounds
  const playFreq = (ctx: AudioContext, frequencies: number[], durations: number[], type: OscillatorType = 'sine', gainVal: number = 0.05) => {
    try {
      const oscList: OscillatorNode[] = [];
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + Math.max(...durations));
      gainNode.connect(ctx.destination);

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.05));
        osc.connect(gainNode);
        osc.start(ctx.currentTime + (idx * 0.05));
        osc.stop(ctx.currentTime + (idx * 0.05) + durations[idx]);
        oscList.push(osc);
      });
    } catch (e) {
      // Swallowed silently
    }
  };

  const triggerHaptic = (type: HapticType) => {
    // 1. Trigger physical vibration via navigator.vibrate if enabled
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'light-tap':
            navigator.vibrate(12);
            break;
          case 'tap':
            navigator.vibrate(30);
            break;
          case 'success':
            navigator.vibrate([15, 30, 25]);
            break;
          case 'warn':
            navigator.vibrate([70, 50, 70]);
            break;
          case 'notif':
            navigator.vibrate([20, 40, 20, 40]);
            break;
          case 'battery':
            navigator.vibrate([100, 80, 100]);
            break;
          case 'charge':
            navigator.vibrate([10, 20, 10, 20, 10]);
            break;
        }
      } catch (e) {
        // Silently fail if iframe permissions limit vibration
      }
    }

    // 2. Trigger localized low-latency simulated web audio chimes if sound is enabled
    if (soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        switch (type) {
          case 'light-tap': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(850, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
            break;
          }
          case 'tap': {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(750, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
            break;
          }
          case 'success': {
            playFreq(ctx, [523.25, 659.25, 783.99], [0.12, 0.12, 0.25], 'triangle', 0.06);
            break;
          }
          case 'warn': {
            playFreq(ctx, [180, 140], [0.15, 0.25], 'sawtooth', 0.05);
            break;
          }
          case 'charge': {
            playFreq(ctx, [440, 554, 659, 880], [0.08, 0.08, 0.08, 0.15], 'sine', 0.04);
            break;
          }
          case 'notif': {
            playFreq(ctx, [880, 1174.66], [0.2, 0.3], 'sine', 0.05);
            break;
          }
          case 'battery': {
            playFreq(ctx, [220, 220], [0.1, 0.12], 'sine', 0.06);
            break;
          }
        }
      } catch (err) {
        // Silently absorb blocked gesture contexts
      }
    }
  };

  return (
    <HapticContext.Provider value={{
      soundEnabled,
      vibrationEnabled,
      setSoundEnabled,
      setVibrationEnabled,
      triggerHaptic,
    }}>
      {children}
    </HapticContext.Provider>
  );
};

export const useHaptic = () => {
  const context = useContext(HapticContext);
  if (!context) {
    throw new Error('useHaptic must be used within a HapticProvider');
  }
  return context;
};
