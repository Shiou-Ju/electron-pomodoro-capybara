import { useState, useCallback, useEffect } from 'react';
import { addStreak as addStreakValue } from '../utils/streak';

const STREAK_STORAGE_KEY = 'capybara-streak';

const loadStreak = (): number => {
  const raw = localStorage.getItem(STREAK_STORAGE_KEY);
  const parsed = raw ? parseFloat(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * 番茄鐘與計時器共用的累積 streak（localStorage 持久化）。
 * 單位一致：25 分鐘 = 1.00，故番茄鐘完成 +1、計時器 +分鐘/25。
 */
export const useStreak = () => {
  const [streak, setStreak] = useState<number>(loadStreak);

  const addStreak = useCallback((amount: number) => {
    setStreak((prev) => addStreakValue(prev, amount));
  }, []);

  useEffect(() => {
    localStorage.setItem(STREAK_STORAGE_KEY, String(streak));
  }, [streak]);

  return { streak, addStreak };
};
