import { PomodoroMode } from './pomodoro';

/**
 * 強調色 key：番茄鐘三模式之外，再加上計時器模式（暖琥珀色）。
 * 供 buildTheme 與 App 計算當前強調色用。
 */
export type AccentKey = PomodoroMode | 'timer';

export interface TimerState {
  minutes: number; // 使用者設定的分鐘數（1–9999）
  timeLeft: number; // 剩餘秒數
  isRunning: boolean; // 是否倒數中
  hasStarted: boolean; // 是否已開始（false = 設定狀態，顯示步進器）
  streak: number; // 累積 streak（分鐘/25，小數 2 位）
}
