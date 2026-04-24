import React, { useState } from 'react';
import { KNOWLEDGE_BASE_ARTICLES } from '../constants';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Rights Library</h2>
        <p className="text-gray-500">Essential UAE labour concepts explained simply.</p>
      </div>

      <div className="space-y-3">
        {KNOWLEDGE_BASE_ARTICLES.map((article) => (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button 
              onClick={() => toggle(article.id)}
              className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 text-left transition"
            >
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1">
                    {article.category}
                </span>
                <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
              </div>
              {expandedId === article.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>
            
            {expandedId === article.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-gray-700 text-sm leading-relaxed animate-in slide-in-from-top-2 duration-200">
                {article.content}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-center">
        Regulations change. Always double check with MOHRE (600590000).
      </div>
    </div>
  );
};

export default KnowledgeBase;