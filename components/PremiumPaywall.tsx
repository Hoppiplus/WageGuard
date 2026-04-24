import React, { useState } from 'react';
import { X, Check, Shield, Zap, Lock, Loader2, KeyRound, ExternalLink, CreditCard, ShoppingBag, User, Mail, Phone, ArrowRight, Copy, Coffee, MessageCircle, Send } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PaymentService } from '../services/paymentService';

// REPLACE THIS WITH YOUR SUPPORT EMAIL
const ADMIN_EMAIL = "Info@hoppiplus.com"; 

const PremiumPaywall: React.FC = () => {
    const { showPaywall, setShowPaywall, isExpired } = useSubscription(); 
    
    // States: 'offer' -> 'checkout' -> 'activation'
    const [view, setView] = useState<'offer' | 'checkout' | 'activation'>('offer');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Checkout Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    if (!showPaywall) return null;

    const handleCheckoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Construct Order Message
        const subject = `Order: WageGuard License for ${formData.name}`;
        const body = `Hi,\n\nI am purchasing a WageGuard License.\n\nHere are my details:\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nI am proceeding to payment via the link now. Please reply with my activation key once payment is confirmed.\n\nThanks!`;
        
        // 2. Email URL (mailto)
        const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // 3. Open Email Client
        window.location.href = mailtoUrl;
        
        // 4. Redirect to Payment after short delay (to allow email client to open)
        setTimeout(() => {
            window.open(PaymentService.getPaymentLink(), '_blank');
            setView('activation');
        }, 1500);
    };

    const handleActivate = async () => {
        if (!code) return;
        setIsLoading(true);
        setError('');
        
        // Small delay to simulate network check (improves UX)
        await new Promise(r => setTimeout(r, 800));
        
        const success = await PaymentService.activateLicense(code);
        
        if (success) {
            window.location.reload(); 
        } else {
            setError('Invalid license key. Please check the code sent to your email.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-end md:items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
                
                {/* Close Button */}
                <button 
                    onClick={() => setShowPaywall(false)}
                    className="absolute top-5 right-5 p-2 bg-black/5 hover:bg-black/10 rounded-full transition z-20"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* Hero Header */}
                <div className="bg-royal-900 text-white pt-10 pb-8 px-8 text-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-wage-50 rounded-full blur-[80px] opacity-40"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl mb-4 backdrop-blur-md border border-white/20 shadow-xl">
                            <Shield className="w-10 h-10 text-wage-400 fill-current" />
                        </div>
                        <h2 className="text-3xl font-black mb-1 tracking-tight">
                            {isExpired ? 'Renew Access' : 'WageGuard Premium'}
                        </h2>
                        <p className="text-royal-200 text-sm font-medium">
                            {isExpired ? 'Your plan has expired. Continue protecting your rights.' : 'Unlock the full power of legal AI'}
                        </p>
                    </div>
                </div>

                {/* VIEW 1: OFFER */}
                {view === 'offer' && (
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <FeatureRow text="Deep Contract Analysis & Scoring" icon={Zap} />
                            <FeatureRow text="Auto-Draft Official MOHRE Emails" icon={Zap} />
                            <FeatureRow text="Unlimited AI Legal Assistant" icon={Zap} />
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-royal-100 rounded-3xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">30-Day Pass</p>
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-black text-slate-900">20</span>
                                        <span className="text-base font-bold text-slate-900 ml-1">AED</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="bg-royal-900 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                        BEST VALUE
                                    </span>
                                </div>
                            </div>
                            
                            {/* Psychology Pricing Hook */}
                            <div className="bg-emerald-50 rounded-xl p-3 flex items-center border border-emerald-100">
                                <div className="bg-white p-1.5 rounded-full mr-3 shadow-sm">
                                    <Coffee className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs text-emerald-800 font-bold leading-tight">
                                    Costs less than a Shawarma plate. <br/>
                                    <span className="font-normal opacity-80">Invest in your legal safety today.</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => setView('checkout')}
                                className="w-full bg-gradient-to-r from-royal-700 to-royal-900 hover:from-royal-800 hover:to-black text-white font-bold py-4 rounded-2xl shadow-xl shadow-royal-900/20 transition transform active:scale-95 flex items-center justify-center"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" /> 
                                {isExpired ? 'Renew License Key' : 'Buy 1-Month License'}
                            </button>
                            <button 
                                onClick={() => setView('activation')}
                                className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 transition"
                            >
                                I already have a key
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW 2: CHECKOUT (COLLECT INFO) */}
                {view === 'checkout' && (
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                             <h3 className="font-bold text-slate-900 text-lg">Quick Checkout</h3>
                             <p className="text-xs text-slate-500 mt-1">Order details will be sent via Email.</p>
                        </div>
                        
                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-500 outline-none font-medium text-slate-900 placeholder:text-slate-400"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        required
                                        type="email" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-500 outline-none font-medium text-slate-900 placeholder:text-slate-400"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        required
                                        type="tel" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-500 outline-none font-medium text-slate-900 placeholder:text-slate-400"
                                        placeholder="+971 50 123 4567"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-start text-xs text-indigo-800">
                                <Mail className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                <span>Clicking below will open your email app to send the order, then redirect to payment.</span>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition transform active:scale-95 flex items-center justify-center mt-4"
                            >
                                Send Order & Pay <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </form>
                        
                        <button 
                            onClick={() => setView('offer')}
                            className="w-full text-slate-400 text-xs font-bold hover:text-slate-600"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* VIEW 3: ACTIVATION */}
                {view === 'activation' && (
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-lg">Payment Pending...</h3>
                            <p className="text-xs text-slate-500 mt-2">
                                1. Complete payment on Ziina.<br/>
                                2. We will reply to your email with the <strong>License Key</strong>.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Enter Key (WG-XXXX-XXXX)"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-lg outline-none focus:ring-2 focus:ring-royal-500 uppercase tracking-widest text-slate-900 placeholder:text-slate-400"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-xs text-red-500 font-bold text-center animate-pulse">{error}</p>}
                        </div>

                        <button 
                            onClick={handleActivate}
                            disabled={isLoading || !code}
                            className="w-full bg-royal-900 hover:bg-royal-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-royal-900/20 transition transform active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:scale-100"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Unlock App"}
                        </button>

                        <div className="text-center space-y-4 pt-2">
                             <button 
                                onClick={() => window.open(PaymentService.getPaymentLink(), '_blank')}
                                className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition"
                            >
                                Link didn't open? Pay Here
                            </button>
                            
                            <button 
                                onClick={() => setView('offer')}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                                Back to Start
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FeatureRow = ({ text, icon: Icon }: { text: string, icon: any }) => (
    <div className="flex items-center">
        <div className="bg-emerald-100 p-1.5 rounded-full mr-3 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
        </div>
        <span className="text-slate-700 font-bold text-sm">{text}</span>
    </div>
);

export default PremiumPaywall;