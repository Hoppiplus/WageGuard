import React, { useState } from 'react';
import { Case, ReplySuggestion } from '../types';
import { generateReplies } from '../services/geminiService';
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  currentCase: Case;
}

const ReplyGenerator: React.FC<Props> = ({ currentCase }) => {
  const [incomingText, setIncomingText] = useState('');
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { language, t } = useLanguage();

  const handleGenerate = async () => {
    if (!incomingText) return;
    setLoading(true);
    try {
      const results = await generateReplies(incomingText, currentCase, language);
      setSuggestions(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste the message you received (Email/WhatsApp):
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          placeholder="..."
          value={incomingText}
          onChange={e => setIncomingText(e.target.value)}
        ></textarea>
        <button
          onClick={handleGenerate}
          disabled={loading || !incomingText}
          className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg flex items-center justify-center transition"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Safe Replies
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
             <div className={`px-4 py-2 border-b flex justify-between items-center ${
                 suggestion.tone === 'Soft' ? 'bg-blue-50 text-blue-800' :
                 suggestion.tone === 'Firm' ? 'bg-amber-50 text-amber-800' :
                 'bg-red-50 text-red-800'
             }`}>
                <span className="font-bold text-sm">{suggestion.tone} Tone</span>
                <span className="text-xs opacity-75">{suggestion.rationale}</span>
             </div>
             <div className="p-4">
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap mb-3 border border-gray-100">
                    {suggestion.body}
                </div>
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => copyToClipboard(suggestion.body, idx)}
                        className="flex items-center text-xs text-gray-500 hover:text-gray-900"
                    >
                        {copiedIndex === idx ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedIndex === idx ? 'Copied' : 'Copy Text'}
                    </button>
                    <span className="text-[10px] text-gray-400 italic">{t('inline_disclaimer')}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReplyGenerator;