import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CaseList from './components/CaseList';
import NewCaseWizard from './components/NewCaseWizard';
import CaseDetail from './components/CaseDetail';
import KnowledgeBase from './components/KnowledgeBase';
import RightsChecker from './components/RightsChecker';
import GeneralAssistant from './components/GeneralAssistant';
import DisclaimerModal from './components/DisclaimerModal';
import Settings from './components/Settings';
import GratuityCalculator from './components/GratuityCalculator';
import OfferAnalyzer from './components/OfferAnalyzer';
import ContractReview from './components/ContractReview';
import PremiumPaywall from './components/PremiumPaywall';
import AdminDashboard from './components/AdminDashboard';
import SubscriptionDashboard from './components/SubscriptionDashboard';
import { Case } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

const AppContent: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const storedCases = localStorage.getItem('ws_cases');
    if (storedCases) {
      setCases(JSON.parse(storedCases));
    }
    const storedDisclaimer = localStorage.getItem('ws_disclaimer');
    if (storedDisclaimer === 'true') {
      setAcceptedDisclaimer(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('ws_cases', JSON.stringify(cases));
  }, [cases]);

  const handleDisclaimerAccept = () => {
    setAcceptedDisclaimer(true);
    localStorage.setItem('ws_disclaimer', 'true');
  };

  const addCase = (newCase: Case) => {
    setCases([newCase, ...cases]);
  };

  const updateCase = (updatedCase: Case) => {
    setCases(cases.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const deleteCase = (id: string) => {
    setCases(cases.filter(c => c.id !== id));
  };

  return (
    <HashRouter>
      {!acceptedDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
      <PremiumPaywall />
      <Layout>
        <Routes>
          <Route path="/" element={<CaseList cases={cases} onDelete={deleteCase} />} />
          <Route path="/new" element={<NewCaseWizard onSave={addCase} />} />
          <Route path="/case/:id/*" element={<CaseDetail cases={cases} onUpdate={updateCase} />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/rights" element={<RightsChecker />} />
          <Route path="/chat" element={<GeneralAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/gratuity" element={<GratuityCalculator />} />
          <Route path="/offer-check" element={<OfferAnalyzer />} />
          <Route path="/contract-review" element={<ContractReview />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/subscription" element={<SubscriptionDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <SubscriptionProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SubscriptionProvider>
  );
};

export default App;