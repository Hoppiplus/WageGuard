import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ISSUE_TYPES, FREEZONES } from '../constants';
import { diagnoseCase } from '../services/geminiService';
import { Case, EmployerType, RoadmapTask } from '../types';
import { Loader2, CheckCircle, XCircle, ChevronRight, AlertCircle, Building2, HelpCircle, Phone, Globe, MessageSquare, Copy, Lock, Briefcase, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface Props {
  onSave: (c: Case) => void;
}

const NewCaseWizard: React.FC<Props> = ({ onSave }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isPremium, setShowPaywall } = useSubscription();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    employerType: 'Unknown' as EmployerType,
    freezone: '',
    issues: [] as string[],
    description: '',
    title: ''
  });

  const [aiResult, setAiResult] = useState<{
      diagnosis: string, 
      risk: 'Low' | 'Medium' | 'High', 
      dos: string[], 
      donts: string[],
      strategicQuestions?: string[],
      authorityContact?: { name: string, phone: string, email: string, portal: string },
      suggestedEmail?: { subject: string, body: string },
      roadmap?: { title: string, description: string, category: 'Document' | 'Action' | 'Official' }[]
  } | null>(null);

  const toggleIssue = (issue: string) => {
    setFormData(prev => ({
      ...prev,
      issues: prev.issues.includes(issue) 
        ? prev.issues.filter(i => i !== issue) 
        : [...prev.issues, issue]
    }));
  };

  const handleDiagnose = async () => {
    if (!formData.description) return;
    setLoading(true);
    try {
      const result = await diagnoseCase(formData.description, formData.issues, formData.employerType, formData.freezone, language);
      setAiResult(result);
      setStep(3);
    } catch (error) {
      console.error(error);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = () => {
      if (aiResult?.suggestedEmail) {
          const text = `Subject: ${aiResult.suggestedEmail.subject}\n\n${aiResult.suggestedEmail.body}`;
          navigator.clipboard.writeText(text);
          setEmailCopied(true);
          setTimeout(() => setEmailCopied(false), 2000);
      }
  }

  const handleSave = () => {
    let roadmapTasks: RoadmapTask[] = [];
    if (aiResult?.roadmap) {
        roadmapTasks = aiResult.roadmap.map((task, index) => ({
            id: generateId() + index,
            title: task.title,
            description: task.description,
            isCompleted: false,
            category: task.category
        }));
    }

    const newCase: Case = {
      id: generateId(),
      title: formData.title || `Case ${new Date().toLocaleDateString()}`,
      employerType: formData.employerType,
      freezone: formData.employerType === 'Freezone' ? formData.freezone : undefined,
      issueTypes: formData.issues,
      description: formData.description,
      aiDiagnosis: aiResult?.diagnosis,
      riskLevel: aiResult?.risk,
      actionableDos: aiResult?.dos,
      actionableDonts: aiResult?.donts,
      strategicQuestions: aiResult?.strategicQuestions,
      stage: 'Pre-complaint',
      createdAt: new Date().toISOString(),
      evidence: [],
      chatHistory: [],
      roadmap: roadmapTasks.length > 0 ? roadmapTasks : undefined
    };
    onSave(newCase);
    navigate(`/case/${newCase.id}`);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 transition-all duration-500 animate-fade-in-up">
      
      {/* Modern Stepper */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3 px-2">
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step === 1 ? "text-royal-600 scale-105" : "text-slate-400"}`}>1. Profile</span>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step === 2 ? "text-royal-600 scale-105" : "text-slate-400"}`}>2. Details</span>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${step === 3 ? "text-royal-600 scale-105" : "text-slate-400"}`}>3. Plan</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-royal-500 to-royal-600 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                style={{ width: `${(step / 3) * 100}%` }}
            />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-royal-500" />
                {t('label_employer_type')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                  { id: 'Mainland', label: 'Mainland', sub: 'MOHRE Regulated', icon: Briefcase },
                  { id: 'Freezone', label: 'Freezone', sub: 'DMCC, JAFZA, etc.', icon: Building2 },
                  { id: 'Unknown', label: 'Not Sure', sub: 'I need help', icon: HelpCircle }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({...formData, employerType: type.id as EmployerType, freezone: ''})}
                  className={`relative overflow-hidden group py-6 px-4 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                    formData.employerType === type.id 
                      ? 'bg-royal-50 border-royal-500 text-royal-900 shadow-lg shadow-royal-500/10 scale-[1.02]' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-royal-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-3 rounded-2xl mb-3 transition-colors ${formData.employerType === type.id ? 'bg-royal-200 text-royal-700' : 'bg-slate-100 text-slate-400'}`}>
                      <type.icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="font-bold text-base">{type.label}</span>
                  <span className="text-xs mt-1 opacity-70 font-medium">{type.sub}</span>
                  {formData.employerType === type.id && (
                      <div className="absolute top-3 right-3 text-royal-600 animate-scale-in">
                          <CheckCircle className="w-5 h-5 fill-royal-100" />
                      </div>
                  )}
                </button>
              ))}
            </div>

            {/* Freezone Selector */}
            {formData.employerType === 'Freezone' && (
                <div className="mt-6 animate-slide-up">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Select Authority</label>
                    <div className="relative">
                        <select
                            value={formData.freezone}
                            onChange={(e) => setFormData({...formData, freezone: e.target.value})}
                            className="w-full p-4 pr-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition font-bold appearance-none cursor-pointer hover:bg-white"
                        >
                            <option value="">Select specific Freezone...</option>
                            {FREEZONES.map(fz => <option key={fz} value={fz}>{fz}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center">
                <AlertCircle className="w-6 h-6 mr-3 text-royal-500" />
                {t('label_issues')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ISSUE_TYPES.map(issue => (
                <button
                  key={issue}
                  onClick={() => toggleIssue(issue)}
                  className={`relative text-left rtl:text-right px-5 py-4 rounded-2xl border transition-all duration-200 text-sm font-bold flex items-center justify-between group ${
                    formData.issues.includes(issue)
                      ? 'bg-royal-900 text-white border-royal-900 shadow-md transform scale-[1.01]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {issue}
                  {formData.issues.includes(issue) && <CheckCircle className="w-5 h-5 text-royal-300" />}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            disabled={formData.issues.length === 0 || (formData.employerType === 'Freezone' && !formData.freezone)}
            onClick={() => setStep(2)}
            className="w-full bg-gradient-to-r from-royal-600 to-royal-800 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl mt-4 hover:shadow-xl hover:shadow-royal-600/20 hover:scale-[1.01] transition-all active:scale-95 flex justify-center items-center text-lg"
          >
            Continue <ChevronRight className="w-6 h-6 ml-2 rtl:rotate-180" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
           <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">Give your case a title</label>
            <input 
              type="text"
              placeholder="e.g. Unpaid Salary 2 Months"
              className="w-full border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition shadow-sm font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50 focus:bg-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">{t('label_desc')}</label>
            <textarea
              className="w-full border border-slate-200 rounded-2xl p-5 h-48 focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition resize-none shadow-sm text-slate-900 placeholder:text-slate-300 leading-relaxed bg-slate-50 focus:bg-white font-medium"
              placeholder="Describe what happened..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
            <div className="flex items-start mt-4 text-xs text-slate-600 bg-royal-50 p-4 rounded-2xl border border-royal-100">
                <Info className="w-5 h-5 mr-3 text-royal-500 flex-shrink-0" />
                <span className="leading-relaxed font-medium">Tip: Include dates, specific amounts owed, and mention if you have a written contract. This helps the AI allow for a better assessment.</span>
            </div>
          </div>

          <div className="flex space-x-3">
              <button 
                onClick={() => setStep(1)}
                className="px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition"
              >
                  Back
              </button>
              <button 
                onClick={handleDiagnose}
                disabled={loading || !formData.description || !formData.title}
                className="flex-grow bg-royal-900 disabled:bg-slate-200 text-white font-bold py-5 rounded-2xl flex justify-center items-center shadow-xl shadow-royal-900/20 hover:bg-royal-800 transition-all active:scale-95 text-lg"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : t('btn_analyze')}
              </button>
          </div>
        </div>
      )}

      {step === 3 && aiResult && (
        <div className="space-y-6 animate-scale-in">
          {/* Result Header */}
          <div className={`p-6 rounded-3xl border shadow-sm flex items-start ${
            aiResult.risk === 'High' ? 'bg-red-50 border-red-100' : 
            aiResult.risk === 'Medium' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
          }`}>
            <div className={`p-3 rounded-2xl mr-4 flex-shrink-0 ${
                 aiResult.risk === 'High' ? 'bg-red-100 text-red-600' : 
                 aiResult.risk === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
                <AlertCircle className="w-6 h-6" />
            </div>
            <div>
                <h3 className={`font-extrabold text-lg mb-1 ${
                    aiResult.risk === 'High' ? 'text-red-900' : 
                    aiResult.risk === 'Medium' ? 'text-amber-900' : 'text-emerald-900'
                }`}>
                Assessment: {aiResult.risk} Risk
                </h3>
                <p className="text-slate-800 text-sm leading-relaxed font-medium opacity-90">
                {aiResult.diagnosis}
                </p>
            </div>
          </div>

          {/* Contact Authority Card */}
          {aiResult.authorityContact && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-royal-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-bold text-lg">Contact {aiResult.authorityContact.name}</h4>
                            <p className="text-xs text-slate-400 font-medium">Official Channels</p>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-xl"><Building2 className="w-5 h-5 text-white"/></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {aiResult.authorityContact.phone && (
                            <a href={`tel:${aiResult.authorityContact.phone}`} className="flex items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition text-sm font-bold border border-white/5">
                                <Phone className="w-4 h-4 mr-2" /> Call
                            </a>
                        )}
                        {aiResult.authorityContact.portal && (
                            <a href={`https://${aiResult.authorityContact.portal.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition text-sm font-bold border border-white/5">
                                <Globe className="w-4 h-4 mr-2" /> Portal
                            </a>
                        )}
                    </div>
                  </div>
              </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <h4 className="font-bold text-emerald-700 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Do This
              </h4>
              <ul className="space-y-3">
                {aiResult.dos?.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start">
                    <span className="mr-3 text-emerald-500 font-bold">•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
              <h4 className="font-bold text-red-700 mb-4 flex items-center">
                <XCircle className="w-5 h-5 mr-2" /> Avoid This
              </h4>
              <ul className="space-y-3">
                {aiResult.donts?.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start">
                    <span className="mr-3 text-red-500 font-bold">•</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-royal-900 hover:bg-royal-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-royal-900/20 transition transform active:scale-95 text-lg"
          >
            {t('btn_save_dashboard')}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewCaseWizard;