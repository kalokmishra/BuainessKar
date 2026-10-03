import React, { createContext, useContext, useState, useEffect } from 'react';
import { EntityType, ProfessionCategory, BusinessCategory } from '../engine/types';
import { useAuth } from './AuthContext';
import { services } from '../services';

export interface TaxDataState {
  // Section 1: Entity & Presumptive Primary Income
  entityType: EntityType;
  activityType: 'PROFESSION' | 'BUSINESS';
  professionCategory: ProfessionCategory;
  businessCategory: BusinessCategory;
  grossReceipts: number;
  cashReceipts: number;
  declaredProfit: string;

  // Section 2: Multi-Head Income Checklist Flags & Values
  hasSalary: boolean;
  grossSalary: number;

  hasHouseProperty: boolean;
  rentalIncome: number;

  hasCapitalGains: boolean;
  stcgEquity: number;
  stcgOther: number;
  ltcgEquity: number;
  ltcgOther: number;

  hasOtherIncome: boolean;
  savingsInterest: number;
  fdInterest: number;
  otherIncome: number;

  // Section 3: Deductions & Credits
  sec80C: number;
  sec80D: number;
  sec80CCD1B: number;
  sec80TTA: number;
  chapterVIADeductions: number;
  tdsClaimed: number;

  // Section 4: Advance Tax & Export/GST
  isExport: boolean;
  lutNumber: string;
  q1Paid: number;
  q2Paid: number;
  q3Paid: number;
  q4Paid: number;

  // Metadata flags
  isDemoDataLoaded: boolean;
  hasCompletedWizard: boolean;
}

export const ZERO_TAX_DATA: TaxDataState = {
  entityType: 'INDIVIDUAL',
  activityType: 'PROFESSION',
  professionCategory: 'IT_SOFTWARE',
  businessCategory: 'RETAIL_TRADING',
  grossReceipts: 0,
  cashReceipts: 0,
  declaredProfit: '',

  hasSalary: false,
  grossSalary: 0,

  hasHouseProperty: false,
  rentalIncome: 0,

  hasCapitalGains: false,
  stcgEquity: 0,
  stcgOther: 0,
  ltcgEquity: 0,
  ltcgOther: 0,

  hasOtherIncome: false,
  savingsInterest: 0,
  fdInterest: 0,
  otherIncome: 0,

  sec80C: 0,
  sec80D: 0,
  sec80CCD1B: 0,
  sec80TTA: 0,
  chapterVIADeductions: 0,
  tdsClaimed: 0,

  isExport: false,
  lutNumber: '',
  q1Paid: 0,
  q2Paid: 0,
  q3Paid: 0,
  q4Paid: 0,

  isDemoDataLoaded: false,
  hasCompletedWizard: false,
};

export const DEMO_TAX_DATA: TaxDataState = {
  entityType: 'INDIVIDUAL',
  activityType: 'PROFESSION',
  professionCategory: 'IT_SOFTWARE',
  businessCategory: 'RETAIL_TRADING',
  grossReceipts: 4800000,
  cashReceipts: 120000,
  declaredProfit: '',

  hasSalary: true,
  grossSalary: 800000,

  hasHouseProperty: true,
  rentalIncome: 120000,

  hasCapitalGains: true,
  stcgEquity: 150000,
  stcgOther: 0,
  ltcgEquity: 250000,
  ltcgOther: 100000,

  hasOtherIncome: true,
  savingsInterest: 15000,
  fdInterest: 45000,
  otherIncome: 60000,

  sec80C: 150000,
  sec80D: 25000,
  sec80CCD1B: 50000,
  sec80TTA: 10000,
  chapterVIADeductions: 150000,
  tdsClaimed: 30000,

  isExport: true,
  lutNumber: 'AD270326001928X',
  q1Paid: 0,
  q2Paid: 0,
  q3Paid: 0,
  q4Paid: 150000,

  isDemoDataLoaded: true,
  hasCompletedWizard: true,
};

const LOCAL_STORAGE_TAX_DATA = 'businesskar_tax_data';
const LOCAL_STORAGE_BANNER_DISMISSED = 'businesskar_banner_dismissed';

interface TaxDataContextType {
  taxData: TaxDataState;
  updateTaxData: (updates: Partial<TaxDataState>) => void;
  loadDemoData: () => void;
  resetToZeros: () => void;
  isTourOpen: boolean;
  openTour: (step?: number) => void;
  closeTour: () => void;
  tourInitialStep: number | null;
  requestedTab: string | null;
  navigateTab: (tab: string) => void;
  clearRequestedTab: () => void;
  isBannerDismissed: boolean;
  dismissBanner: () => void;
  isZeroData: boolean;
  isChatOpen: boolean;
  openChat: (initialPrompt?: string) => void;
  closeChat: () => void;
  chatInitialPrompt: string | null;
  clearChatInitialPrompt: () => void;
}

const TaxDataContext = createContext<TaxDataContextType | undefined>(undefined);

export const TaxDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [taxData, setTaxData] = useState<TaxDataState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TAX_DATA);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tax data from storage:', e);
    }
    // Default to clean zero state for new users
    return ZERO_TAX_DATA;
  });

  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourInitialStep, setTourInitialStep] = useState<number | null>(null);
  const [requestedTab, setRequestedTab] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_BANNER_DISMISSED) === 'true';
    } catch {
      return false;
    }
  });

  // Subscribe to user tax data from database provider (Firestore / Local)
  useEffect(() => {
    if (!currentUser?.id) return;

    let isMounted = true;
    const unsubscribe = services.db.subscribeTaxData(currentUser.id, (cloudData) => {
      if (isMounted && cloudData) {
        setTaxData(cloudData);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TAX_DATA, JSON.stringify(taxData));
    } catch (e) {
      console.error('Failed to save tax data to storage:', e);
    }
  }, [taxData]);

  const updateTaxData = (updates: Partial<TaxDataState>) => {
    setTaxData((prev) => {
      const next = { ...prev, ...updates };
      // Recalculate chapterVIADeductions if broken down values updated
      if (
        updates.sec80C !== undefined ||
        updates.sec80D !== undefined ||
        updates.sec80CCD1B !== undefined ||
        updates.sec80TTA !== undefined
      ) {
        const sum80C = Math.min(next.sec80C || 0, 150000);
        const sum80D = next.sec80D || 0;
        const sum80CCD = Math.min(next.sec80CCD1B || 0, 50000);
        const sum80TTA = Math.min(next.sec80TTA || 0, 10000);
        next.chapterVIADeductions = sum80C + sum80D + sum80CCD + sum80TTA;
      }

      // Persist to database provider (Firestore / Local)
      if (currentUser?.id) {
        services.db.saveTaxData(currentUser.id, next).catch((err) => {
          console.warn('Database saveTaxData warning:', err);
        });
      }

      return next;
    });
  };

  const loadDemoData = () => {
    setTaxData(DEMO_TAX_DATA);
  };

  const resetToZeros = () => {
    setTaxData(ZERO_TAX_DATA);
  };

  const openTour = (step?: number) => {
    if (step !== undefined) {
      setTourInitialStep(step);
    } else {
      setTourInitialStep(null);
    }
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    setTourInitialStep(null);
  };

  const navigateTab = (tab: string) => {
    setRequestedTab(tab);
  };

  const clearRequestedTab = () => {
    setRequestedTab(null);
  };

  const openChat = (initialPrompt?: string) => {
    if (initialPrompt) {
      setChatInitialPrompt(initialPrompt);
    }
    setIsChatOpen(true);
  };
  const closeChat = () => setIsChatOpen(false);
  const clearChatInitialPrompt = () => setChatInitialPrompt(null);

  const dismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_BANNER_DISMISSED, 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const isZeroData =
    taxData.grossReceipts === 0 &&
    taxData.grossSalary === 0 &&
    taxData.rentalIncome === 0 &&
    taxData.stcgEquity === 0 &&
    taxData.ltcgEquity === 0 &&
    taxData.otherIncome === 0;

  return (
    <TaxDataContext.Provider
      value={{
        taxData,
        updateTaxData,
        loadDemoData,
        resetToZeros,
        isTourOpen,
        openTour,
        closeTour,
        tourInitialStep,
        requestedTab,
        navigateTab,
        clearRequestedTab,
        isBannerDismissed,
        dismissBanner,
        isZeroData,
        isChatOpen,
        openChat,
        closeChat,
        chatInitialPrompt,
        clearChatInitialPrompt,
      }}
    >
      {children}
    </TaxDataContext.Provider>
  );
};

export const useTaxData = (): TaxDataContextType => {
  const context = useContext(TaxDataContext);
  if (!context) {
    throw new Error('useTaxData must be used within a TaxDataProvider');
  }
  return context;
};
