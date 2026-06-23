import { useEffect, useRef } from 'react';

type FocusRef = React.RefObject<HTMLElement | null>;

interface KeyboardControlsOptions {
  onTogglePlay: () => void; // p：開始 / 暫停
  onRequestReset: () => void; // r：請求重置（需二次確認）
  onSkipNext: () => void; // n：跳到下一階段
  onToggleDark: () => void; // d：切換暗黑模式
  onCancel: () => void; // Esc：取消（例如解除重置確認）
  onDismissNotification: () => void; // c / Esc：關掉畫面上的通知
  focusRefs: FocusRef[]; // h/l、方向鍵在這些控制間移動焦點
  onIncrement?: () => void; // + / =：計時器加 1 分
  onDecrement?: () => void; // -：計時器減 1 分
  onEnterInput?: () => void; // gi：進入分鐘直接輸入
}

// g 前綴 chord 的有效時間窗（gi）
const CHORD_TIMEOUT = 500;

/**
 * 在 window 上掛一個 keydown listener，提供 vim 風格的鍵盤操作。
 * 焦點在 app 視窗內時生效；保留帶修飾鍵的快捷鍵（如 Cmd+L 切換佈局）。
 * Enter / Space 啟動目前 focus 的按鈕，沿用原生 button 行為，這裡不攔截。
 * 計時器模式額外支援 + / − 調整分鐘、gi 進入直接輸入。
 *
 * options 以 ref 保存，listener 只在 mount 註冊一次（deps []），
 * 避免每 render 重新訂閱而把進行中的 gi chord 清掉。
 */
export const useKeyboardControls = (options: KeyboardControlsOptions) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 記住「g」是否在等待後續鍵（chord），與其逾時計時器
  const pendingGRef = useRef(false);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearChord = () => {
      pendingGRef.current = false;
      if (chordTimerRef.current) {
        clearTimeout(chordTimerRef.current);
        chordTimerRef.current = null;
      }
    };

    const moveFocus = (dir: 1 | -1) => {
      const els = optionsRef.current.focusRefs
        .map((ref) => ref.current)
        .filter((el): el is HTMLElement => el !== null);
      if (els.length === 0) return;

      const currentIdx = els.findIndex((el) => el === document.activeElement);
      const nextIdx =
        currentIdx === -1 ? 0 : (currentIdx + dir + els.length) % els.length;
      els[nextIdx].focus();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 焦點在輸入框時，交給輸入框自己處理（Enter/Esc 等），不攔截 vim 鍵
      const active = document.activeElement;
      if (active instanceof HTMLInputElement) return;

      // 保留系統 / 既有的修飾鍵快捷鍵（Cmd+L 切換佈局、Cmd+R reload 等）
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // 避免長按重複觸發動作
      if (e.repeat) return;

      const {
        onTogglePlay,
        onRequestReset,
        onSkipNext,
        onToggleDark,
        onCancel,
        onDismissNotification,
        onIncrement,
        onDecrement,
        onEnterInput,
      } = optionsRef.current;

      // g 前綴 chord：g 後接 i → 進入分鐘輸入（僅在有 onEnterInput 時生效）
      if (pendingGRef.current) {
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          clearChord();
          onEnterInput?.();
          return;
        }
        // 其他鍵則取消 chord，繼續往下正常處理
        clearChord();
      }

      switch (e.key) {
        case 'g':
        case 'G':
          // 無對應功能時不攔截、也不起 chord
          if (!onEnterInput) break;
          e.preventDefault();
          pendingGRef.current = true;
          chordTimerRef.current = setTimeout(clearChord, CHORD_TIMEOUT);
          break;
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
        // + / =：計時器加 1 分（無 handler 時不攔截）
        case '+':
        case '=':
          if (!onIncrement) break;
          e.preventDefault();
          onIncrement();
          break;
        // -：計時器減 1 分（無 handler 時不攔截）
        case '-':
          if (!onDecrement) break;
          e.preventDefault();
          onDecrement();
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearChord();
    };
  }, []);
};
