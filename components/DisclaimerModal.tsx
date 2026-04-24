import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onAccept: () => void;
}

const SimpleMarkdown = ({text}: {text: string}) => (
    <div className="whitespace-pre-wrap">{text.replace(/\*\*/g, '')}</div>
);

const DisclaimerModal: React.FC<Props> = ({ onAccept }) => {
  const { t, dir } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" dir={dir}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center space-x-3 mb-4 text-amber-600 rtl:space-x-reverse">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="text-xl font-bold">{t('disclaimer_title')}</h2>
        </div>
        
        <div className="text-sm text-gray-700 max-h-[60vh] overflow-y-auto mb-6 bg-gray-50 p-4 rounded border border-gray-200">
          <SimpleMarkdown text={t('disclaimer_body')} />
        </div>

        <button 
          onClick={onAccept}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {t('disclaimer_accept')}
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;