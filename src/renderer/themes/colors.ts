import type { Theme } from '@emotion/react';
import { PomodoroMode } from '../types/pomodoro';

/**
 * 各模式強調色（計時數字 + 按鈕）。
 * 依使用者決定「亮色跟暗色一樣」，明暗共用同一組強調色，
 * 只有底色 / surface / 文字色會隨明暗不同。
 */
interface ModeAccent {
  accent: string;
  accentHover: string;
  buttonText: string;
}

const MODE_ACCENTS: Record<PomodoroMode, ModeAccent> = {
  focus: { accent: '#e26a6a', accentHover: '#ec8585', buttonText: '#1a0c0c' },
  shortBreak: {
    accent: '#5fc28a',
    accentHover: '#7ad3a3',
    buttonText: '#0a1a10',
  },
  longBreak: {
    accent: '#4aa3e0',
    accentHover: '#5fb4ef',
    buttonText: '#0b1320',
  },
};

interface BasePalette {
  background: string;
  surface: string;
  textPrimary: string;
}

const lightBase: BasePalette = {
  background: '#ffffff',
  surface: '#f0f2f5',
  textPrimary: '#2c3e50',
};

// 候選 B：石板炭灰
const darkBase: BasePalette = {
  background: '#1a1d23',
  surface: '#262b33',
  textPrimary: '#e4e6eb',
};

/**
 * 依「是否暗色」與「目前模式」組出 Emotion Theme。
 * 在 App.tsx 以 useMemo(buildTheme(isDark, state.mode)) 計算。
 */
export const buildTheme = (isDark: boolean, mode: PomodoroMode): Theme => {
  const base = isDark ? darkBase : lightBase;
  const modeAccent = MODE_ACCENTS[mode];

  return {
    isDark,
    ...base,
    ...modeAccent,
    focusRing: modeAccent.accentHover,
  };
};
