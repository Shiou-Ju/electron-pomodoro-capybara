import { useState, useCallback, useEffect, useRef } from 'react';
import { PomodoroState, PomodoroSettings } from '../types/pomodoro';
import { getPomodoroSettings } from '../config/pomodoro.config';
import { useCountdownTick } from './useCountdownTick';

const DEFAULT_SETTINGS: PomodoroSettings = getPomodoroSettings();

// onPomodoroComplete：每完成一次 focus 時呼叫（用於累加共用 streak）
export const usePomodoro = (
  settings: PomodoroSettings = DEFAULT_SETTINGS,
  onPomodoroComplete?: () => void,
) => {
  const [state, setState] = useState<PomodoroState>({
    mode: 'focus',
    timeLeft: settings.focusTime,
    isRunning: false,
    completedPomodoros: 0,
    cycleCount: 0,
    startTime: 0,
  });

  const startTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timeLeft: settings.focusTime,
      isRunning: false,
      mode: 'focus',
    }));
  }, [settings.focusTime]);

  const onCompleteRef = useRef(onPomodoroComplete);
  onCompleteRef.current = onPomodoroComplete;

  // 手動跳到下一階段（focus <-> break），重用 getNextState
  const skipToNext = useCallback(() => {
    setState((prev) => getNextState(prev, settings));
  }, [settings]);

  useCountdownTick(state.isRunning, state.timeLeft, (deltaSeconds) => {
    setState((prev) => ({
      ...prev,
      timeLeft: Math.max(0, prev.timeLeft - deltaSeconds),
    }));
  });

  useEffect(() => {
    if (state.timeLeft === 0) {
      // 完成一次 focus → 累加共用 streak（+1，等同 25 分鐘）
      if (state.mode === 'focus') {
        onCompleteRef.current?.();
      }
      const nextState = getNextState(state, settings);
      setState(nextState);
    }
  }, [state.timeLeft, state, settings]);

  useEffect(() => {
    if (state.timeLeft === 0 && !state.isRunning) {
      const message = state.mode === 'focus' ? '該休息一下嘍！' : '繼續努力～';

      setTimeout(() => {
        window.electronAPI.sendNotification('卡皮巴拉番茄鐘', message);
      }, 100);
    }
  }, [state.timeLeft, state.isRunning, state.mode]);

  return {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
  };
};

// 計算下一階段狀態：由「timeLeft === 0 自動進階」的 effect 與 skipToNext 共用
function getNextState(
  currentState: PomodoroState,
  settings: PomodoroSettings,
): PomodoroState {
  const { mode, completedPomodoros, cycleCount } = currentState;

  if (mode === 'focus') {
    const newCompletedPomodoros = completedPomodoros + 1;
    const newCycleCount = cycleCount + 1;

    if (newCycleCount === settings.cyclesBeforeLongBreak) {
      return {
        mode: 'longBreak',
        timeLeft: settings.longBreakTime,
        isRunning: false,
        completedPomodoros: newCompletedPomodoros,
        cycleCount: 0,
        startTime: 0,
      };
    }

    return {
      mode: 'shortBreak',
      timeLeft: settings.shortBreakTime,
      isRunning: false,
      completedPomodoros: newCompletedPomodoros,
      cycleCount: newCycleCount,
      startTime: 0,
    };
  }

  return {
    mode: 'focus',
    timeLeft: settings.focusTime,
    isRunning: false,
    completedPomodoros: completedPomodoros,
    cycleCount: cycleCount,
    startTime: 0,
  };
}
