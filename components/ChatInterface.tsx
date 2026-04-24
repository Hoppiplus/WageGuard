import React, { useState, useRef, useEffect } from 'react';
import { Case, ChatMessage, EvidenceItem } from '../types';
import { chatWithAI, analyzeEvidence } from '../services/geminiService';
import { Send, User, Shield, Loader2, Flag, Paperclip, FileText, Lock, Crown, Sparkles, Bot, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import SmartMessage from './SmartMessage';

interface Props {
  currentCase: Case;
  onUpdate: (c: Case) => void;
}

const ChatInterface: React.FC<Props> = ({ currentCase, onUpdate }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, t, dir } = useLanguage();
  const { isPremium, remainingFreeChats, decrementFreeChat, setShowPaywall } = useSubscription();

  const messages = currentCase.chatHistory || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, analyzingFile]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    // Check Limits
    if (!isPremium && remainingFreeChats <= 0) {
        setShowPaywall(true);
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    onUpdate({ ...currentCase, chatHistory: newHistory });
    setInput('');
    setLoading(true);

    if (!isPremium) decrementFreeChat();

    try {
      const result = await chatWithAI(messages, textToSend, currentCase, language);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: Date.now(),
        isFlaggedForReview: result.isFlagged
      };
      onUpdate({ ...currentCase, chatHistory: [...newHistory, aiMsg] });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      // Documents strictly for Premium
      if (!isPremium) {
          setShowPaywall(true);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
      }

      const file = e.target.files?.[0];
      if (!file) return;

      setAnalyzingFile(true);
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
                  tags: analysis.tags,
                  dateAdded: new Date().toISOString(),
                  analysis: analysis.analysis
              };

              const updatedEvidenceList = [newEvidence, ...currentCase.evidence];
              const updatedCaseForAI = { ...currentCase, evidence: updatedEvidenceList };

              const userMsg: ChatMessage = {
                  id: Date.now().toString(),
                  role: 'user',
                  text: `I have uploaded a document: ${file.name}. Please analyze it.`,
                  timestamp: Date.now(),
                  attachments: [{ name: file.name, type: file.type }]
              };
              
              const newHistory = [...messages, userMsg];
              onUpdate({ ...updatedCaseForAI, chatHistory: newHistory });
              setAnalyzingFile(false); 
              setLoading(true);

              const result = await chatWithAI(newHistory, userMsg.text, updatedCaseForAI, language);
              const aiMsg: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  role: 'model',
                  text: result.text,
                  timestamp: Date.now(),
                  isFlaggedForReview: result.isFlagged
              };
              onUpdate({ ...updatedCaseForAI, chatHistory: [...newHistory, aiMsg] });

          } catch (error) {
              console.error(error);
              setAnalyzingFile(false);
          } finally {
              setLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50/50 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden animate-fade-in-up" dir={dir}>
      
      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto space-y-6 p-6 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-royal-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-royal-500 to-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-royal-500/20">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-2">WageGuard AI Strategist</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        I have reviewed your case details. I am ready to answer specific questions about your <strong>{currentCase.issueTypes[0]}</strong> situation.
                    </p>

                    <div className="w-full space-y-2">
                        <button 
                            onClick={() => handleSend("What are my rights in this situation?")}
                            className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-royal-50 text-xs font-bold text-slate-600 hover:text-royal-700 transition flex items-center group"
                        >
                            <MessageSquare className="w-4 h-4 mr-3 text-slate-400 group-hover:text-royal-500" />
                            What are my rights here?
                        </button>
                        <button 
                            onClick={() => handleSend("Is my employer allowed to do this?")}
                            className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-royal-50 text-xs font-bold text-slate-600 hover:text-royal-700 transition flex items-center group"
                        >
                            <Shield className="w-4 h-4 mr-3 text-slate-400 group-hover:text-royal-500" />
                            Is this legal?
                        </button>
                    </div>
                </div>
             </div>
           </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mb-1 shadow-sm ${
                msg.role === 'user' ? 'bg-slate-800 mx-2' : 'bg-gradient-to-br from-royal-500 to-indigo-600 mx-2'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className="flex flex-col w-full">
                <div className={`p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-2xl rounded-br-none rtl:rounded-bl-none rtl:rounded-br-2xl text-sm' 
                    : 'bg-white text-slate-800 rounded-2xl rounded-bl-none rtl:rounded-br-none rtl:rounded-bl-2xl border border-slate-100'
                }`}>
                  <SmartMessage text={msg.text} />
                  {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 bg-white/20 p-2 rounded-lg flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="text-xs font-bold underline truncate max-w-[150px]">{msg.attachments[0].name}</span>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {analyzingFile && (
             <div className="flex justify-end">
                <div className="flex items-center space-x-2 bg-royal-50 rounded-2xl p-4 border border-royal-100">
                    <Loader2 className="w-4 h-4 animate-spin text-royal-600" />
                    <span className="text-xs text-royal-700 font-bold">Scanning Document...</span>
                </div>
             </div>
        )}

        {loading && !analyzingFile && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm ml-12">
               <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-royal-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-royal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-royal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
               <span className="text-xs text-slate-400 font-bold ml-2">Consulting Law...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 relative z-20">
        
        {/* LOCK STATE (If Free Limit Reached) */}
        {!isPremium && remainingFreeChats <= 0 ? (
            <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
                <button 
                    onClick={() => setShowPaywall(true)}
                    className="w-full h-full rounded-2xl border-2 border-royal-100 bg-gradient-to-r from-royal-50 to-white flex items-center justify-between px-6 hover:shadow-lg transition-all group"
                >
                    <div className="flex items-center text-left">
                        <div className="bg-royal-100 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6 text-royal-600" />
                        </div>
                        <div>
                            <span className="block font-bold text-royal-900">Daily Limit Reached</span>
                            <span className="text-xs text-royal-600">Unlock unlimited expert advice</span>
                        </div>
                    </div>
                    <div className="flex items-center bg-royal-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
                        <Crown className="w-4 h-4 mr-2" /> Upgrade
                    </div>
                </button>
            </div>
        ) : (
            <>
                {/* FREE COUNT INDICATOR */}
                {!isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center">
                         <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                         {remainingFreeChats} Free Messages Left
                    </div>
                )}
                
                <div className="flex space-x-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-royal-500/20 focus-within:border-royal-500 transition-all focus-within:bg-white">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleFileUpload}
                        accept="image/*,.pdf" 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-royal-600 hover:bg-royal-50 rounded-xl transition"
                        disabled={loading || analyzingFile}
                        title="Upload Document (Premium)"
                    >
                        {isPremium ? <Paperclip className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </button>
                    
                    <input
                        type="text"
                        className="flex-grow bg-transparent px-3 py-2 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                        placeholder="Ask specifically about your case..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading || analyzingFile}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || analyzingFile || !input.trim()}
                        className="bg-royal-900 text-white p-2.5 rounded-xl hover:bg-royal-800 disabled:bg-slate-300 disabled:text-slate-400 transition shadow-sm"
                    >
                        <Send className="w-5 h-5 rtl:rotate-180" />
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;