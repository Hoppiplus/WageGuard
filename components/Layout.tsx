import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Plus, Home, Settings as SettingsIcon, CheckCircle2, MessageCircle, Crown, AlertTriangle, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';

// Refined Logo: Shield with Gold Core
const WageGuardLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="url(#blue-gradient)" stroke="#ffffff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="11" r="3.5" fill="url(#gold-gradient)" stroke="white" strokeWidth="1" />
        <path d="M10 17L14 17" stroke="#e0e7ff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
        <defs>
            <linearGradient id="blue-gradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f46e5"/>
                <stop offset="1" stopColor="#312e81"/>
            </linearGradient>
             <linearGradient id="gold-gradient" x1="12" y1="7.5" x2="12" y2="14.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fcd34d"/>
                <stop offset="1" stopColor="#d97706"/>
            </linearGradient>
        </defs>
    </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { t, dir } = useLanguage();
  const { isPremium, isExpired, daysRemaining, setShowPaywall } = useSubscription();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 selection:bg-royal-200 selection:text-royal-900" dir={dir}>
      
      {/* Expiration Banner - Shows 3 days before expiry */}
      {isPremium && daysRemaining <= 3 && !isExpired && (
        <div className={`${daysRemaining <= 1 ? 'bg-red-500' : 'bg-amber-500'} text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-[60] animate-in slide-in-from-top-2`}>
            <div className="flex items-center text-xs font-bold uppercase tracking-wide">
                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                <span>Premium Expires in {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}</span>
            </div>
            <button 
                onClick={() => setShowPaywall(true)} 
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition"
            >
                Renew Now
            </button>
        </div>
      )}
      
      {/* Modern Glass Header */}
      <header className="glass sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <div className="group-hover:scale-110 transition-transform duration-300">
                <WageGuardLogo />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                {t('app_name')}
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-royal-600 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                UAE Employment Helper
              </span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {!isPremium ? (
                 <button 
                    onClick={() => setShowPaywall(true)}
                    className="flex items-center px-4 py-1.5 bg-gradient-to-r from-wage-500 to-wage-600 text-white rounded-full text-xs font-bold shadow-lg shadow-wage-500/20 hover:shadow-wage-500/40 hover:scale-105 transition-all duration-300"
                 >
                     <Crown className="w-3.5 h-3.5 mr-1.5" /> 
                     <span>{isExpired ? 'Renew' : 'Upgrade'}</span>
                 </button>
            ) : (
                <div className="flex items-center px-3 py-1 bg-royal-50/80 text-royal-700 rounded-full text-[10px] font-bold border border-royal-100/50 backdrop-blur-sm">
                    <Crown className="w-3 h-3 mr-1 fill-current" /> Pro
                </div>
            )}
            
            <Link 
                to="/settings" 
                className="p-2 text-slate-400 hover:text-royal-800 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Settings"
            >
                <SettingsIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 md:px-6 relative z-0">
        {children}
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-28"></div>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-white/90 shadow-2xl shadow-royal-900/10 border border-white/50 rounded-3xl flex justify-between items-center py-3 px-6 backdrop-blur-xl ring-1 ring-slate-900/5">
            
            <Link to="/" className="group flex flex-col items-center">
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/') ? 'bg-royal-50 text-royal-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                 <Home className={`w-6 h-6 transition-transform duration-300 ${isActive('/') ? 'scale-110' : ''}`} strokeWidth={isActive('/') ? 2.5 : 2} />
              </div>
              {isActive('/') && <span className="w-1 h-1 bg-royal-600 rounded-full mt-1 animate-fade-in"></span>}
            </Link>

            <Link to="/rights" className="group flex flex-col items-center">
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/rights') ? 'bg-royal-50 text-royal-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                 <CheckCircle2 className={`w-6 h-6 transition-transform duration-300 ${isActive('/rights') ? 'scale-110' : ''}`} strokeWidth={isActive('/rights') ? 2.5 : 2} />
              </div>
              {isActive('/rights') && <span className="w-1 h-1 bg-royal-600 rounded-full mt-1 animate-fade-in"></span>}
            </Link>

            {/* Primary Action Button */}
            <Link to="/new" className="flex flex-col items-center justify-center -mt-12 mx-2 group">
              <div className="bg-gradient-to-br from-royal-600 to-royal-800 text-white p-4 rounded-full shadow-lg shadow-royal-600/30 group-hover:shadow-royal-600/50 group-hover:scale-110 group-active:scale-95 transition-all duration-300 border-[6px] border-slate-50 ring-1 ring-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-30"></div>
                <Plus className="w-7 h-7 relative z-10" strokeWidth={3} />
              </div>
            </Link>

            <Link to="/knowledge" className="group flex flex-col items-center">
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/knowledge') ? 'bg-royal-50 text-royal-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                 <BookOpen className={`w-6 h-6 transition-transform duration-300 ${isActive('/knowledge') ? 'scale-110' : ''}`} strokeWidth={isActive('/knowledge') ? 2.5 : 2} />
              </div>
               {isActive('/knowledge') && <span className="w-1 h-1 bg-royal-600 rounded-full mt-1 animate-fade-in"></span>}
            </Link>
            
            <Link to="/chat" className="group flex flex-col items-center">
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive('/chat') ? 'bg-royal-50 text-royal-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                 <MessageCircle className={`w-6 h-6 transition-transform duration-300 ${isActive('/chat') ? 'scale-110' : ''}`} strokeWidth={isActive('/chat') ? 2.5 : 2} />
              </div>
               {isActive('/chat') && <span className="w-1 h-1 bg-royal-600 rounded-full mt-1 animate-fade-in"></span>}
            </Link>

          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;