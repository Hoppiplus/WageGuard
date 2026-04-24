import { Case, ChatMessage, AppLanguage, TimelineEvent, RoadmapTask, EvidenceItem, OfferAnalysisResult, ContractAnalysisResult } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;

const getAI = () => {
    if (!aiClient && process.env.GEMINI_API_KEY) {
        try {
            aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI client:", e);
        }
    }
    return aiClient;
}

// --- EXPERT KNOWLEDGE BASE (SYSTEM PROMPT) ---
const UAE_LABOUR_LAW_CONTEXT = `
You are WageGuard, a world-class Legal Strategy AI for UAE Employees.
Your goal is to demonstrate immense value immediately so the user trusts you completely.

CORE KNOWLEDGE SOURCE:
- Federal Decree-Law No. 33 of 2021 (The New UAE Labour Law).
- Cabinet Resolution No. 1 of 2022.

RESPONSE STRUCTURE:
1. **Direct Answer**: Start with a clear Yes/No or direct evaluation.
2. **The Law**: Cite the specific Article Number (e.g., "According to Article 54...") relevant to the query.
3. **Your Rights**: Explain what the user is legally entitled to in simple terms.
4. **Action Plan**: Give 1-2 bullet points on exactly what they should do next.

CRITICAL RULES:
- **Tone**: Professional, Authoritative, yet Empathetic.
- **Mainland vs. Freezone**:
   - If Mainland: Direct to MOHRE (600590000).
   - If Freezone (DMCC/JAFZA/etc): Direct to their specific portals.
- **Golden Rule**: Warn users NEVER to sign a cancellation paper unless they have received full payment.
`;

const getMockResponseText = (lang: AppLanguage, type: 'diagnosis' | 'chat' | 'error') => {
    const messages: any = {
        diagnosis: {
            en: "System is in Offline Mode. Standard rule: Do NOT sign cancellation papers until paid. If Mainland, call MOHRE (600590000).",
            ar: "النظام في وضع غير متصل بالشبكة. قاعدة أساسية: لا توقع أوراق إلغاء التأشيرة حتى تستلم مستحقاتك."
        },
        chat: {
            en: "I am running in 'Safe Mode'. Tip: In the UAE, Gratuity is calculated on your Basic Salary. Never sign clearance until money is in bank.",
            ar: "أنا أعمل في 'الوضع الآمن'. نصيحة: في الإمارات، يتم حساب مكافأة نهاية الخدمة على راتبك الأساسي."
        },
        error: {
            en: "Unable to connect to AI service.",
            ar: "تعذر الاتصال بخدمة الذكاء الاصطناعي."
        }
    };
    return messages[type][lang] || messages[type]['en'];
};

export const diagnoseCase = async (description: string, issues: string[], employerType: string, freezone: string | undefined, lang: AppLanguage): Promise<{ 
    diagnosis: string; 
    risk: 'Low' | 'Medium' | 'High'; 
    dos: string[]; 
    donts: string[];
    strategicQuestions: string[];
    authorityContact?: { name: string, phone: string, email: string, portal: string };
    suggestedEmail?: { subject: string, body: string };
    roadmap?: { title: string, description: string, category: 'Document' | 'Action' | 'Official' }[];
}> => {
  const ai = getAI();
  if (ai) {
      try {
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `
                SYSTEM INSTRUCTION: ${UAE_LABOUR_LAW_CONTEXT}

                USER CASE DATA:
                - Issues: ${issues.join(', ')}
                - Employer Type: ${employerType} ${freezone ? `(${freezone})` : ''}
                - User Description: "${description}"
                
                TASK:
                1. Identify the specific jurisdiction and customize the "Next Steps".
                2. Assess risk.
                3. Create DOs and DONTs.
                4. Provide authority contact (Phone, Email).
                5. Draft a formal inquiry email to the Authority.
                6. Generate 3-4 strategic questions for the employer.
                7. Generate a 5-7 step roadmap (Document / Action / Official).
                
                OUTPUT REQUIREMENT:
                - Respond strictly in ${lang} language.
                - JSON format only.
              `,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          diagnosis: { type: Type.STRING },
                          risk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                          dos: { type: Type.ARRAY, items: { type: Type.STRING } },
                          donts: { type: Type.ARRAY, items: { type: Type.STRING } },
                          strategicQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                          authorityContact: {
                              type: Type.OBJECT,
                              properties: {
                                  name: { type: Type.STRING },
                                  phone: { type: Type.STRING },
                                  email: { type: Type.STRING },
                                  portal: { type: Type.STRING }
                              }
                          },
                          suggestedEmail: {
                              type: Type.OBJECT,
                              properties: {
                                  subject: { type: Type.STRING },
                                  body: { type: Type.STRING }
                              }
                          },
                          roadmap: {
                              type: Type.ARRAY,
                              items: {
                                  type: Type.OBJECT,
                                  properties: {
                                      title: { type: Type.STRING },
                                      description: { type: Type.STRING },
                                      category: { type: Type.STRING, enum: ['Document', 'Action', 'Official'] }
                                  }
                              }
                          }
                      }
                  },
                  tools: [{ googleSearch: {} }]
              }
          });
          if (response.text) {
              return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
          }
      } catch (e) {
          console.warn("Gemini diagnosis failed", e);
      }
  }

  // Fallback
  return {
    diagnosis: getMockResponseText(lang, 'diagnosis'),
    risk: "Medium",
    dos: ["Save WhatsApp chats", "Don't sign cancellation"],
    donts: ["Don't stop working without notice", "Don't sign without money"],
    strategicQuestions: ["Ask for your WPS record"],
    roadmap: []
  };
};

export const chatWithAI = async (history: ChatMessage[], newMessage: string, caseContext: Case | null, lang: AppLanguage): Promise<{ text: string; isFlagged: boolean }> => {
  const ai = getAI();
  if (ai) {
      try {
          const historyFormatted = history.map(h => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
          }));
          
          let contextText = caseContext ? 
            `Context: ${caseContext.title} (${caseContext.employerType})\nIssues: ${caseContext.issueTypes.join(', ')}` : 
            "Context: General inquiry";

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: [
                ...historyFormatted,
                { role: 'user', parts: [{ text: `${contextText}\n\nUser Question: ${newMessage}\n\nIMPORTANT: Use Google Search to verify the latest UAE Labour Law updates if necessary. Answer in ${lang}.` }] }
              ],
              config: {
                  systemInstruction: UAE_LABOUR_LAW_CONTEXT,
                  tools: [{ googleSearch: {} }]
              }
          });
          return { text: response.text || "Error generating response.", isFlagged: false };
      } catch (e) {
           console.warn("Gemini chat failed", e);
      }
  }

  return { text: getMockResponseText(lang, 'chat'), isFlagged: false };
};

export const analyzeEvidence = async (base64Data: string, mimeType: string, lang: AppLanguage): Promise<{ type: string; summary: string; tags: string[]; analysis: EvidenceItem['analysis'] }> => {
  const ai = getAI();
  if (ai) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: `Analyze this image for a UAE labour dispute. Extract specific excerpts for Threats, Admissions, Promises, Inconsistencies, and Red Flags. Return JSON in language: ${lang}.` }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        analysis: {
                            type: Type.OBJECT,
                            properties: {
                                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                                admissions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                promises: { type: Type.ARRAY, items: { type: Type.STRING } },
                                inconsistencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                                redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    }
                }
            }
        });
        if (response.text) return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) { console.warn("Gemini vision failed", e); }
  }

  return { type: "Unknown", summary: "File analysis failed", tags: [], analysis: { threats: [], admissions: [], promises: [], inconsistencies: [], redFlags: [] } };
};

export const analyzeOfferLetter = async (base64Data: string, mimeType: string, lang: AppLanguage): Promise<OfferAnalysisResult> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: `Analyze this UAE offer letter. Extract details in language: ${lang}. Use Google Search to check the company reputation if possible. Return strictly JSON.` }
                ],
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            companyName: { type: Type.STRING },
                            role: { type: Type.STRING },
                            salary: { type: Type.STRING },
                            trustScore: { type: Type.NUMBER },
                            trustRationale: { type: Type.STRING },
                            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            greenFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            reputationSummary: { type: Type.STRING }
                        }
                    },
                    tools: [{ googleSearch: {} }]
                }
            });
            if (response.text) return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) { console.error("Analyze offer failed", e); }
    }
    return { companyName: "Error", role: "Error", salary: "0", trustScore: 0, trustRationale: "Failed to analyze", redFlags: [], greenFlags: [], reputationSummary: "" };
};

export const analyzeLegalContract = async (base64Data: string, mimeType: string, lang: AppLanguage): Promise<ContractAnalysisResult> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: `Analyze this UAE legal document/contract for illegal clauses or violations of Decree-Law No. 33 of 2021. Response language: ${lang}. Return strictly JSON.` }
                ],
                config: { 
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            riskScore: { type: Type.NUMBER },
                            riskLevel: { type: Type.STRING, enum: ['Safe', 'Caution', 'Illegal'] },
                            summary: { type: Type.STRING },
                            flaggedClauses: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        clauseText: { type: Type.STRING },
                                        issue: { type: Type.STRING },
                                        explanation: { type: Type.STRING },
                                        severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                        legalReference: { type: Type.STRING }
                                    }
                                }
                            },
                            missingProtections: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    tools: [{ googleSearch: {} }] 
                }
            });
            if (response.text) return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) { console.error("Contract analysis failed", e); }
    }
    return { riskScore: 0, riskLevel: "Safe", summary: "Failed to analyze", flaggedClauses: [], missingProtections: [] };
};

export const generateReplies = async (incomingText: string, caseContext: Case, lang: AppLanguage): Promise<any[]> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 3 reply options (Soft, Firm, Assertive) for: "${incomingText}". Use general UAE law knowledge. Language: ${lang}. Return JSON array.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                tone: { type: Type.STRING },
                                subject: { type: Type.STRING },
                                body: { type: Type.STRING },
                                rationale: { type: Type.STRING }
                            }
                        }
                    },
                    tools: [{ googleSearch: {} }]
                }
            });
            if (response.text) return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) { console.warn("Reply gen failed", e); }
    }
    return [];
};

export const generateCallPrep = async (caseContext: Case, meetingType: string, lang: AppLanguage): Promise<string> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Create a coaching script for a ${meetingType} regarding ${caseContext.title}. Language: ${lang}.`
            });
            return response.text || "Error generating script.";
        } catch (e) { console.warn("Prep gen failed", e); }
    }
    return "Failed to generate script.";
};

export const generateTimeline = async (caseContext: Case, inputs: any): Promise<TimelineEvent[]> => {
    return [
        { id: '1', date: inputs.startDate || '2024-01-01', title: 'Employment Start', description: 'Joined company.', type: 'Official' }
    ];
};

export const generateRoadmap = async (caseContext: Case): Promise<RoadmapTask[]> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate a 5-step roadmap for resolving: ${caseContext.title}. Return JSON array.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              description: { type: Type.STRING },
                              category: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            if (response.text) {
                const tasks = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
                return tasks.map((t: any, i: number) => ({ id: String(Date.now() + i), title: t.title, description: t.description, category: t.category, isCompleted: false }));
            }
        } catch (e) { console.error("Roadmap gen failed", e); }
    }
    return [];
};

export const generateLegalNotice = async (caseContext: Case): Promise<{ subject: string; englishBody: string; arabicBody: string }> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Write a formal grievance notice for: ${caseContext.title}. Include UAE Articles. Return JSON with subject, englishBody, arabicBody.`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            englishBody: { type: Type.STRING },
                            arabicBody: { type: Type.STRING }
                        }
                    },
                    tools: [{ googleSearch: {} }]
                }
            });
            if (response.text) return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) { console.error("Notice gen failed", e); }
    }
    return { subject: "Error", englishBody: "Error", arabicBody: "Error" };
};

export const simulateOfficerTurn = async (history: {role: string, text: string}[], lang: AppLanguage): Promise<string> => {
    const ai = getAI();
    if (ai) {
        try {
            const historyFormatted = history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
            }));
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    ...historyFormatted,
                    { role: 'user', parts: [{ text: `You are a UAE MOHRE dispute officer. Continue the simulation. Use professional but firm tone. Response language: ${lang}. Keep it brief.` }] }
                ],
                config: {
                    systemInstruction: "You are a professional dispute officer at MOHRE (Ministry of Human Resources and Emiratisation) in UAE. Speak professionally.",
                }
            });
            return response.text || "Officer is silent.";
        } catch (e) { console.warn("Sim failed", e); }
    }
    return "MOHRE Officer: Please provide your evidence.";
};

export const getRightsInfo = async (type: string, issue: string, lang: AppLanguage): Promise<{ summary: string; prep: string[]; warnings: string[] }> => {
    const ai = getAI();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Explain the UAE legal rights for: ${issue} for a ${type} employee. Use Google Search to verify the latest regulations. Response language: ${lang}. Return JSON with "summary" (string), "prep" (array of strings), "warnings" (array of strings).`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            prep: { type: Type.ARRAY, items: { type: Type.STRING } },
                            warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    tools: [{ googleSearch: {} }]
                }
            });
            if (response.text) return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) { console.error("Get rights failure", e); }
    }
    return {
        summary: `Law context for ${issue} in ${type}. (Offline Mode)`,
        prep: ["Emirates ID copy", "Labour Contract"],
        warnings: ["Never sign cancellation papers until paid in full."]
    };
};
