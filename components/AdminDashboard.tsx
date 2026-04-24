import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, Send, Copy, Shield, CheckCircle, Smartphone, User, Mail, MessageCircle, ArrowLeft, RefreshCw, LogOut, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentService } from '../services/paymentService';
import { useSubscription } from '../contexts/SubscriptionContext';

const ADMIN_PIN = "198319";

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isPremium } = useSubscription();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    
    // Key Gen State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState(''); // NEW: Email State
    const [generatedKey, setGeneratedKey] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
        } else {
            alert("ACCESS DENIED");
            setPin('');
        }
    };

    const handleGenerate = () => {
        const seed = customerName.replace(/\s/g, '').slice(0, 4) || "USER";
        const key = PaymentService.adminGenerateKey(seed);
        setGeneratedKey(key);
    };

    const sendWhatsApp = () => {
        if (!generatedKey) return;
        const msg = `Hello ${customerName || 'there'},\n\nThank you for choosing WageGuard.\n\nHere is your Premium License Key:\n*${generatedKey}*\n\nTo activate:\n1. Open WageGuard\n2. Go to Settings > Upgrade (or wait for the popup)\n3. Click "I already have a key"\n4. Paste this code.`;
        const url = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const sendEmail = () => {
        if (!generatedKey) return;
        const subject = "Your WageGuard Premium License Key";
        const body = `Hello ${customerName || 'there'},\n\nThank you for choosing WageGuard.\n\nHere is your Premium License Key:\n${generatedKey}\n\nTo activate:\n1. Open WageGuard\n2. Go to Settings > Upgrade\n3. Click "I already have a key"\n4. Paste the code above.\n\nBest Regards,\nWageGuard Team`;
        // NEW: Uses customerEmail directly
        window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const activateCurrentDevice = async () => {
        if(window.confirm("Are you sure you want to activate PREMIUM on THIS device immediately?")) {
            // Generate a master key and auto-apply
            const key = PaymentService.adminGenerateKey("ADMN");
            await PaymentService.activateLicense(key);
            alert("Device Activated Successfully!");
            window.location.reload();
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        navigate('/settings');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
                    <div className="bg-red-500/10 p-4 rounded-full inline-block mb-6">
                        <Lock className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">RESTRICTED AREA</h2>
                    <p className="text-slate-400 text-sm mb-6">Admin Verification Required</p>
                    
                    <form onSubmit={handleLogin}>
                        <input 
                            type="password" 
                            autoFocus
                            className="w-full bg-slate-950 border border-slate-800 text-white text-center text-3xl tracking-[0.5em] p-4 rounded-2xl mb-6 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                            placeholder="••••••"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            maxLength={6}
                        />
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition">
                            UNLOCK SYSTEM
                        </button>
                    </form>
                    <button onClick={() => navigate('/')} className="mt-6 text-slate-600 text-xs font-bold hover:text-slate-400">
                        RETURN TO APP
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center">
                    <Shield className="w-6 h-6 text-emerald-500 mr-3" />
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-slate-500">Console</span></h1>
                </div>
                <button onClick={handleLogout} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">
                
                {/* Info Alert */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex items-start">
                    <Info className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-indigo-200 text-xs leading-relaxed">
                        <strong>Note:</strong> Since the app is offline/private, it cannot send automated email reminders. Users will see a warning banner <strong>inside the app 3 days before expiry</strong>.
                    </p>
                </div>

                {/* Status Card */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Current Device Status</p>
                        <p className={`text-lg font-black ${isPremium ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isPremium ? 'PREMIUM ACTIVE' : 'FREE USER'}
                        </p>
                    </div>
                    {isPremium ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <Lock className="w-8 h-8 text-slate-700" />}
                </div>

                {/* Generator Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/50">
                        <div className="flex items-center mb-2">
                            <Key className="w-5 h-5 text-indigo-400 mr-2" />
                            <h2 className="text-lg font-bold text-white">1. Generate Key</h2>
                        </div>
                        <p className="text-slate-400 text-sm">Create a code. You must SEND this code to the user.</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Customer Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-700 text-white pl-10 p-3 rounded-xl focus:border-indigo-500 outline-none"
                                    placeholder="e.g. Ali Ahmed"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone (For WhatsApp)</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="tel" 
                                    className="w-full bg-slate-950 border border-slate-700 text-white pl-10 p-3 rounded-xl focus:border-indigo-500 outline-none"
                                    placeholder="e.g. 971501234567"
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)}
                                />
                            </div>
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email (For Email Send)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    className="w-full bg-slate-950 border border-slate-700 text-white pl-10 p-3 rounded-xl focus:border-indigo-500 outline-none"
                                    placeholder="e.g. ali@example.com"
                                    value={customerEmail}
                                    onChange={e => setCustomerEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!customerName}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" /> Generate Code
                        </button>
                    </div>

                    {/* Result Area */}
                    {generatedKey && (
                        <div className="bg-indigo-900/20 border-t border-indigo-500/30 p-6 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-indigo-300 text-xs font-bold uppercase">2. Send Code to User</p>
                                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">REQUIRED</span>
                            </div>
                            
                            <div className="bg-black/40 border border-indigo-500/50 rounded-xl p-4 text-center mb-6 relative group">
                                <span className="text-2xl font-mono font-black text-white tracking-widest">{generatedKey}</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(generatedKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-white transition"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-center text-xs text-slate-500 mb-3">Send via:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={sendWhatsApp}
                                    className="bg-[#25D366] hover:bg-[#1ebc57] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center transition"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                                </button>
                                <button 
                                    onClick={sendEmail}
                                    className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center transition"
                                >
                                    <Mail className="w-4 h-4 mr-2" /> Email
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Activation */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center mb-4 text-emerald-500">
                        <Smartphone className="w-6 h-6 mr-3" />
                        <h3 className="font-bold text-white">Manual Activation</h3>
                    </div>
                    <div className="flex items-start bg-slate-800/50 p-3 rounded-xl mb-4">
                        <Info className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Only use this button if you are holding the customer's phone right now. It will unlock Premium on <strong>this specific device</strong> instantly.
                        </p>
                    </div>
                    <button 
                        onClick={activateCurrentDevice}
                        className="w-full border border-emerald-600 text-emerald-500 hover:bg-emerald-600/10 font-bold py-4 rounded-xl transition flex items-center justify-center"
                    >
                        <Unlock className="w-5 h-5 mr-2" /> Activate THIS Device
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;