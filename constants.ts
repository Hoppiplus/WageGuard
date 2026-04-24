
export const APP_NAME = "WageGuard";

export const DISCLAIMER_TEXT = `
**Important Legal Disclaimer:**

WageGuard is an AI-powered assistant designed to provide general information and guidance regarding UAE labour regulations.

1. **Not a Law Firm:** We are NOT a law firm, and we do not provide binding legal advice.
2. **No Representation:** We do not represent you in MOHRE, freezone authorities, or courts.
3. **Verification Required:** Laws and regulations change. Always verify critical information with official sources (MOHRE, Freezone Authority) or a licensed legal professional.
4. **Data Privacy:** Your data is stored locally on your device. We do not share it with your employer.

By proceeding, you acknowledge that you are using this tool for guidance only and take full responsibility for your actions.
`;

export const FREEZONES = [
  "DMCC (Dubai Multi Commodities Centre)",
  "JAFZA (Jebel Ali Free Zone)",
  "DAFZA (Dubai Airport Freezone)",
  "DSO (Dubai Silicon Oasis)",
  "DIFC (Dubai International Financial Centre)",
  "ADGM (Abu Dhabi Global Market)",
  "RAKEZ (Ras Al Khaimah Economic Zone)",
  "SHAMS (Sharjah Media City)",
  "IFZA (International Free Zone Authority)",
  "TECOM (Dubai Internet/Media City)",
  "KIZAD (Khalifa Industrial Zone)",
  "Meydan Free Zone",
  "Other / Not Listed"
];

export const ISSUE_TYPES = [
  "Unpaid Salary",
  "Delayed EOS Benefits",
  "Arbitrary Dismissal / Termination",
  "Forced Resignation",
  "Visa Cancellation Issues",
  "Passport Held by Employer",
  "Harassment / Hostile Environment",
  "Labour Ban Threats",
  "Police Case (Theft/Breach of Trust)",
  "False Absconding Report",
  "Other"
];

export const KNOWLEDGE_BASE_ARTICLES = [
  {
    id: 'kb1',
    category: 'Golden Rules',
    title: 'Never Sign Before Payment',
    content: 'The #1 Rule of UAE Labour Law: Never sign a "Visa Cancellation" or "End of Service Settlement" document that says "I have received all my dues" unless the money is physically in your hands or in your bank account. A cheque is NOT payment (it can bounce). A promise is NOT payment. Once you sign, it is extremely difficult to claim money later in court.'
  },
  {
    id: 'kb2',
    category: 'Basics',
    title: 'WPS (Wage Protection System)',
    content: 'The Wage Protection System (WPS) is an electronic salary transfer system. If your Mainland employer does not pay you via WPS for 3 months or more, you may be entitled to resign without notice (Article 45) and claim full compensation. Always keep your bank statements as proof of non-payment.'
  },
  {
    id: 'kb3',
    category: 'High Risk',
    title: 'Absconding (Huroob) Threats',
    content: 'Employers sometimes threaten to mark you as "Absconding" (runway) to avoid paying. DEFENSE: If you file a Labour Complaint *before* they report you, they cannot easily mark you as absconding. If you are threatened, file a complaint immediately via MOHRE (Mainland) or your Freezone portal.'
  },
  {
    id: 'kb4',
    category: 'High Risk',
    title: 'Police Cases & Travel Bans',
    content: 'Sometimes employers file a fake Police Case (Breach of Trust/Theft) to pressure you to drop a labour case. DO NOT PANIC. This is a tactic. You must get a memo/letter from the Labour Court/MOHRE stating there is a labour dispute, and present this to the Police/Public Prosecution to help clear your name.'
  },
  {
    id: 'kb5',
    category: 'Freezones',
    title: 'DMCC / JAFZA / DSO Disputes',
    content: 'If you work in a Freezone (like DMCC or JAFZA), MOHRE usually cannot help you directly in the first step. You MUST file a case through the specific Freezone Member Portal. They have their own mediation departments. Only if mediation fails will they give you a letter to go to the Dubai Labour Court.'
  },
  {
    id: 'kb6',
    category: 'Termination',
    title: 'Arbitrary Dismissal',
    content: 'If you are fired for a reason not related to performance or Article 44 (Gross Misconduct), it may be "Arbitrary Dismissal". You can claim up to 3 months of gross salary as compensation in court. The burden of proof is on the employer to show why they fired you.'
  }
];
