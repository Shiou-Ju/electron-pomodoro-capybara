import { useState, useCallback, useEffect, useRef } from 'react';
import { TimerState } from '../types/timer';
import { useCountdownTick } from './useCountdownTick';
import { minutesToStreak, clampMinutes } from '../utils/streak';

export const MIN_MINUTES = 1;
export const MAX_MINUTES = 9999; // 最多 4 位數
export const DEFAULT_MINUTES = 25;

// onFinish：倒數歸零時回報本次獲得的 streak（分鐘 / 25），由 useStreak 統一累加
export const useTimer = (onFinish?: (gained: number) => void) => {
  const [state, setState] = useState<TimerState>(() => ({
    minutes: DEFAULT_MINUTES,
    timeLeft: DEFAULT_MINUTES * 60,
    isRunning: false,
    hasStarted: false,
  }));

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

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
      const minutes = clampMinutes(value, MIN_MINUTES, MAX_MINUTES);
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

  // 倒數結束：回報 streak（交給 useStreak 累加）、回到設定狀態、發系統通知（不進下一階段）
  useEffect(() => {
    if (state.timeLeft === 0 && state.isRunning) {
      const gained = minutesToStreak(state.minutes);

      setState((prev) => ({
        ...prev,
        isRunning: false,
        hasStarted: false,
        timeLeft: prev.minutes * 60,
      }));

      onFinishRef.current?.(gained);

      setTimeout(() => {
        window.electronAPI.sendNotification(
          '卡皮巴拉計時器',
          `時間到！streak +${gained.toFixed(2)}`,
        );
      }, 100);
    }
  }, [state.timeLeft, state.isRunning, state.minutes]);

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
