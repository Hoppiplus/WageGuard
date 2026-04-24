
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaymentService } from '../services/paymentService';

interface SubscriptionContextType {
  isPremium: boolean;
  isExpired: boolean;
  remainingFreeChats: number;
  daysRemaining: number;
  isLoading: boolean;
  upgradeToPremium: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  decrementFreeChat: () => void;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const DAILY_FREE_CHAT_LIMIT = 3;

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingFreeChats, setRemainingFreeChats] = useState(DAILY_FREE_CHAT_LIMIT);
  const [showPaywall, setShowPaywall] = useState(false);

  // Initial Security & Expiry Check
  useEffect(() => {
    const checkStatus = () => {
        const hasValidLicense = PaymentService.isPremium();
        const hasExpired = PaymentService.isExpired();
        const days = PaymentService.getDaysRemaining();
        
        setIsPremium(hasValidLicense);
        setIsExpired(hasExpired);
        setDaysRemaining(days);
        
        // Chat limit logic
        const storedChatData = localStorage.getItem('wg_chat_limit');
        if (storedChatData) {
            const { count, date } = JSON.parse(storedChatData);
            const today = new Date().toDateString();
            if (date === today) {
                setRemainingFreeChats(count);
            } else {
                setRemainingFreeChats(DAILY_FREE_CHAT_LIMIT);
                localStorage.setItem('wg_chat_limit', JSON.stringify({ count: DAILY_FREE_CHAT_LIMIT, date: today }));
            }
        }
        setIsLoading(false);
    };

    checkStatus();
  }, []);

  const upgradeToPremium = async () => {
    setIsLoading(true);
    const success = await PaymentService.purchaseSubscription();
    if (success) {
        // Note: Real update happens after key entry in Paywall
    }
    setIsLoading(false);
    return success;
  };

  const restorePurchases = async () => {
      setIsLoading(true);
      const success = await PaymentService.restorePurchases();
      if (success) {
          setIsPremium(true);
          setDaysRemaining(PaymentService.getDaysRemaining());
          setShowPaywall(false);
      }
      setIsLoading(false);
      return success;
  }

  const decrementFreeChat = () => {
      if (isPremium) return;
      const newCount = Math.max(0, remainingFreeChats - 1);
      setRemainingFreeChats(newCount);
      const today = new Date().toDateString();
      localStorage.setItem('wg_chat_limit', JSON.stringify({ count: newCount, date: today }));
  };

  return (
    <SubscriptionContext.Provider value={{ 
        isPremium,
        isExpired, 
        remainingFreeChats, 
        daysRemaining,
        isLoading,
        upgradeToPremium, 
        restorePurchases,
        decrementFreeChat, 
        showPaywall, 
        setShowPaywall
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
