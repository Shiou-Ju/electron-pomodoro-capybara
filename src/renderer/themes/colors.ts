import type { Theme } from '@emotion/react';
import { AccentKey } from '../types/timer';

/**
 * 各模式強調色（計時數字 + 按鈕）。
 * 番茄鐘三模式明暗共用同一組強調色；計時器模式（timer）的暖琥珀色在亮色時略加深以保對比，
 * 故 timer 另外分亮/暗兩組，由 buildTheme 依 isDark 取用。
 */
interface ModeAccent {
  accent: string;
  accentHover: string;
  buttonText: string;
}

const MODE_ACCENTS: Record<AccentKey, ModeAccent> = {
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
  // 暗色版琥珀；亮色版見 TIMER_ACCENT_LIGHT
  timer: { accent: '#e0a44a', accentHover: '#eab866', buttonText: '#1f1404' },
};

// 計時器亮色版：底色為白時，琥珀需加深才有足夠對比
const TIMER_ACCENT_LIGHT: ModeAccent = {
  accent: '#d6912f',
  accentHover: '#c07f22',
  buttonText: '#ffffff',
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
export const buildTheme = (isDark: boolean, mode: AccentKey): Theme => {
  const base = isDark ? darkBase : lightBase;
  const modeAccent =
    mode === 'timer' && !isDark ? TIMER_ACCENT_LIGHT : MODE_ACCENTS[mode];

  return {
    isDark,
    ...base,
    ...modeAccent,
    focusRing: modeAccent.accentHover,
    warning: '#e74c3c',
    warningHover: '#c0392b',
    warningText: '#ffffff',
  };
};
