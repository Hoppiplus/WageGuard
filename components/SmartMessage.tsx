import React from 'react';
import { CheckCircle2, BookOpen, Shield, ListTodo, AlertTriangle, Scale, Coins, Gavel, ArrowRight } from 'lucide-react';

const formatInline = (text: string) => {
  // Split by **bold** segments
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      
      // Highlight Money (AED)
      if (content.includes('AED')) {
         return (
            <span key={i} className="inline-flex items-center bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold border border-emerald-200 shadow-sm mx-0.5 text-xs align-middle">
                <Coins className="w-3 h-3 mr-1" />
                {content}
            </span>
         );
      }
      
      // Highlight Articles/Laws
      if (content.toLowerCase().includes('article') || content.toLowerCase().includes('decree') || content.toLowerCase().includes('law')) {
         return (
            <span key={i} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold border border-indigo-100 mx-0.5 text-xs align-middle">
                <Gavel className="w-3 h-3 mr-1" />
                {content}
            </span>
         );
      }
      
      return <strong key={i} className="font-bold text-slate-900">{content}</strong>;
    }
    return part;
  });
};

const renderMarkdownBlock = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let inList = false;

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Check for bullet points (* or - or 1.)
        const isBullet = trimmed.match(/^[\*\-]\s/) || trimmed.match(/^\d+\.\s/);
        
        if (isBullet) {
            const content = trimmed.replace(/^[\*\-]\s/, '').replace(/^\d+\.\s/, '');
            listItems.push(
                <li key={`li-${i}`} className="mb-2 pl-1 flex items-start text-slate-700 text-sm leading-relaxed">
                    <span className="mt-1 mr-2 flex-shrink-0 bg-royal-100 text-royal-600 rounded-full p-0.5">
                        <ArrowRight className="w-3 h-3" />
                    </span>
                    <span>{formatInline(content)}</span>
                </li>
            );
            inList = true;
        } else {
            // Flush list if we were in one
            if (inList) {
                elements.push(<ul key={`ul-${i}`} className="mb-3">{listItems}</ul>);
                listItems = [];
                inList = false;
            }
            // Regular paragraph
            elements.push(<p key={`p-${i}`} className="mb-2 text-slate-700 text-sm leading-relaxed">{formatInline(trimmed)}</p>);
        }
    });

    if (inList) {
        elements.push(<ul key={`ul-end`} className="mb-0">{listItems}</ul>);
    }

    return <div>{elements}</div>;
};

const SmartMessage: React.FC<{ text: string }> = ({ text }) => {
    // Detect if this is the structured response we requested in System Prompt
    const isStructured = 
        text.includes('**Direct Answer') || 
        text.includes('**The Law') ||
        text.includes('**1.');

    if (isStructured) {
        // Regex to split by our known headers (1. Direct Answer, 2. The Law, etc)
        const sections = text.split(/(?=\*\*(?:1\.|Direct Answer)|(?:\*\*2\.|The Law)|(?:\*\*3\.|Your Rights)|(?:\*\*4\.|Action Plan))/g).filter(s => s.trim());

        return (
            <div className="space-y-3 w-full">
                {sections.map((sec, idx) => {
                    const cleanSec = sec.trim();
                    
                    // --- 1. DIRECT ANSWER CARD ---
                    if (cleanSec.match(/^\*\*(1\.|Direct)/i)) {
                        const content = cleanSec.replace(/\*\*.*?\*\*[:]?/, '').replace(/^\*\*\d+\.\s*Direct Answer\*\*[:]?/, '');
                        return (
                            <div key={idx} className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 rounded-2xl shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                                </div>
                                <div className="flex items-center mb-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider relative z-10">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Direct Answer
                                </div>
                                <div className="text-slate-800 relative z-10">
                                    {renderMarkdownBlock(content)}
                                </div>
                            </div>
                        );
                    }
                    
                    // --- 2. THE LAW CARD ---
                    if (cleanSec.match(/^\*\*(2\.|The Law)/i)) {
                        const content = cleanSec.replace(/\*\*.*?\*\*[:]?/, '').replace(/^\*\*\d+\.\s*The Law\*\*[:]?/, '');
                        return (
                            <div key={idx} className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-4 rounded-2xl shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Scale className="w-20 h-20 text-indigo-600" />
                                </div>
                                <div className="flex items-center mb-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider relative z-10">
                                    <Scale className="w-4 h-4 mr-2" /> UAE Labour Law
                                </div>
                                <div className="text-slate-700 italic relative z-10">
                                    {renderMarkdownBlock(content)}
                                </div>
                            </div>
                        );
                    }

                    // --- 3. YOUR RIGHTS CARD ---
                    if (cleanSec.match(/^\*\*(3\.|Your Rights)/i)) {
                         const content = cleanSec.replace(/\*\*.*?\*\*[:]?/, '').replace(/^\*\*\d+\.\s*Your Rights\*\*[:]?/, '');
                         return (
                            <div key={idx} className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4 rounded-2xl shadow-sm relative overflow-hidden">
                                <h4 className="font-extrabold text-amber-800 text-xs mb-2 flex items-center uppercase tracking-wide">
                                    <Shield className="w-4 h-4 mr-2" /> Your Entitlements
                                </h4>
                                <div className="text-slate-700">
                                    {renderMarkdownBlock(content)}
                                </div>
                            </div>
                        );
                    }

                    // --- 4. ACTION PLAN CARD ---
                    if (cleanSec.match(/^\*\*(4\.|Action)/i)) {
                        const content = cleanSec.replace(/\*\*.*?\*\*[:]?/, '').replace(/^\*\*\d+\.\s*Action Plan\*\*[:]?/, '');
                        return (
                            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 mt-2 shadow-sm relative">
                                <div className="flex items-center mb-3 text-royal-800 font-extrabold text-xs uppercase tracking-wider">
                                    <ListTodo className="w-4 h-4 mr-2 text-royal-600" /> Recommended Steps
                                </div>
                                {renderMarkdownBlock(content)}
                            </div>
                        );
                    }

                    // Fallback for sections that don't match headers perfectly
                    return <div key={idx} className="mt-2">{renderMarkdownBlock(cleanSec)}</div>;
                })}
            </div>
        );
    }

    // Fallback for non-structured simple chats
    return <div className="text-sm leading-relaxed">{renderMarkdownBlock(text)}</div>;
};

export default SmartMessage;