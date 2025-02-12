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

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const updateTimer = () => {
      if (state.isRunning && state.timeLeft > 0) {
        const currentTime = Date.now();
        const deltaTime = Math.floor((currentTime - lastTime) / 1000);

        if (deltaTime >= 1) {
          setState(prev => ({
            ...prev,
            timeLeft: Math.max(0, prev.timeLeft - deltaTime)
          }));
          lastTime = currentTime;
        }

        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    if (state.isRunning) {
      lastTime = Date.now();
      animationFrameId = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [state.isRunning, state.timeLeft]);

  return {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};

// TODO: 這個 function not used
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
