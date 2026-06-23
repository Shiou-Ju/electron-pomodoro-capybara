import { useEffect, useRef } from 'react';

/**
 * 共用倒數計時器：以 requestAnimationFrame + Date.now() 計算經過的整秒數，
 * 每滿 1 秒呼叫一次 onTick(deltaSeconds)。不持有時間狀態，由呼叫端自行扣減。
 *
 * 用 ref 保存 onTick，避免每次 callback 改變就重啟 rAF 迴圈。
 */
export const useCountdownTick = (
  isRunning: boolean,
  timeLeft: number,
  onTick: (deltaSeconds: number) => void,
): void => {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  // 以 ref 取得最新 timeLeft，供迴圈在歸零時停止排幀（防呆，見下）
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  useEffect(() => {
    if (!isRunning) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const update = () => {
      const currentTime = Date.now();
      const deltaTime = Math.floor((currentTime - lastTime) / 1000);

      if (deltaTime >= 1) {
        onTickRef.current(deltaTime);
        // 保留不足一秒的餘量，避免每秒重新等滿一整秒造成系統性偏慢
        lastTime += deltaTime * 1000;
      }

      // 防呆：時間歸零即停止排下一幀，不依賴消費端一定把 isRunning 設 false
      if (timeLeftRef.current > 0) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isRunning]);
};
