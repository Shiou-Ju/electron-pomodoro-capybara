import { useState, useCallback, useEffect } from 'react';
import { TimerState } from '../types/timer';
import { useCountdownTick } from './useCountdownTick';

export const MIN_MINUTES = 1;
export const MAX_MINUTES = 9999; // 最多 4 位數
export const DEFAULT_MINUTES = 25;

const STREAK_STORAGE_KEY = 'capybara-streak';

const clampMinutes = (n: number): number =>
  Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.floor(n)));

// 小數 2 位（issue #9：分鐘 / 25 累加進 streak）
const round2 = (n: number): number => Math.round(n * 100) / 100;

const loadStreak = (): number => {
  const raw = localStorage.getItem(STREAK_STORAGE_KEY);
  const parsed = raw ? parseFloat(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useTimer = () => {
  const [state, setState] = useState<TimerState>(() => ({
    minutes: DEFAULT_MINUTES,
    timeLeft: DEFAULT_MINUTES * 60,
    isRunning: false,
    hasStarted: false,
    streak: loadStreak(),
  }));

  const startTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true, hasStarted: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  // 重置：停止並回到設定狀態，時間還原為目前已設分鐘
  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      hasStarted: false,
      timeLeft: prev.minutes * 60,
    }));
  }, []);

  // 設定分鐘（+/− 與 gi 直接輸入共用）；僅在未開始時可調整
  const setMinutes = useCallback((value: number) => {
    setState((prev) => {
      if (prev.hasStarted) return prev;
      const minutes = clampMinutes(value);
      return { ...prev, minutes, timeLeft: minutes * 60 };
    });
  }, []);

  const increment = useCallback(() => {
    setMinutes(state.minutes + 1);
  }, [setMinutes, state.minutes]);

  const decrement = useCallback(() => {
    setMinutes(state.minutes - 1);
  }, [setMinutes, state.minutes]);

  useCountdownTick(state.isRunning, (deltaSeconds) => {
    setState((prev) => ({
      ...prev,
      timeLeft: Math.max(0, prev.timeLeft - deltaSeconds),
    }));
  });

  // 倒數結束：累加 streak、回到設定狀態、發系統通知（不進下一階段）
  useEffect(() => {
    if (state.timeLeft === 0 && state.isRunning) {
      const gained = round2(state.minutes / 25);

      setState((prev) => ({
        ...prev,
        isRunning: false,
        hasStarted: false,
        timeLeft: prev.minutes * 60,
        streak: round2(prev.streak + gained),
      }));

      setTimeout(() => {
        window.electronAPI.sendNotification(
          '卡皮巴拉計時器',
          `時間到！streak +${gained.toFixed(2)}`,
        );
      }, 100);
    }
  }, [state.timeLeft, state.isRunning, state.minutes]);

  // 持久化 streak
  useEffect(() => {
    localStorage.setItem(STREAK_STORAGE_KEY, String(state.streak));
  }, [state.streak]);

  return {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    increment,
    decrement,
    setMinutes,
  };
};
