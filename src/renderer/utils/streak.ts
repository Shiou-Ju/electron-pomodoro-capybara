// streak 計算純函式（與 React 無關，方便單元測試）
// 單位基準：MINUTES_PER_STREAK 分鐘 = 1.00 streak（番茄完成 +1、計時 +分鐘/25）

export const MINUTES_PER_STREAK = 25;

/** 四捨五入到小數 2 位 */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

/** 由分鐘換算 streak 獲得量（小數 2 位） */
export const minutesToStreak = (minutes: number): number =>
  round2(minutes / MINUTES_PER_STREAK);

/** 累加 streak，並 round2 以避免浮點漂移 */
export const addStreak = (prev: number, gain: number): number =>
  round2(prev + gain);

/** 將分鐘夾到 [min, max] 並取整（向下） */
export const clampMinutes = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.floor(n)));
