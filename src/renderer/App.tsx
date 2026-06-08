import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ThemeProvider, Global, css } from '@emotion/react';
import { usePomodoro } from './hooks/usePomodoro';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { buildTheme } from './themes/colors';
import {
  Container,
  Title,
  Timer,
  Button,
  ToggleButton,
  CapybaraImage,
  ContentWrapper,
  ButtonGroup,
  CompletedText,
} from './components/styled';
import { AnimatePresence } from 'framer-motion';

const THEME_STORAGE_KEY = 'capybara-theme';
const RESET_CONFIRM_TIMEOUT = 3000;

// 初始主題：優先讀 localStorage，無值則跟隨系統深淺色（同步讀取以避免閃白）
const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const App: React.FC = () => {
  const { state, startTimer, pauseTimer, resetTimer, skipToNext } =
    usePomodoro();
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('landscape');
  const [resetArmed, setResetArmed] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(getInitialDarkMode);

  const playButtonRef = useRef<HTMLButtonElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const darkButtonRef = useRef<HTMLButtonElement>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // theme 同時依「明暗」與「目前模式」計算（強調色隨模式變化）
  const theme = useMemo(
    () => buildTheme(isDark, state.mode),
    [isDark, state.mode],
  );

  // 開窗自動 focus 啟動鈕：一進來按 Enter/Space 即可開始（免滑鼠）
  useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  // 持久化主題偏好
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (state.timeLeft === 0) {
      const message = state.mode === 'focus' ? '該休息一下嘍！' : '繼續努力～';

      window.electronAPI.sendNotification('卡皮巴拉番茄鐘', message);
    }
  }, [state.timeLeft, state.mode]);

  useEffect(() => {
    // 監聽來自 main process 的切換信號
    window.electronAPI.onToggleLayout(() => {
      setLayout((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [state.isRunning, pauseTimer, startTimer]);

  const disarmReset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    setResetArmed(false);
  }, []);

  // 重置需二次確認：第一次進入「確認重置？」狀態，第二次才真正重置
  const requestReset = useCallback(() => {
    if (resetArmed) {
      disarmReset();
      resetTimer();
    } else {
      setResetArmed(true);
      resetTimeoutRef.current = setTimeout(() => {
        resetTimeoutRef.current = null;
        setResetArmed(false);
      }, RESET_CONFIRM_TIMEOUT);
    }
  }, [resetArmed, disarmReset, resetTimer]);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // 解除 timeout，避免 unmount 後觸發 setState
  useEffect(
    () => () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    },
    [],
  );

  const focusRefs = useMemo(
    () => [playButtonRef, resetButtonRef, darkButtonRef],
    [],
  );

  useKeyboardControls({
    onTogglePlay: togglePlay,
    onRequestReset: requestReset,
    onSkipNext: skipToNext,
    onToggleDark: toggleDark,
    onCancel: disarmReset,
    focusRefs,
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          body {
            background: ${theme.background};
            color: ${theme.textPrimary};
            transition:
              background 0.2s ease,
              color 0.2s ease;
          }
        `}
      />
      <Container layout={layout}>
        <Title layout={layout}>卡皮巴拉番茄鐘</Title>

        <ContentWrapper>
          <AnimatePresence mode="wait">
            <CapybaraImage
              key={state.mode}
              src={`assets/capybara-${state.mode}.png`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          <Timer>{formatTime(state.timeLeft)}</Timer>

          <ButtonGroup>
            <Button
              ref={playButtonRef}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
            >
              {state.isRunning ? '暫停' : '開始'}
            </Button>

            <Button
              ref={resetButtonRef}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={requestReset}
              onBlur={disarmReset}
            >
              {resetArmed ? '確認重置？' : '重置'}
            </Button>

            <ToggleButton
              ref={darkButtonRef}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDark}
              title="切換深色模式 (d)"
            >
              {isDark ? '☀ 亮色' : '☾ 深色'}
            </ToggleButton>
          </ButtonGroup>

          <CompletedText>
            完成的番茄鐘: {state.completedPomodoros}
          </CompletedText>
        </ContentWrapper>
      </Container>
    </ThemeProvider>
  );
};

export default App;
