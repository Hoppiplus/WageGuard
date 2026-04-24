import React, { useState, useRef, useEffect } from 'react';
import { Case } from '../types';
import { generateCallPrep, simulateOfficerTurn } from '../services/geminiService';
import { Phone, Users, Gavel, Loader2, PlayCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  currentCase: Case;
}

const CallCoach: React.FC<Props> = ({ currentCase }) => {
  const [mode, setMode] = useState<'script' | 'simulator'>('script');
  const [prepType, setPrepType] = useState('MOHRE Call');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Simulator State
  const [simHistory, setSimHistory] = useState<{role: string, text: string}[]>([]);
  const [simInput, setSimInput] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { language, t } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [simHistory]);

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const result = await generateCallPrep(currentCase, prepType, language);
      setScript(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = async () => {
      setMode('simulator');
      setSimLoading(true);
      setSimHistory([]);
      try {
          const firstMsg = await simulateOfficerTurn([], language);
          setSimHistory([{ role: 'officer', text: firstMsg }]);
      } finally {
          setSimLoading(false);
      }
  };

  const handleSimSend = async () => {
      if (!simInput.trim()) return;
      const userMsg = { role: 'user', text: simInput };
      const newHistory = [...simHistory, userMsg];
      setSimHistory(newHistory);
      setSimInput('');
      setSimLoading(true);
      
      try {
          const officerMsg = await simulateOfficerTurn(newHistory, language);
          setSimHistory([...newHistory, { role: 'officer', text: officerMsg }]);
      } finally {
          setSimLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setMode('script')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'script' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
              Script & Tips
          </button>
          <button 
            onClick={() => setMode('simulator')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'simulator' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
              Live Simulator
          </button>
      </div>

      {mode === 'script' ? (
        <div className="animate-in fade-in slide-in-from-left-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6">
                <h3 className="text-lg font-bold mb-4">Select Meeting Type</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { id: 'MOHRE Call', icon: Phone },
                    { id: 'HR Meeting', icon: Users },
                    { id: 'Court Hearing', icon: Gavel }
                ].map((type) => (
                    <button
                    key={type.id}
                    onClick={() => setPrepType(type.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition ${
                        prepType === type.id 
                        ? 'bg-royal-50 border-royal-500 text-royal-700' 
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                    >
                    <type.icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">{type.id}</span>
                    </button>
                ))}
                </div>

                <button
                onClick={handleGenerateScript}
                disabled={loading}
                className="w-full bg-royal-600 hover:bg-royal-700 text-white font-bold py-4 rounded-xl flex items-center justify-center shadow-lg shadow-royal-600/20"
                >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate Coaching Script"}
                </button>
            </div>

            {script && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="prose prose-sm prose-slate max-w-none">
                    {script.split('\n').map((line, i) => (
                    <p key={i} className={`
                        ${line.startsWith('**') ? 'font-bold text-slate-900 mt-4' : 'text-slate-700'}
                        ${line.startsWith('-') || line.startsWith('1.') ? 'ml-4 rtl:mr-4 rtl:ml-0' : ''}
                    `}>
                        {line.replace(/\*\*/g, '')}
                    </p>
                    ))}
                </div>
                </div>
            )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-right-4">
            {simHistory.length === 0 && !simLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="bg-indigo-50 p-4 rounded-full mb-4">
                        <Phone className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">Practice with AI Officer</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        The AI will pretend to be a MOHRE officer. Practice answering tough questions safely.
                    </p>
                    <button 
                        onClick={startSimulation}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center shadow-lg"
                    >
                        <PlayCircle className="w-5 h-5 mr-2" /> Start Simulation
                    </button>
                </div>
            )}

            {(simHistory.length > 0 || simLoading) && (
                <>
                    <div className="flex-grow bg-slate-50 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {simHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                }`}>
                                    <span className="text-[10px] font-bold opacity-70 block mb-1 uppercase tracking-wider">
                                        {msg.role === 'user' ? 'You' : 'Officer'}
                                    </span>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {simLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-white border-t border-slate-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                className="flex-grow p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Type your answer..."
                                value={simInput}
                                onChange={e => setSimInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSimSend()}
                                disabled={simLoading}
                            />
                            <button 
                                onClick={handleSimSend}
                                disabled={simLoading || !simInput.trim()}
                                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default CallCoach;