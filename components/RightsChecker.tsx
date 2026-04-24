import React, { useState } from 'react';
import { ISSUE_TYPES, FREEZONES } from '../constants';
import { getRightsInfo } from '../services/geminiService';
import { Loader2, Shield, AlertTriangle, FileText, CheckCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const RightsChecker: React.FC = () => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({ type: '', issue: '' });
  const [result, setResult] = useState<{ summary: string; prep: string[]; warnings: string[] } | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const info = await getRightsInfo(selection.type, selection.issue, language);
      setResult(info);
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatSummary = (text: string) => {
      // Split by bold syntax (**text**) to highlight key terms
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              const content = part.slice(2, -2);
              if (content.includes('AED')) return <span key={i} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold mx-0.5 border border-emerald-200">{content}</span>;
              return <strong key={i} className="font-bold text-slate-900">{content}</strong>;
          }
          return <span key={i}>{part}</span>;
      });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-br from-royal-800 to-royal-900 rounded-3xl p-8 text-white shadow-xl shadow-royal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold mb-2">Instant Rights Checker</h2>
          <p className="text-royal-100 font-medium">Get immediate answers about your situation without chatting.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">1. Where do you work?</h3>
            <div className="grid grid-cols-1 gap-3">
              {['Mainland (MOHRE)', 'Freezone'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelection({ ...selection, type }); setStep(2); }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-royal-500 hover:bg-royal-50 text-left transition font-medium text-slate-700 flex justify-between group"
                >
                  {type}
                  <ChevronRight className="text-slate-300 group-hover:text-royal-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">2. What is the main issue?</h3>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {ISSUE_TYPES.map((issue) => (
                <button
                  key={issue}
                  onClick={() => { 
                      setSelection({ ...selection, issue }); 
                      handleCheck(); // Auto submit
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-royal-500 hover:bg-royal-50 text-left transition font-medium text-slate-700 flex justify-between group"
                >
                  {issue}
                  <ChevronRight className="text-slate-300 group-hover:text-royal-500" />
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 mt-2">Back</button>
          </div>
        )}

        {step === 3 && loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-royal-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Consulting Regulations...</p>
          </div>
        )}

        {step === 3 && result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 relative overflow-hidden">
               <div className="flex items-center mb-3">
                    <div className="bg-emerald-100 p-2 rounded-full mr-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-emerald-900 text-lg">Analysis Result</h4>
               </div>
               <p className="text-slate-800 leading-relaxed font-medium">
                   {formatSummary(result.summary)}
               </p>
            </div>

            <div>
               <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                   <FileText className="w-5 h-5 mr-2 text-slate-500" /> Prepare These Documents
               </h4>
               <ul className="space-y-2">
                   {result.prep.map((item, i) => (
                       <li key={i} className="flex items-center text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                           {item}
                       </li>
                   ))}
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-red-800 mb-3 flex items-center">
                   <AlertTriangle className="w-5 h-5 mr-2" /> Critical Warnings
               </h4>
               <ul className="space-y-2">
                   {result.warnings.map((item, i) => (
                       <li key={i} className="flex items-start text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-100">
                           <span className="font-bold mr-2 text-red-500">•</span>
                           {item}
                       </li>
                   ))}
               </ul>
            </div>

            <button 
                onClick={() => { setStep(1); setResult(null); }}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
            >
                Check Another Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightsChecker;