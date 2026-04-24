import React, { useState, useEffect } from 'react';
import { analyzeOfferLetter } from '../services/geminiService';
import { OfferAnalysisResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, Upload, Loader2, CheckCircle2, XCircle, Building2, TrendingUp, FileText, AlertOctagon, Lock } from 'lucide-react';

const OfferAnalyzer: React.FC = () => {
    const { t, language, dir } = useLanguage();
    const { isPremium, setShowPaywall } = useSubscription();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<OfferAnalysisResult | null>(null);

    useEffect(() => {
        if (result) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [result]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            try {
                const data = await analyzeOfferLetter(base64Data, file.type, language);
                setResult(data);
            } catch (error) {
                console.error(error);
                alert("Failed to analyze.");
            } finally {
                setAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10" dir={dir}>
            <div className="flex items-center space-x-4 mb-2">
                <Link to="/" className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-royal-900 hover:bg-royal-50 transition shadow-sm">
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </Link>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('tool_offer')}</h1>
            </div>

            {!result && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-royal-50 to-white z-0"></div>
                    
                    <div className="relative z-10 px-6 pt-12 pb-12 text-center">
                        <div className="bg-white p-5 rounded-3xl shadow-lg shadow-royal-100/50 inline-block mb-6 border border-slate-50">
                            <FileText className="w-12 h-12 text-royal-600" strokeWidth={1.5} />
                        </div>
                        
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{t('offer_upload_title')}</h2>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                            Upload your offer letter or contract. We will analyze the salary and check for illegal clauses.
                            {!isPremium && <span className="block mt-2 font-bold text-royal-600">Upgrade to unlock detailed scoring.</span>}
                        </p>

                        <div className="max-w-xs mx-auto">
                            <input 
                                type="file" 
                                id="offer-upload" 
                                className="hidden" 
                                accept="image/*,application/pdf"
                                onChange={handleFileUpload}
                                disabled={analyzing}
                            />
                            <label 
                                htmlFor="offer-upload"
                                className={`cursor-pointer w-full flex items-center justify-center px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg group ${
                                    analyzing 
                                    ? 'bg-slate-100 text-slate-400 scale-95' 
                                    : 'bg-royal-900 text-white hover:bg-royal-800 hover:shadow-royal-900/30 hover:-translate-y-1'
                                }`}
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 w-5 h-5" />
                                        <span>Analyzing Contract...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                        <span>{t('offer_analyze_btn')}</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* 1. Main Score Card (Blurred if free) */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-royal-500 to-indigo-500"></div>
                        
                        <div className="mb-8 w-full">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{result.companyName}</h2>
                            <p className="text-slate-500 font-medium text-lg mb-4">{result.role}</p>
                            <div className="inline-flex items-center px-4 py-2 bg-royal-50 text-royal-700 rounded-xl text-sm font-bold border border-royal-100">
                                {result.salary}
                            </div>
                        </div>

                        {/* Free Users: Blur Score */}
                        <div className="relative w-48 h-48 mb-2">
                             {isPremium ? (
                                 <>
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="transparent" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 - (264 * result.trustScore) / 100} className={`${getScoreColor(result.trustScore)} transition-all duration-1000 ease-out`} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{result.trustScore}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Health Score</span>
                                    </div>
                                 </>
                             ) : (
                                 <div className="w-full h-full bg-slate-50 rounded-full flex flex-col items-center justify-center relative border-4 border-slate-100">
                                     <Lock className="w-12 h-12 text-slate-300 mb-2" />
                                     <span className="text-xs font-bold text-slate-400">Score Locked</span>
                                     <button onClick={() => setShowPaywall(true)} className="absolute inset-0 w-full h-full cursor-pointer z-10"></button>
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                <div className="p-1.5 bg-emerald-100 rounded-lg mr-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                                Green Flags
                            </h3>
                            <ul className="space-y-3">
                                {result.greenFlags.map((flag, i) => (
                                    <li key={i} className="flex items-start text-sm text-slate-600">
                                        <span className="mr-3 text-emerald-500 font-bold text-lg leading-none">•</span>
                                        <span className="leading-relaxed">{flag}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                             <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                <div className="p-1.5 bg-red-100 rounded-lg mr-2"><XCircle className="w-4 h-4 text-red-600" /></div>
                                Warning Signs
                            </h3>
                            
                            {isPremium ? (
                                result.redFlags.length > 0 ? (
                                    <ul className="space-y-3">
                                        {result.redFlags.map((flag, i) => (
                                            <li key={i} className="flex items-start text-sm text-slate-600">
                                                <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                                <span className="leading-relaxed">{flag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-6 text-slate-400 text-sm">No red flags found.</div>
                                )
                            ) : (
                                // NON-PREMIUM: Blurred Wall of Text to incite urgency
                                <div className="relative">
                                    <div className="space-y-4 blur-[3px] select-none opacity-80 pointer-events-none">
                                        <div className="flex items-start text-sm text-slate-600">
                                            <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                            Potential violation of Decree-Law No. 33 Article 6 regarding recruitment fees.
                                        </div>
                                        <div className="flex items-start text-sm text-slate-600">
                                            <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                            Ambiguous wording on "End of Service" calculation base salary.
                                        </div>
                                        <div className="flex items-start text-sm text-slate-600">
                                            <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                            Non-compete clause exceeds the 2-year legal maximum.
                                        </div>
                                        <div className="flex items-start text-sm text-slate-600">
                                            <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                            Unspecified deductions mentioned in Section 4.2.
                                        </div>
                                         <div className="flex items-start text-sm text-slate-600">
                                            <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                            Missing mandatory health insurance coverage clause.
                                        </div>
                                         <div className="flex items-start text-sm text-slate-600">
                                            <span className="mr-3 text-red-500 font-bold text-lg leading-none">•</span>
                                            Probation period extension rights are not defined clearly.
                                        </div>
                                    </div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <button onClick={() => setShowPaywall(true)} className="bg-slate-900 text-white text-sm font-bold px-6 py-3 rounded-xl flex items-center shadow-2xl hover:bg-black transition transform hover:scale-105 ring-4 ring-white">
                                            <Lock className="w-4 h-4 mr-2" /> Unlock Detailed Risk Analysis
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button onClick={() => setResult(null)} className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition shadow-sm">
                        Analyze Another Document
                    </button>
                </div>
            )}
        </div>
    );
}

export default OfferAnalyzer;