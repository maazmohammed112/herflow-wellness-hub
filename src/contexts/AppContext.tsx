import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

export type Theme = 'modern' | 'retro';

export interface UserData {
  name: string;
  yearOfBirth?: number;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart?: string;
  pregnancyMode: boolean;
}

export interface PeriodEntry {
  startDate: string;
  endDate: string;
  flowIntensity?: number;
}

export interface DailyLog {
  date: string;
  symptoms?: string[];
  moods?: string[];
  medicine?: string[];
  ovulationTest?: 'positive' | 'negative' | null;
  weight?: number;
  temperature?: number;
  waterIntake?: number;
  notes?: string;
  flowIntensity?: number;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  updateUserData: (updates: Partial<UserData>) => void;
  periods: PeriodEntry[];
  addPeriod: (period: PeriodEntry) => void;
  updatePeriod: (index: number, period: PeriodEntry) => void;
  deletePeriod: (index: number) => void;
  dailyLogs: DailyLog[];
  addOrUpdateDailyLog: (log: DailyLog) => void;
  getDailyLog: (date: string) => DailyLog | undefined;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  getNextPeriodDate: () => Date | null;
  getOvulationDate: () => Date | null;
  getFertileWindow: () => { start: Date; end: Date } | null;
  isPeriodDay: (date: Date) => boolean;
  isFertileDay: (date: Date) => boolean;
  isOvulationDay: (date: Date) => boolean;
  getCycleDay: (date: Date) => number | null;
  backupData: () => string;
  restoreData: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  theme: 'herflow-theme',
  userData: 'herflow-user-data',
  periods: 'herflow-periods',
  dailyLogs: 'herflow-daily-logs',
  onboardingComplete: 'herflow-onboarding-complete',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('modern');
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as Theme;
    if (savedTheme) setThemeState(savedTheme);

    const savedUserData = localStorage.getItem(STORAGE_KEYS.userData);
    if (savedUserData) setUserDataState(JSON.parse(savedUserData));

    const savedPeriods = localStorage.getItem(STORAGE_KEYS.periods);
    if (savedPeriods) setPeriods(JSON.parse(savedPeriods));

    const savedLogs = localStorage.getItem(STORAGE_KEYS.dailyLogs);
    if (savedLogs) setDailyLogs(JSON.parse(savedLogs));

    const savedOnboarding = localStorage.getItem(STORAGE_KEYS.onboardingComplete);
    if (savedOnboarding) setOnboardingCompleteState(JSON.parse(savedOnboarding));
  }, []);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.remove('theme-modern', 'theme-retro');
    if (theme === 'retro') {
      document.documentElement.classList.add('theme-retro');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
  };

  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.userData);
    }
  };

  const updateUserData = (updates: Partial<UserData>) => {
    if (userData) {
      const newData = { ...userData, ...updates };
      setUserData(newData);
    }
  };

  const addPeriod = (period: PeriodEntry) => {
    const newPeriods = [...periods, period].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    setPeriods(newPeriods);
    localStorage.setItem(STORAGE_KEYS.periods, JSON.stringify(newPeriods));
  };

  const updatePeriod = (index: number, period: PeriodEntry) => {
    const newPeriods = [...periods];
    newPeriods[index] = period;
    setPeriods(newPeriods);
    localStorage.setItem(STORAGE_KEYS.periods, JSON.stringify(newPeriods));
  };

  const deletePeriod = (index: number) => {
    const newPeriods = periods.filter((_, i) => i !== index);
    setPeriods(newPeriods);
    localStorage.setItem(STORAGE_KEYS.periods, JSON.stringify(newPeriods));
  };

  const addOrUpdateDailyLog = (log: DailyLog) => {
    const existingIndex = dailyLogs.findIndex((l) => l.date === log.date);
    let newLogs: DailyLog[];
    if (existingIndex >= 0) {
      newLogs = [...dailyLogs];
      newLogs[existingIndex] = log;
    } else {
      newLogs = [...dailyLogs, log];
    }
    setDailyLogs(newLogs);
    localStorage.setItem(STORAGE_KEYS.dailyLogs, JSON.stringify(newLogs));
  };

  const getDailyLog = (date: string) => dailyLogs.find((l) => l.date === date);

  const setOnboardingComplete = (complete: boolean) => {
    setOnboardingCompleteState(complete);
    localStorage.setItem(STORAGE_KEYS.onboardingComplete, JSON.stringify(complete));
  };

  const getLastPeriod = () => {
    if (periods.length === 0) return null;
    return periods[0];
  };

  const getNextPeriodDate = () => {
    const lastPeriod = getLastPeriod();
    if (!lastPeriod || !userData) return null;
    const lastStart = parseISO(lastPeriod.startDate);
    return addDays(lastStart, userData.cycleLength);
  };

  const getOvulationDate = () => {
    const lastPeriod = getLastPeriod();
    if (!lastPeriod || !userData) return null;
    const lastStart = parseISO(lastPeriod.startDate);
    // Ovulation typically occurs 14 days before the next period
    return addDays(lastStart, userData.cycleLength - 14);
  };

  const getFertileWindow = () => {
    const ovulation = getOvulationDate();
    if (!ovulation) return null;
    // Fertile window is typically 5 days before ovulation and 1 day after
    return {
      start: addDays(ovulation, -5),
      end: addDays(ovulation, 1),
    };
  };

  const isPeriodDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return periods.some((period) => {
      const start = parseISO(period.startDate);
      const end = parseISO(period.endDate);
      const checkDate = parseISO(dateStr);
      return checkDate >= start && checkDate <= end;
    });
  };

  const isFertileDay = (date: Date) => {
    const window = getFertileWindow();
    if (!window) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    const checkDate = parseISO(dateStr);
    return checkDate >= window.start && checkDate <= window.end;
  };

  const isOvulationDay = (date: Date) => {
    const ovulation = getOvulationDate();
    if (!ovulation) return false;
    return format(date, 'yyyy-MM-dd') === format(ovulation, 'yyyy-MM-dd');
  };

  const getCycleDay = (date: Date) => {
    const lastPeriod = getLastPeriod();
    if (!lastPeriod) return null;
    const lastStart = parseISO(lastPeriod.startDate);
    const diff = differenceInDays(date, lastStart);
    if (diff < 0) return null;
    return (diff % (userData?.cycleLength || 28)) + 1;
  };

  const backupData = () => {
    const data = {
      userData,
      periods,
      dailyLogs,
      theme,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const restoreData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.userData) setUserData(data.userData);
      if (data.periods) {
        setPeriods(data.periods);
        localStorage.setItem(STORAGE_KEYS.periods, JSON.stringify(data.periods));
      }
      if (data.dailyLogs) {
        setDailyLogs(data.dailyLogs);
        localStorage.setItem(STORAGE_KEYS.dailyLogs, JSON.stringify(data.dailyLogs));
      }
      if (data.theme) setTheme(data.theme);
      setOnboardingComplete(true);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        userData,
        setUserData,
        updateUserData,
        periods,
        addPeriod,
        updatePeriod,
        deletePeriod,
        dailyLogs,
        addOrUpdateDailyLog,
        getDailyLog,
        onboardingComplete,
        setOnboardingComplete,
        getNextPeriodDate,
        getOvulationDate,
        getFertileWindow,
        isPeriodDay,
        isFertileDay,
        isOvulationDay,
        getCycleDay,
        backupData,
        restoreData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
