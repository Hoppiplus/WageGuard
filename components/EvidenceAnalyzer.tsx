
import React, { useState } from 'react';
import { Case, EvidenceItem } from '../types';
import { analyzeEvidence } from '../services/geminiService';
import { Upload, FileText, Tag, Trash2, Loader2, AlertTriangle, CheckCircle, Info, Handshake, AlertOctagon, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  currentCase: Case;
  onUpdate: (c: Case) => void;
}

const EvidenceAnalyzer: React.FC<Props> = ({ currentCase, onUpdate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const { language, t } = useLanguage();
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove data URL prefix
      
      try {
        const analysis = await analyzeEvidence(base64Data, file.type, language);
        
        const newEvidence: EvidenceItem = {
          id: Date.now().toString(),
          type: analysis.type as any || 'Other',
          description: file.name,
          summary: analysis.summary,
          tags: analysis.tags,
          dateAdded: new Date().toISOString(),
          analysis: analysis.analysis
        };

        onUpdate({
          ...currentCase,
          evidence: [newEvidence, ...currentCase.evidence]
        });
      } catch (error) {
        alert("Failed to analyze image. Please try again.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteEvidence = (id: string) => {
    onUpdate({
        ...currentCase,
        evidence: currentCase.evidence.filter(e => e.id !== id)
    })
  }

  const renderAnalysisSection = (title: string, items: string[] | undefined, colorClass: string, icon: any) => {
      if (!items || items.length === 0) return null;
      return (
          <div className={`mt-4 rounded-xl border p-5 ${colorClass} relative overflow-hidden transition hover:shadow-sm`}>
              <div className="relative z-10">
                  <h5 className="font-extrabold text-xs uppercase tracking-widest mb-3 flex items-center opacity-90">
                      {icon} <span className="ml-2">{title}</span>
                  </h5>
                  <ul className="space-y-2">
                      {items.map((text, i) => (
                          <li key={i} className="text-sm font-semibold leading-relaxed bg-white/80 p-3 rounded-lg shadow-sm border border-black/5 flex items-start backdrop-blur-sm">
                              <span className="mr-3 mt-1.5 block w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0"></span>
                              <span>{text}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
        <input 
          type="file" 
          id="evidence-upload" 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          disabled={analyzing}
        />
        <label 
          htmlFor="evidence-upload"
          className="cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed border-royal-200 rounded-2xl bg-royal-50 hover:bg-royal-100 transition group relative overflow-hidden"
        >
          {analyzing ? (
            <div className="flex flex-col items-center relative z-10">
                <Loader2 className="w-12 h-12 text-royal-600 animate-spin mb-4" />
                <span className="text-royal-900 font-bold">Scanning Document...</span>
                <span className="text-xs text-royal-600 mt-2">Extracting threats, admissions & promises</span>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition">
                    <Upload className="w-8 h-8 text-royal-600" />
                </div>
                <span className="text-royal-900 font-bold text-lg">
                    Upload Screenshot or Document
                </span>
                <span className="text-royal-600 text-sm mt-2 opacity-80">Supports: PNG, JPG, PDF (Chats, Emails, Contracts)</span>
            </div>
          )}
        </label>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center px-1">
          <FileText className="w-5 h-5 mr-2 text-royal-600" />
          Analyzed Evidence ({currentCase.evidence.length})
        </h3>
        
        {currentCase.evidence.length === 0 && (
            <div className="text-center py-10 opacity-50 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-400 italic text-sm">No evidence uploaded yet.</p>
            </div>
        )}

        {currentCase.evidence.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition hover:shadow-lg hover:shadow-royal-900/5">
            {/* Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                     <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                         item.type === 'Communication' ? 'bg-blue-100 text-blue-700' :
                         item.type === 'Contract' ? 'bg-purple-100 text-purple-700' :
                         item.type === 'Payment Proof' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                     }`}>
                         {item.type}
                     </span>
                     <span className="text-xs text-slate-400 font-medium">{new Date(item.dateAdded).toLocaleDateString()}</span>
                </div>
                <button onClick={() => deleteEvidence(item.id)} className="text-slate-300 hover:text-red-500 transition p-1 hover:bg-red-50 rounded-full">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            <div className="p-5">
                {/* Summary */}
                <div className="mb-6">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center">
                        <Info className="w-3 h-3 mr-1" /> Document Summary
                     </h4>
                     <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{item.summary}"
                     </p>
                </div>

                {/* Analysis Grid */}
                {item.analysis && (
                    <div className="space-y-1">
                        {/* THREATS - Red */}
                        {renderAnalysisSection(
                            "Threats Detected", 
                            item.analysis.threats, 
                            "bg-red-50 border-red-200 text-red-900 ring-1 ring-red-100",
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}

                        {/* ADMISSIONS - Green */}
                        {renderAnalysisSection(
                            "Admissions of Guilt", 
                            item.analysis.admissions, 
                            "bg-emerald-50 border-emerald-200 text-emerald-900 ring-1 ring-emerald-100",
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        )}
                        
                        {/* INCONSISTENCIES - Amber */}
                        {renderAnalysisSection(
                            "Inconsistencies", 
                            item.analysis.inconsistencies, 
                            "bg-amber-50 border-amber-200 text-amber-900 ring-1 ring-amber-100",
                            <HelpCircle className="w-5 h-5 text-amber-600" />
                        )}

                        {/* RED FLAGS - Rose */}
                        {renderAnalysisSection(
                            "Red Flags / Illegal Actions", 
                            item.analysis.redFlags, 
                            "bg-rose-50 border-rose-200 text-rose-900 ring-1 ring-rose-100",
                            <AlertOctagon className="w-5 h-5 text-rose-600" />
                        )}

                        {/* PROMISES - Blue */}
                        {renderAnalysisSection(
                            "Promises to Pay", 
                            item.analysis.promises, 
                            "bg-blue-50 border-blue-200 text-blue-900 ring-1 ring-blue-100",
                            <Handshake className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                )}

                {/* Tags Footer */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-50">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center text-[10px] uppercase tracking-wide font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                      <Tag className="w-3 h-3 mr-1 opacity-50" /> {tag}
                    </span>
                  ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceAnalyzer;
