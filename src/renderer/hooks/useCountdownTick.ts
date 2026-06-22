import { useEffect, useRef } from 'react';

/**
 * 共用倒數計時器：以 requestAnimationFrame + Date.now() 計算經過的整秒數，
 * 每滿 1 秒呼叫一次 onTick(deltaSeconds)。不持有時間狀態，由呼叫端自行扣減。
 *
 * 用 ref 保存 onTick，避免每次 callback 改變就重啟 rAF 迴圈。
 */
export const useCountdownTick = (
  isRunning: boolean,
  onTick: (deltaSeconds: number) => void,
): void => {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!isRunning) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const update = () => {
      const currentTime = Date.now();
      const deltaTime = Math.floor((currentTime - lastTime) / 1000);

      if (deltaTime >= 1) {
        onTickRef.current(deltaTime);
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isRunning]);
};
