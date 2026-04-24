import React, { useState, useEffect } from 'react';
import { analyzeLegalContract } from '../services/geminiService';
import { ContractAnalysisResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, Upload, Loader2, FileSearch, ShieldAlert, AlertTriangle, Eye, Lock, Scale, X, CheckCircle2 } from 'lucide-react';

const ContractReview: React.FC = () => {
    const { t, language, dir } = useLanguage();
    const { isPremium, setShowPaywall } = useSubscription();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<ContractAnalysisResult | null>(null);

    useEffect(() => {
        if (result) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [result]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // PREMIUM CHECK
        if (!isPremium) {
            setShowPaywall(true);
            // Reset input
            e.target.value = ''; 
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        setAnalyzing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            try {
                const data = await analyzeLegalContract(base64Data, file.type, language);
                setResult(data);
            } catch (error) {
                console.error(error);
                alert("Failed to analyze. Ensure document is clear.");
            } finally {
                setAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const getRiskColor = (level: string) => {
        if (level === 'Safe') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
        if (level === 'Caution') return 'text-amber-500 bg-amber-50 border-amber-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10" dir={dir}>
            <div className="flex items-center space-x-4 mb-2">
                <Link to="/" className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-royal-900 hover:bg-royal-50 transition shadow-sm">
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </Link>
                <div>
                     <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">WageGuard Contract Audit</h1>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center mt-1">
                         <span className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 px-1.5 py-0.5 rounded mr-2">PREMIUM</span> 
                         WageGuard Protection Engine
                     </p>
                </div>
            </div>

            {!result && (
                <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-royal-500 rounded-full blur-[100px] opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                    
                    <div className="relative z-10 max-w-md mx-auto">
                        <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md inline-block mb-6 border border-white/10 shadow-xl">
                            <Scale className="w-12 h-12 text-amber-400" strokeWidth={1.5} />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold mb-4">WageGuard Document Scan</h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-8">
                            Don't sign blindly. Let WageGuard analyze your contract. We detect hidden penalties, illegal non-competes, and terms violating UAE Decree-Law 33.
                        </p>

                        <div className="w-full">
                            <input 
                                type="file" 
                                id="contract-upload" 
                                className="hidden" 
                                accept="image/*,application/pdf"
                                onChange={handleFileUpload}
                                disabled={analyzing}
                            />
                            <label 
                                htmlFor="contract-upload"
                                className={`cursor-pointer w-full flex items-center justify-center px-8 py-5 rounded-2xl font-bold transition-all duration-300 shadow-xl group relative overflow-hidden ${
                                    analyzing 
                                    ? 'bg-slate-800 text-slate-400' 
                                    : 'bg-white text-slate-900 hover:scale-105'
                                }`}
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="animate-spin mr-3 w-5 h-5" />
                                        <span>WageGuard is Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        {!isPremium && <Lock className="w-4 h-4 mr-2 text-amber-600" />}
                                        <FileSearch className="w-5 h-5 mr-3 group-hover:text-royal-600 transition-colors" />
                                        <span>{isPremium ? "Run WageGuard Analysis" : "Unlock WageGuard Audit"}</span>
                                    </>
                                )}
                            </label>
                            {!isPremium && (
                                <p className="mt-4 text-xs text-amber-400 font-bold opacity-80 animate-pulse">
                                    Available for Premium Users Only
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {/* RISK METER CARD */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
                         <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${
                             result.riskLevel === 'Safe' ? 'from-emerald-400 to-emerald-600' :
                             result.riskLevel === 'Caution' ? 'from-amber-400 to-amber-600' : 'from-red-500 to-red-700'
                         }`}></div>
                        
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-6 md:mb-0 text-center md:text-left">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border mb-3 inline-block ${getRiskColor(result.riskLevel)}`}>
                                    {result.riskLevel} Risk
                                </span>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">WageGuard Audit Report</h2>
                                <p className="text-slate-500 font-medium text-sm max-w-md">{result.summary}</p>
                            </div>
                            
                            {/* Score Circle */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 - (264 * result.riskScore) / 100} className={`${
                                        result.riskScore < 30 ? 'text-emerald-500' : result.riskScore < 70 ? 'text-amber-500' : 'text-red-500'
                                    } transition-all duration-1000 ease-out`} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900">{result.riskScore}</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase">Risk Score</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FLAGGED CLAUSES */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center text-lg px-2">
                            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                            Flagged Items ({result.flaggedClauses.length})
                        </h3>

                        {result.flaggedClauses.map((item, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                        item.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {item.issue}
                                    </div>
                                    {item.legalReference && (
                                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
                                            {item.legalReference}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 font-serif italic text-slate-700 text-sm leading-relaxed relative">
                                    <span className="absolute top-2 left-2 text-4xl text-slate-200 font-serif leading-none">“</span>
                                    <span className="relative z-10 px-2">{item.clauseText}</span>
                                </div>

                                <div className="flex items-start">
                                    <ShieldAlert className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${item.severity === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        <strong className="text-slate-900 block mb-1">Why this is risky:</strong>
                                        {item.explanation}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        {result.flaggedClauses.length === 0 && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h4 className="font-bold text-emerald-900">Clean Document</h4>
                                <p className="text-emerald-700 text-sm">We didn't find any obvious illegal clauses in this scan.</p>
                            </div>
                        )}
                    </div>

                    {/* MISSING PROTECTIONS */}
                    {result.missingProtections.length > 0 && (
                         <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide flex items-center">
                                <Eye className="w-4 h-4 mr-2" /> Missing Protections
                            </h3>
                            <ul className="space-y-2">
                                {result.missingProtections.map((mp, i) => (
                                    <li key={i} className="flex items-start text-sm text-slate-600">
                                        <X className="w-4 h-4 mr-2 text-slate-400 mt-0.5" />
                                        {mp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button onClick={() => setResult(null)} className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition shadow-sm">
                        Audit Another Document
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContractReview;