
export type EmployerType = 'Mainland' | 'Freezone' | 'Unknown';
export type CaseStage = 'Pre-complaint' | 'Complaint Filed' | 'Mediation' | 'Court' | 'Closed';
export type AppLanguage = 'en' | 'ar' | 'hi' | 'ur' | 'fil' | 'ml' | 'bn' | 'ta' | 'id';

export interface UserProfile {
  isPremium: boolean;
  freeChatCount: number; // Daily limit tracker
  lastResetDate: string;
}

export interface EvidenceItem {
  id: string;
  type: 'Contract' | 'Payment Proof' | 'Communication' | 'Other';
  description: string;
  summary: string;
  extractedText?: string;
  tags: string[];
  dateAdded: string;
  analysis?: {
    threats: string[];
    admissions: string[];
    promises: string[];
    inconsistencies?: string[]; // New: e.g. "Dates don't match"
    redFlags?: string[]; // New: e.g. "Illegal clause"
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isFlaggedForReview?: boolean; // For the "Learning" system
  attachments?: {
    name: string;
    type: string;
  }[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'Incident' | 'Communication' | 'Official' | 'Payment';
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  category: 'Document' | 'Action' | 'Official';
}

export interface Case {
  id: string;
  title: string;
  employerType: EmployerType;
  freezone?: string; // Specific Freezone authority if applicable
  issueTypes: string[];
  description: string;
  aiDiagnosis?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  actionableDos?: string[];
  actionableDonts?: string[];
  strategicQuestions?: string[]; // New: Questions to ask the employer
  stage: CaseStage;
  createdAt: string;
  evidence: EvidenceItem[];
  chatHistory: ChatMessage[];
  timeline?: TimelineEvent[];
  roadmap?: RoadmapTask[];
}

export interface ReplySuggestion {
  tone: 'Soft' | 'Firm' | 'Assertive';
  subject: string;
  body: string;
  rationale: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface OfferAnalysisResult {
  companyName: string;
  role: string;
  salary: string;
  trustScore: number; // 0 to 100
  trustRationale: string;
  redFlags: string[];
  greenFlags: string[];
  reputationSummary: string; // "Based on general data..."
}

export interface ContractAnalysisResult {
  riskScore: number; // 0 (Safe) to 100 (Dangerous)
  riskLevel: 'Safe' | 'Caution' | 'Illegal';
  summary: string;
  flaggedClauses: {
    clauseText: string; // The specific text from the doc
    issue: string; // "Illegal Penalty", "Forced Resignation", etc.
    explanation: string; // Why it is bad
    severity: 'High' | 'Medium' | 'Low';
    legalReference?: string; // e.g. "Violates Article 6 of Decree-Law 33"
  }[];
  missingProtections: string[]; // Things that SHOULD be there but aren't
}
