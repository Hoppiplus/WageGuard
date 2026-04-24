import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithAI } from '../services/geminiService';
import { Send, User, Shield, Loader2, Sparkles, MessageCircle, Lock, Crown, Trash2, Bot, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import SmartMessage from './SmartMessage';

const GeneralAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load from local storage for persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
        const saved = localStorage.getItem('wg_general_chat');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language, t, dir } = useLanguage();
  const { isPremium, remainingFreeChats, decrementFreeChat, setShowPaywall } = useSubscription();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Persist chat
  useEffect(() => {
      localStorage.setItem('wg_general_chat', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (txt: string = input) => {
    if (!txt.trim()) return;
    
    // Check Limits
    if (!isPremium && remainingFreeChats <= 0) {
        setShowPaywall(true);
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: txt,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    if (!isPremium) decrementFreeChat();

    try {
      const result = await chatWithAI(newHistory, txt, null, language);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: Date.now(),
        isFlaggedForReview: result.isFlagged
      };
      setMessages([...newHistory, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
      if(window.confirm("Clear conversation history?")) {
          setMessages([]);
          localStorage.removeItem('wg_general_chat');
      }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-r from-royal-900 to-royal-800 rounded-3xl p-8 text-white shadow-xl shadow-royal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center">
              <div className="bg-white/10 p-3 rounded-2xl mr-4 rtl:mr-0 rtl:ml-4 border border-white/20">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold mb-1">General Assistant</h2>
                <p className="text-royal-100 font-medium text-sm">Ask anything about UAE Labour Law</p>
              </div>
          </div>
          {messages.length > 0 && (
              <button onClick={handleClear} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition">
                  <Trash2 className="w-5 h-5" />
              </button>
          )}
        </div>
      </div>

      <div className="flex flex-col h-[550px] bg-slate-50/50 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden" dir={dir}>
        <div className="flex-grow overflow-y-auto space-y-6 p-6 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                   
                   <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                       <Sparkles className="w-8 h-8 text-indigo-600" />
                   </div>
                   
                   <h3 className="font-extrabold text-slate-900 text-lg mb-2">How can I help you today?</h3>
                   <p className="text-sm text-slate-500 leading-relaxed mb-6">
                       I'm trained on <strong>UAE Decree-Law No. 33</strong>. Ask me about your contract, gratuity, or visa rules.
                   </p>
                   
                   <div className="space-y-2">
                      <button onClick={() => handleSend("How is gratuity calculated?")} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-600 hover:text-indigo-700 transition flex items-center border border-transparent hover:border-indigo-100">
                        <HelpCircle className="w-4 h-4 mr-3 text-slate-400" />
                        How is gratuity calculated?
                      </button>
                      <button onClick={() => handleSend("Can my employer hold my passport?")} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-600 hover:text-indigo-700 transition flex items-center border border-transparent hover:border-indigo-100">
                        <HelpCircle className="w-4 h-4 mr-3 text-slate-400" />
                        Can my employer hold my passport?
                      </button>
                      <button onClick={() => handleSend("What is the notice period rule?")} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-xs font-bold text-slate-600 hover:text-indigo-700 transition flex items-center border border-transparent hover:border-indigo-100">
                        <HelpCircle className="w-4 h-4 mr-3 text-slate-400" />
                        What is the notice period rule?
                      </button>
                   </div>
               </div>
             </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mb-1 shadow-sm ${
                  msg.role === 'user' ? 'bg-slate-800 mx-2' : 'bg-gradient-to-br from-indigo-500 to-purple-600 mx-2'
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
                  </div>
                  {msg.role === 'model' && (
                    <div className="mt-1.5 pl-1">
                        <p className="text-[10px] text-slate-300">{t('inline_disclaimer')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
             <div className="flex justify-start">
             <div className="flex items-center space-x-2 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm ml-12">
               <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
               <span className="text-xs text-slate-400 font-bold ml-2">Consulting Law...</span>
             </div>
          </div>
          )}
        </div>

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
                    type="text"
                    className="flex-grow bg-transparent px-3 py-2 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading}
                    />
                    <button
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className="bg-royal-900 text-white p-2.5 rounded-xl hover:bg-royal-800 disabled:bg-slate-300 disabled:text-slate-400 transition shadow-sm"
                    >
                    <Send className="w-5 h-5 rtl:rotate-180" />
                    </button>
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralAssistant;