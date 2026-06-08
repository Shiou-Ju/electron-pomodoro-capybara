import '@emotion/react';

// 擴充 Emotion 的 Theme 型別，對應 buildTheme() 回傳的扁平結構
declare module '@emotion/react' {
  export interface Theme {
    isDark: boolean;
    background: string;
    surface: string;
    textPrimary: string;
    accent: string;
    accentHover: string;
    buttonText: string;
    focusRing: string;
  }
}
