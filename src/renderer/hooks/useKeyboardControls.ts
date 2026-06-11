import { useEffect } from 'react';

type FocusRef = React.RefObject<HTMLElement | null>;

interface KeyboardControlsOptions {
  onTogglePlay: () => void; // p：開始 / 暫停
  onRequestReset: () => void; // r：請求重置（需二次確認）
  onSkipNext: () => void; // n：跳到下一階段
  onToggleDark: () => void; // d：切換暗黑模式
  onCancel: () => void; // Esc：取消（例如解除重置確認）
  onDismissNotification: () => void; // c / Esc：關掉畫面上的通知
  focusRefs: FocusRef[]; // h/l、方向鍵在這些控制間移動焦點
}

/**
 * 在 window 上掛一個 keydown listener，提供 vim 風格的鍵盤操作。
 * 焦點在 app 視窗內時生效；保留帶修飾鍵的快捷鍵（如 Cmd+L 切換佈局）。
 * Enter / Space 啟動目前 focus 的按鈕，沿用原生 button 行為，這裡不攔截。
 */
export const useKeyboardControls = ({
  onTogglePlay,
  onRequestReset,
  onSkipNext,
  onToggleDark,
  onCancel,
  onDismissNotification,
  focusRefs,
}: KeyboardControlsOptions) => {
  useEffect(() => {
    const moveFocus = (dir: 1 | -1) => {
      const els = focusRefs
        .map((ref) => ref.current)
        .filter((el): el is HTMLElement => el !== null);
      if (els.length === 0) return;

      const currentIdx = els.findIndex((el) => el === document.activeElement);
      const nextIdx =
        currentIdx === -1 ? 0 : (currentIdx + dir + els.length) % els.length;
      els[nextIdx].focus();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 保留系統 / 既有的修飾鍵快捷鍵（Cmd+L 切換佈局、Cmd+R reload 等）
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // 避免長按重複觸發動作
      if (e.repeat) return;

      switch (e.key) {
        case 'p':
        case 'P':
          e.preventDefault();
          onTogglePlay();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onRequestReset();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          onSkipNext();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          onToggleDark();
          break;
        // c：關掉畫面上的通知
        case 'c':
        case 'C':
          e.preventDefault();
          onDismissNotification();
          break;
        case 'Escape':
          onCancel();
          onDismissNotification();
          break;
        // 上一個焦點：h / k / 左 / 上
        case 'h':
        case 'H':
        case 'k':
        case 'K':
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(-1);
          break;
        // 下一個焦點：l / j / 右 / 下
        case 'l':
        case 'L':
        case 'j':
        case 'J':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onTogglePlay,
    onRequestReset,
    onSkipNext,
    onToggleDark,
    onCancel,
    onDismissNotification,
    focusRefs,
  ]);
};
