import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    Crown, 
    Calendar, 
    ShieldCheck, 
    CreditCard, 
    HelpCircle, 
    CheckCircle2, 
    AlertTriangle,
    ArrowLeft,
    Mail,
    Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionDashboard: React.FC = () => {
    const { isPremium, daysRemaining, isExpired, setShowPaywall } = useSubscription();
    const { t, dir } = useLanguage();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20" dir={dir}>
            <div className="flex items-center mb-2">
                <Link to="/settings" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-900 ml-2">Subscription Dashboard</h2>
            </div>

            {/* Current Plan Status */}
            <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                <div className={`absolute top-0 left-0 right-0 h-2 ${isPremium ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center mb-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mr-2 ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {isPremium ? 'Premium Active' : 'Free Tier'}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">
                                {isPremium ? 'WageGuard Pro' : 'Free Account'}
                            </h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${isPremium ? 'bg-amber-50' : 'bg-slate-50'}`}>
                            <Crown className={`w-8 h-8 ${isPremium ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                        </div>
                    </div>

                    {isPremium ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                                <p className="text-emerald-600 font-bold flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Normal
                                </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Expires In</p>
                                <p className="text-slate-900 font-bold flex items-center">
                                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400" /> {daysRemaining} Days
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                            <p className="text-sm text-indigo-900 font-medium italic">Upgrade to unlock all tools & AI chats.</p>
                            <button 
                                onClick={() => setShowPaywall(true)}
                                className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20"
                            >
                                Upgrade
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Feature Access List */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-indigo-600" />
                        Plan Permissions
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <FeatureItem label="Daily AI Chat Assistance" unlocked={true} plan={isPremium ? 'Unlimited' : '3 / Day'} />
                    <FeatureItem label="Basic Rights Knowledge Base" unlocked={true} plan="Standard" />
                    <FeatureItem label="Gratuity Calculator" unlocked={true} plan="Open" />
                    <FeatureItem label="Offer Letter Analyzer" unlocked={isPremium} plan={isPremium ? 'Unlocked' : 'Paywall'} />
                    <FeatureItem label="WageGuard Document Audit (PRO)" unlocked={isPremium} plan={isPremium ? 'Unlocked' : 'Paywall'} />
                    <FeatureItem label="MOHRE Email Generator" unlocked={isPremium} plan={isPremium ? 'Unlocked' : 'Paywall'} />
                </div>
            </div>

            {/* Trade License Clarification - ADDRESSING USER CONCERN */}
            <div className="bg-amber-50 rounded-[2rem] border border-amber-100 p-6 flex items-start">
               <div className="bg-white p-2 rounded-xl shadow-sm mr-4 mt-1">
                   <AlertTriangle className="w-5 h-5 text-amber-600" />
               </div>
               <div>
                   <h4 className="font-bold text-amber-900 mb-1">Trade License FAQ</h4>
                   <p className="text-xs text-amber-800 leading-relaxed font-medium">
                       <strong>Do I need a Trade License to subscribe?</strong><br/>
                       No. WageGuard is for individuals (employees). You do NOT need a UAE trade license to pay for or use this app. Payments are processed via Ziina as personal peer-to-peer transfers or personal payment links.
                   </p>
               </div>
            </div>

            {/* Support / Billing help */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <ShieldCheck className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5" />
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Billing Support</h4>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs">
                        If you have paid but your key hasn't arrived, or if you need an invoice for your records.
                    </p>
                    <a 
                        href="mailto:Info@hoppiplus.com" 
                        className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/10"
                    >
                        <Mail className="w-4 h-4 mr-2" /> Contact Admin
                    </a>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ label, unlocked, plan }: { label: string, unlocked: boolean, plan: string }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center">
            <div className={`p-1.5 rounded-full mr-3 ${unlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {unlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </div>
            <span className={`text-sm font-medium ${unlocked ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${unlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
            {plan}
        </span>
    </div>
);

export default SubscriptionDashboard;
