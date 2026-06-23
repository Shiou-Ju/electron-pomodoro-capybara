import { describe, it, expect } from 'vitest';
import {
  round2,
  minutesToStreak,
  addStreak,
  clampMinutes,
  MINUTES_PER_STREAK,
} from './streak';

describe('minutesToStreak', () => {
  it('整數倍數', () => {
    expect(minutesToStreak(25)).toBe(1);
    expect(minutesToStreak(50)).toBe(2);
    expect(minutesToStreak(0)).toBe(0);
  });

  it('小數結果取 2 位', () => {
    expect(minutesToStreak(12.5)).toBe(0.5);
    expect(minutesToStreak(10)).toBe(0.4);
    expect(minutesToStreak(1)).toBe(0.04);
    expect(minutesToStreak(33)).toBe(1.32);
  });

  it('需要四捨五入的值', () => {
    // 7/25 = 0.28；13/25 = 0.52
    expect(minutesToStreak(7)).toBe(0.28);
    expect(minutesToStreak(13)).toBe(0.52);
    // 1分以 25 基準 = 0.04，3 分 = 0.12
    expect(minutesToStreak(3)).toBe(0.12);
  });

  it('基準常數為 25', () => {
    expect(MINUTES_PER_STREAK).toBe(25);
  });
});

describe('round2', () => {
  it('一般四捨五入', () => {
    expect(round2(0.004)).toBe(0);
    expect(round2(0.005)).toBe(0.01);
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
  });

  it('浮點誤差來源', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it('已知浮點邊界：1.005 因 *100 變 100.4999… 故進位失準回 1', () => {
    // 記錄真實行為（非理想 1.01），提醒勿用本函式做金額等精算
    expect(round2(1.005)).toBe(1);
  });

  it('負數', () => {
    expect(round2(-1.234)).toBe(-1.23);
  });
});

describe('addStreak', () => {
  it('一般相加', () => {
    expect(addStreak(1, 0.5)).toBe(1.5);
    expect(addStreak(0, 0.04)).toBe(0.04);
  });

  it('連加不漂移（0.1 累加 10 次 = 1）', () => {
    let s = 0;
    for (let i = 0; i < 10; i += 1) s = addStreak(s, 0.1);
    expect(s).toBe(1);
  });

  it('累加計時器多段', () => {
    // 12.5 分 (0.5) + 12.5 分 (0.5) + 25 分 (1) = 2
    let s = 0;
    s = addStreak(s, minutesToStreak(12.5));
    s = addStreak(s, minutesToStreak(12.5));
    s = addStreak(s, minutesToStreak(25));
    expect(s).toBe(2);
  });
});

describe('clampMinutes', () => {
  it('夾在範圍內', () => {
    expect(clampMinutes(25, 1, 9999)).toBe(25);
  });

  it('低於 min', () => {
    expect(clampMinutes(0, 1, 9999)).toBe(1);
    expect(clampMinutes(-5, 1, 9999)).toBe(1);
  });

  it('高於 max', () => {
    expect(clampMinutes(10000, 1, 9999)).toBe(9999);
  });

  it('小數向下取整', () => {
    expect(clampMinutes(25.9, 1, 9999)).toBe(25);
    expect(clampMinutes(1.9, 1, 9999)).toBe(1);
  });
});
