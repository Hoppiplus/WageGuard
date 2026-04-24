import React, { useState } from 'react';
import { generateTimeline } from '../services/geminiService';
import { Case, TimelineEvent } from '../types';
import { Loader2, Calendar, Plus, Save } from 'lucide-react';

interface Props {
  currentCase: Case;
  onSave: (timeline: TimelineEvent[]) => void;
}

const TimelineBuilder: React.FC<Props> = ({ currentCase, onSave }) => {
  const [inputs, setInputs] = useState({ startDate: '', issueDate: '' });
  const [loading, setLoading] = useState(false);
  const [generatedTimeline, setGeneratedTimeline] = useState<TimelineEvent[]>(currentCase.timeline || []);
  const [isFormMode, setIsFormMode] = useState(currentCase.timeline ? false : true);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateTimeline(currentCase, inputs);
      setGeneratedTimeline(result);
      setIsFormMode(false);
      onSave(result); // Auto save
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-royal-600 mb-4" />
              <p>Building your case story...</p>
          </div>
      );
  }

  if (isFormMode) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Build Your Case Timeline</h3>
        <p className="text-sm text-slate-500 mb-6">Help us create a clear story for MOHRE or lawyers. We'll format it professionally.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">When did you join the company?</label>
            <input 
              type="date" 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-500 outline-none"
              onChange={(e) => setInputs({...inputs, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">When did the main issue start?</label>
            <input 
              type="date" 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-500 outline-none"
              onChange={(e) => setInputs({...inputs, issueDate: e.target.value})}
            />
          </div>
          <button 
            onClick={handleGenerate}
            className="w-full bg-royal-600 hover:bg-royal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-royal-600/20 transition mt-4"
          >
            Generate Timeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
           <h3 className="text-lg font-bold text-slate-900">Case Timeline</h3>
           <button onClick={() => setIsFormMode(true)} className="text-sm text-royal-600 font-bold hover:underline">Edit Info</button>
       </div>

       <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
           {generatedTimeline.map((event) => (
               <div key={event.id} className="relative pl-8">
                   <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                       event.type === 'Incident' ? 'bg-red-500' :
                       event.type === 'Payment' ? 'bg-emerald-500' :
                       event.type === 'Communication' ? 'bg-blue-500' : 'bg-slate-400'
                   }`}></div>
                   <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{event.date}</span>
                       <h4 className="font-bold text-slate-800 mb-1">{event.title}</h4>
                       <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
                   </div>
               </div>
           ))}
       </div>
       
       <button className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center">
           <Save className="w-4 h-4 mr-2" /> Export as PDF (Premium)
       </button>
    </div>
  );
};

export default TimelineBuilder;