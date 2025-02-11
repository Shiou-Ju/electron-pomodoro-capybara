import { useState, useCallback, useEffect } from 'react';
import {
  PomodoroMode,
  PomodoroState,
  PomodoroSettings,
} from '../types/pomodoro';

const DEFAULT_SETTINGS: PomodoroSettings = {
  // TODO: for dev
  // focusTime: 3,
  focusTime: 25 * 60,
  // TODO: for dev
  // shortBreakTime: 3,
  shortBreakTime: 5 * 60,
  // TODO: for dev
  // longBreakTime: 5,
  longBreakTime: 10 * 60,
  cyclesBeforeLongBreak: 4,
};

export const usePomodoro = (settings: PomodoroSettings = DEFAULT_SETTINGS) => {
  const [state, setState] = useState<PomodoroState>({
    mode: 'focus',
    timeLeft: settings.focusTime,
    isRunning: false,
    completedPomodoros: 0,
    cycleCount: 0,
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

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isRunning && state.timeLeft > 0) {
      interval = setInterval(() => {
        setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (state.timeLeft === 0) {
      // 時間到，切換模式
      const nextState = getNextState(state, settings);
      setState(nextState);
    }

    return () => clearInterval(interval);
  }, [state.isRunning, state.timeLeft, settings]);

  return {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};

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
      };
    }

    return {
      mode: 'shortBreak',
      timeLeft: settings.shortBreakTime,
      isRunning: false,
      completedPomodoros: newCompletedPomodoros,
      cycleCount: newCycleCount,
    };
  }

  return {
    mode: 'focus',
    timeLeft: settings.focusTime,
    isRunning: false,
    completedPomodoros: completedPomodoros,
    cycleCount: cycleCount,
  };
}
