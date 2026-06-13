import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { useHaptic } from '../contexts/HapticContext';

export const FloatingActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerHaptic } = useHaptic();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Exclude rendering on pages where full flow is active
  const excludedPaths = ['/new', '/chat', '/settings', '/subscription'];
  const isExcluded = excludedPaths.includes(location.pathname);

  // Close when tapping outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isExcluded) {
    return null;
  }

  const toggleMenu = () => {
    triggerHaptic(isOpen ? 'light-tap' : 'tap');
    setIsOpen(!isOpen);
  };

  const handleAction = (path: string) => {
    triggerHaptic('success');
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute bottom-28 right-5 z-[45] flex flex-col items-end"
    >
      {/* Backdrop overlay for dimming backdrop when speed dial is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-35 pointer-events-auto rounded-[3.2rem]"
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Menu Items */}
      <div className="flex flex-col items-end space-y-3.5 mb-3.5 relative z-40">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Option 1: Start New Case Document */}
              <motion.button
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.05 }}
                onClick={() => handleAction('/new')}
                className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer"
              >
                {/* Floating Tooltip Label */}
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 tracking-wide uppercase transition-transform group-hover:scale-105 select-none">
                  New Claim Wizard
                </span>
                {/* Visual Circle button */}
                <div className="w-12 h-12 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-indigo-500/10 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-700 transition-all hover:scale-110 active:scale-95">
                  <FileText className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
              </motion.button>

              {/* Option 2: Launch Chat with AI Assistant */}
              <motion.button
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                onClick={() => handleAction('/chat')}
                className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer"
              >
                {/* Floating Tooltip Label */}
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 tracking-wide uppercase transition-transform group-hover:scale-105 select-none">
                  AI Legal Coach
                </span>
                {/* Visual Circle button */}
                <div className="w-12 h-12 bg-white dark:bg-slate-800 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-amber-500/10 dark:shadow-slate-950/40 border border-slate-100 dark:border-slate-700 transition-all hover:scale-110 active:scale-95">
                  <MessageSquare className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Trigger FAB Button */}
      <motion.button
        layout
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-royal-600 hover:from-indigo-500 hover:to-royal-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-indigo-400/20 cursor-pointer relative z-40"
        title="Quick Actions Overview"
      >
        <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        {/* Animated rotatable icon: Rotate Plus into an X / Cross when open */}
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          ) : (
            <div className="relative">
              <Plus className="w-7 h-7" strokeWidth={2.5} />
              {/* Little ambient dynamic accent indicator */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};
