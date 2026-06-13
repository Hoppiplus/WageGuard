import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Case } from '../types';
import { ChevronRight, Trash2, Calendar, ShieldAlert, Calculator, Building2, ArrowRight, Activity, FileSearch } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BottomSheet } from './BottomSheet';

interface Props {
  cases: Case[];
  onDelete: (id: string) => void;
}

const CaseList: React.FC<Props> = ({ cases, onDelete }) => {
  const { t } = useLanguage();
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center px-4 animate-fade-in-up">
        {/* Modern Compact Empty State */}
        <div className="bg-white p-6 rounded-[1.6rem] mb-5 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden w-full max-w-sm flex flex-col items-center justify-center group">
          <div className="absolute -top-20 -right-20 w-32 h-32 bg-royal-50 rounded-full blur-2xl opacity-60"></div>
          
          <div className="bg-gradient-to-br from-royal-50 to-indigo-50 p-3 rounded-2xl flex items-center justify-center mb-3 relative z-10 shadow-inner w-12 h-12">
            <ShieldAlert className="w-6 h-6 text-royal-600 drop-shadow-sm" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-lg font-black text-slate-900 mb-2 tracking-tight relative z-10">{t('welcome')}</h2>
          <p className="text-slate-500 leading-normal text-[11px] font-semibold px-4 relative z-10">
            Your personal employment rights assistant. Start by describing your situation to check your eligibility.
          </p>
        </div>
        
        <div className="space-y-2.5 w-full max-w-xs relative z-10">
            <Link 
            to="/new" 
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-slate-900/15 hover:bg-royal-905 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center group text-xs"
            >
            {t('nav_new')} 
            <div className="bg-white/10 rounded-full p-0.5 ml-2.5 group-hover:translate-x-0.5 group-hover:bg-white/20 transition-all">
                <ChevronRight className="w-3 h-3 rtl:rotate-180" strokeWidth={3} />
            </div>
            </Link>
            
            <div className="grid grid-cols-2 gap-2">
                <Link to="/gratuity" className="group w-full block bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] hover:border-wage-200 hover:shadow-md hover:shadow-wage-100 transition-all flex flex-col items-center justify-center text-center">
                     <Calculator className="w-4.5 h-4.5 mb-1 text-wage-500 group-hover:scale-105 transition-transform" /> {t('tool_gratuity')}
                </Link>
                <Link to="/offer-check" className="group w-full block bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] hover:border-royal-200 hover:shadow-md hover:shadow-royal-100 transition-all flex flex-col items-center justify-center text-center">
                     <Building2 className="w-4.5 h-4.5 mb-1 text-royal-500 group-hover:scale-105 transition-transform" /> {t('tool_offer')}
                </Link>
            </div>
             <Link to="/contract-review" className="group w-full block bg-gradient-to-r from-amber-50 to-white border border-amber-100 text-amber-900 py-2 rounded-xl font-bold text-[11px] hover:shadow-md transition-all flex items-center justify-center text-center">
                <FileSearch className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> {t('tool_contract')} <span className="ml-1 bg-amber-200 text-[9px] px-1.5 py-0.5 rounded text-amber-800">PRO</span>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Quick Tools Section */}
      <div className="grid grid-cols-3 gap-3">
          <Link to="/gratuity" className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-wage-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full">
                <div className="bg-wage-50 p-2 rounded-xl mb-2 group-hover:bg-wage-100 transition-colors">
                    <Calculator className="w-5 h-5 text-wage-600" />
                </div>
                <h3 className="font-bold text-xs text-slate-800 tracking-wide text-center">{t('tool_gratuity')}</h3>
            </div>
          </Link>
          <Link to="/offer-check" className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-royal-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full">
                <div className="bg-royal-50 p-2 rounded-xl mb-2 group-hover:bg-royal-100 transition-colors">
                    <Building2 className="w-5 h-5 text-royal-600" />
                </div>
                <h3 className="font-bold text-xs text-slate-800 tracking-wide text-center">{t('tool_offer')}</h3>
            </div>
          </Link>
          <Link to="/contract-review" className="block group">
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full relative overflow-hidden">
                <div className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-black px-1.5 rounded-full">PRO</div>
                <div className="bg-white p-2 rounded-xl mb-2 shadow-sm">
                    <FileSearch className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-xs text-amber-900 tracking-wide text-center">{t('tool_contract')}</h3>
            </div>
          </Link>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('nav_cases')}</h2>
            <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full shadow-sm">
                {cases.length} Active
            </span>
        </div>
        
        <div className="grid gap-5">
        {cases.map((c, idx) => (
            <Link 
                to={`/case/${c.id}`} 
                key={c.id} 
                className="group block relative" 
                style={{ animationDelay: `${idx * 0.1}s` }}
            >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-royal-900/5 group-hover:-translate-y-1 overflow-hidden relative">
                
                {/* Risk Indicator Strip */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                     c.riskLevel === 'High' ? 'bg-red-500' : 
                     c.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>

                <div className="p-6 pl-8">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 mr-4">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-royal-700 transition-colors line-clamp-1 mb-1">
                                {c.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="uppercase tracking-wide">{c.employerType}</span>
                            </div>
                        </div>
                        
                        <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                            c.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                            c.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                            {c.riskLevel}
                        </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm line-clamp-2 mb-5 font-medium leading-relaxed opacity-90">
                        {c.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-3.5 h-3.5 text-royal-400" />
                            <span className={`text-xs font-bold ${
                                c.stage === 'Closed' ? 'text-slate-400' : 'text-royal-600'
                            }`}>
                                {c.stage || 'In Progress'}
                            </span>
                        </div>
                        
                        <div className="flex items-center">
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    setCaseToDelete(c.id); 
                                }}
                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mr-2 cursor-pointer relative z-10"
                                title="Delete Case"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="bg-slate-50 text-slate-400 p-2 rounded-full group-hover:bg-royal-600 group-hover:text-white transition-all duration-300 group-hover:shadow-md group-hover:shadow-royal-500/30">
                                <ArrowRight className="w-4 h-4 rtl:rotate-180" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </Link>
        ))}
        </div>
      </div>

      <BottomSheet
        isOpen={caseToDelete !== null}
        onClose={() => setCaseToDelete(null)}
        title="Confirm Case Deletion"
      >
        <div className="space-y-6 pt-2">
          <div className="flex items-start bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-400 text-left">
            <ShieldAlert className="w-6 h-6 mr-3 flex-shrink-0 text-red-600 dark:text-red-500" strokeWidth={1.5} />
            <p className="text-xs font-semibold leading-relaxed">
              This action is permanent. Your entire claim diary, strategic analysis roadmap, employer letters, and all uploaded visual evidence files will be instantly and permanently deleted from local containment. This action cannot be reversed.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2.5">
            <button
              onClick={() => {
                if (caseToDelete) {
                  onDelete(caseToDelete);
                  setCaseToDelete(null);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition duration-200 text-xs shadow-md shadow-red-500/10 cursor-pointer"
            >
              Delete Permanently
            </button>
            
            <button
              onClick={() => setCaseToDelete(null)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition duration-200 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default CaseList;