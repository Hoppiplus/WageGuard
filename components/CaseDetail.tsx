
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Case, RoadmapTask, TimelineEvent, EvidenceItem } from '../types';
import { generateRoadmap, analyzeEvidence } from '../services/geminiService';
import { MessageSquare, FileText, Send, PhoneCall, LayoutDashboard, ChevronLeft, CheckCircle, XCircle, Calendar, CheckSquare, Upload, Loader2, Printer, Shield, Copy, FileSignature } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { exportCaseToPDF } from '../lib/pdfExporter';
import ChatInterface from './ChatInterface';
import EvidenceAnalyzer from './EvidenceAnalyzer';
import ReplyGenerator from './ReplyGenerator';
import CallCoach from './CallCoach';
import TimelineBuilder from './TimelineBuilder';
import LetterGenerator from './LetterGenerator';

interface Props {
  cases: Case[];
  onUpdate: (c: Case) => void;
}

type Tab = 'overview' | 'timeline' | 'chat' | 'evidence' | 'reply' | 'coach' | 'letters';

const CaseDetail: React.FC<Props> = ({ cases, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const { language, t } = useLanguage();
  
  const currentCase = cases.find(c => c.id === id);

  useEffect(() => {
      // Auto-generate roadmap if missing
      if (currentCase && !currentCase.roadmap && !roadmapLoading) {
          setRoadmapLoading(true);
          generateRoadmap(currentCase).then(tasks => {
              onUpdate({ ...currentCase, roadmap: tasks });
              setRoadmapLoading(false);
          });
      }
  }, [currentCase, roadmapLoading]);

  if (!currentCase) {
    return <div className="p-12 text-center text-slate-400 font-medium">Case not found</div>;
  }

  const toggleTask = (taskId: string) => {
      if (!currentCase.roadmap) return;
      const updatedTasks = currentCase.roadmap.map(t => 
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      );
      onUpdate({ ...currentCase, roadmap: updatedTasks });
  };

  const handleTaskFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    if (!file || !currentCase.roadmap) return;

    setUploadingTaskId(taskId);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; 
      
      try {
        const analysis = await analyzeEvidence(base64Data, file.type, language);
        
        const newEvidence: EvidenceItem = {
          id: Date.now().toString(),
          type: analysis.type as any || 'Other',
          description: file.name,
          summary: analysis.summary,
          tags: [...analysis.tags, 'Roadmap Upload'],
          dateAdded: new Date().toISOString(),
          analysis: analysis.analysis
        };

        const updatedRoadmap = currentCase.roadmap!.map(t => 
            t.id === taskId ? { ...t, isCompleted: true } : t
        );

        onUpdate({
          ...currentCase,
          evidence: [newEvidence, ...currentCase.evidence],
          roadmap: updatedRoadmap
        });

      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to process document.");
      } finally {
        setUploadingTaskId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTimelineSave = (timeline: TimelineEvent[]) => {
      onUpdate({ ...currentCase, timeline });
  };

  const handlePrint = () => {
      window.print();
  }

  const handleExportPDF = () => {
      exportCaseToPDF(currentCase, t);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in-up">
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 print:shadow-none print:border-slate-800">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Case Dashboard</h2>
                    <span className="text-[10px] text-slate-400 font-mono">#{currentCase.id.substring(0,8)}</span>
                 </div>
                 <div className={`px-3 py-1 rounded-full text-xs font-bold print:border print:border-slate-800 ${
                    currentCase.stage === 'Closed' ? 'bg-slate-100 text-slate-500' : 'bg-royal-50 text-royal-700'
                 }`}>
                    {currentCase.stage}
                 </div>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 print:bg-white print:border-0 print:p-0">
                <p className="text-slate-700 leading-relaxed text-sm font-medium">
                    {currentCase.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Jurisdiction</span>
                    <span className="font-bold text-slate-900" title={currentCase.freezone}>
                        {currentCase.employerType === 'Freezone' && currentCase.freezone 
                            ? currentCase.freezone.split('(')[0].trim() 
                            : currentCase.employerType}
                    </span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Main Issue</span>
                    <span className="font-bold text-slate-900 truncate">{currentCase.issueTypes[0]}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Risk</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md inline-block w-fit text-xs ${
                        currentCase.riskLevel === 'High' ? 'bg-red-50 text-red-600' : 
                        currentCase.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                        {currentCase.riskLevel}
                    </span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Created</span>
                    <span className="font-bold text-slate-900">{new Date(currentCase.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>

             {/* Strategic Questions (Saved) */}
             {currentCase.strategicQuestions && currentCase.strategicQuestions.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-sm print:hidden">
                    <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" /> Questions to Ask Employer
                    </h4>
                    <div className="space-y-3">
                        {currentCase.strategicQuestions.map((q, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-indigo-100 flex items-start justify-between">
                                <p className="text-sm text-slate-800 font-medium">{q}</p>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(q)}
                                    className="ml-3 text-slate-300 hover:text-indigo-600 transition"
                                    title="Copy"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
             )}

            {/* Roadmap Widget - Hide in print */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-royal-600" /> Case Roadmap
                    </h3>
                    <span className="text-xs text-slate-400">
                        {currentCase.roadmap?.filter(t => t.isCompleted).length || 0} / {currentCase.roadmap?.length || 0}
                    </span>
                </div>
                {currentCase.roadmap ? (
                    <div className="space-y-3">
                        {currentCase.roadmap.map(task => (
                            <div 
                                key={task.id}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between ${
                                    task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-royal-400'
                                }`}
                            >
                                <div className="flex items-start md:items-center flex-grow cursor-pointer" onClick={() => toggleTask(task.id)}>
                                    <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center flex-shrink-0 transition ${
                                        task.isCompleted ? 'bg-royal-600 border-royal-600' : 'border-slate-300'
                                    }`}>
                                        {task.isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                                    </div>
                                </div>
                                
                                {task.category === 'Document' && !task.isCompleted && (
                                    <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                                        <input 
                                            type="file" 
                                            id={`upload-${task.id}`}
                                            className="hidden" 
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleTaskFileUpload(e, task.id)}
                                            disabled={!!uploadingTaskId}
                                        />
                                        <label 
                                            htmlFor={`upload-${task.id}`}
                                            className={`flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                                                uploadingTaskId === task.id 
                                                ? 'bg-slate-100 text-slate-400' 
                                                : 'bg-royal-50 text-royal-700 hover:bg-royal-100 border border-royal-200'
                                            }`}
                                        >
                                            {uploadingTaskId === task.id ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-3 h-3 mr-1" /> Upload Doc
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                   <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl">Generatng Roadmap...</div>
                )}
            </div>
            
            {/* Timeline for Print */}
            {currentCase.timeline && currentCase.timeline.length > 0 && (
                <div className="hidden print:block mt-6">
                    <h3 className="font-bold border-b border-slate-900 mb-4 pb-2">Timeline of Events</h3>
                    <div className="space-y-4">
                        {currentCase.timeline.map((event, i) => (
                            <div key={i} className="flex">
                                <div className="w-24 font-bold text-sm">{event.date}</div>
                                <div>
                                    <div className="font-bold text-sm">{event.title}</div>
                                    <div className="text-sm">{event.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actionable Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:mt-6">
               {currentCase.actionableDos && currentCase.actionableDos.length > 0 && (
                   <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm print:border-slate-300">
                       <h3 className="font-bold text-emerald-700 mb-4 flex items-center text-sm uppercase tracking-wide print:text-black">
                           <CheckCircle className="w-5 h-5 mr-2" /> Recommended Actions
                       </h3>
                       <ul className="space-y-3">
                           {currentCase.actionableDos.map((item, i) => (
                               <li key={i} className="text-sm text-slate-700 flex items-start">
                                   <span className="mr-2 text-emerald-500 font-bold print:hidden">•</span> {item}
                               </li>
                           ))}
                       </ul>
                   </div>
               )}
               
               {currentCase.actionableDonts && currentCase.actionableDonts.length > 0 && (
                   <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm print:hidden">
                       <h3 className="font-bold text-red-700 mb-4 flex items-center text-sm uppercase tracking-wide">
                           <XCircle className="w-5 h-5 mr-2" /> What To Avoid
                       </h3>
                       <ul className="space-y-3">
                           {currentCase.actionableDonts.map((item, i) => (
                               <li key={i} className="text-sm text-slate-700 flex items-start">
                                   <span className="mr-2 text-red-500 font-bold">•</span> {item}
                               </li>
                           ))}
                       </ul>
                   </div>
               )}
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                Generated by WageGuard. Not legal advice.
            </div>
          </div>
        );
      case 'timeline':
          return <TimelineBuilder currentCase={currentCase} onSave={handleTimelineSave} />;
      case 'chat':
        return <ChatInterface currentCase={currentCase} onUpdate={onUpdate} />;
      case 'evidence':
        return <EvidenceAnalyzer currentCase={currentCase} onUpdate={onUpdate} />;
      case 'reply':
        return <ReplyGenerator currentCase={currentCase} />;
      case 'coach':
        return <CallCoach currentCase={currentCase} />;
      case 'letters':
        return <LetterGenerator currentCase={currentCase} />;
      default:
        return null;
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'letters', label: 'Letters', icon: FileSignature },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'reply', label: 'Reply Gen', icon: Send },
    { id: 'coach', label: 'Call Prep', icon: PhoneCall },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 print:hidden">
        <div className="flex items-center space-x-4">
            <Link to="/" className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-royal-900 hover:bg-royal-50 transition shadow-sm">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{currentCase.title}</h1>
            <div className="flex space-x-2 text-xs text-slate-500 font-medium mt-1">
                <span>{currentCase.issueTypes.join(', ')}</span>
            </div>
            </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
              onClick={handleExportPDF}
              className="flex items-center text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
              <FileText className="w-4 h-4 mr-1.5" />
              <span>Export PDF</span>
          </button>
          
          <button 
              onClick={handlePrint}
              className="flex items-center text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-50"
          >
              <Printer className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">{t('print_report')}</span>
          </button>
        </div>
      </div>

      {/* Print Header (Only shows on print) */}
      <div className="hidden print:flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
         <div className="flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            <h1 className="text-2xl font-bold">WageGuard Case Report</h1>
         </div>
         <div className="text-right text-sm">
             <p>{new Date().toLocaleDateString()}</p>
         </div>
      </div>

      {/* Modern Pill Tabs - Hidden on Print */}
      <div className="flex overflow-x-auto pb-4 space-x-3 no-scrollbar rtl:space-x-reverse px-1 print:hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
              activeTab === tab.id
                ? 'bg-royal-900 text-white border-royal-900 shadow-lg shadow-royal-900/20 transform scale-[1.02]'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <tab.icon className={`w-4 h-4 mr-2 rtl:ml-2 ${activeTab === tab.id ? 'text-royal-200' : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CaseDetail;
