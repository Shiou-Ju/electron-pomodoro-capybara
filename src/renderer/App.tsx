import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ThemeProvider, Global, css } from '@emotion/react';
import { usePomodoro } from './hooks/usePomodoro';
import { useTimer } from './hooks/useTimer';
import { useStreak } from './hooks/useStreak';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { buildTheme } from './themes/colors';
import {
  Container,
  Title,
  Timer,
  Button,
  ToggleButton,
  ModeToggleButton,
  CapybaraImage,
  ContentWrapper,
  ButtonGroup,
  Stepper,
  StepButton,
  MinutesDisplay,
  MinutesUnit,
  MinutesInput,
  StreakText,
} from './components/styled';
import { AnimatePresence } from 'framer-motion';

const THEME_STORAGE_KEY = 'capybara-theme';
const APP_MODE_STORAGE_KEY = 'capybara-app-mode';
const RESET_CONFIRM_TIMEOUT = 3000;

type AppMode = 'pomodoro' | 'timer';

// 初始主題：優先讀 localStorage，無值則跟隨系統深淺色（同步讀取以避免閃白）
const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialAppMode = (): AppMode =>
  localStorage.getItem(APP_MODE_STORAGE_KEY) === 'timer' ? 'timer' : 'pomodoro';

const App: React.FC = () => {
  const { streak, addStreak } = useStreak();
  const pomodoro = usePomodoro(undefined, () => addStreak(1));
  const timer = useTimer((gained) => addStreak(gained));

  const [appMode, setAppMode] = useState<AppMode>(getInitialAppMode);
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('landscape');
  const [resetArmed, setResetArmed] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(getInitialDarkMode);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isTimer = appMode === 'timer';

  const playButtonRef = useRef<HTMLButtonElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const modeButtonRef = useRef<HTMLButtonElement>(null);
  const darkButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // theme 同時依「明暗」與「目前模式」計算：計時器用琥珀，否則跟番茄鐘模式
  const accentKey = isTimer ? 'timer' : pomodoro.state.mode;
  const theme = useMemo(
    () => buildTheme(isDark, accentKey),
    [isDark, accentKey],
  );

  // 開窗自動 focus 啟動鈕：一進來按 Enter/Space 即可開始（免滑鼠）
  useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  // 持久化主題與模式偏好
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(APP_MODE_STORAGE_KEY, appMode);
  }, [appMode]);

  // 番茄鐘倒數結束通知（沿用既有行為；計時器的通知在 useTimer 內處理）
  useEffect(() => {
    if (!isTimer && pomodoro.state.timeLeft === 0) {
      const message =
        pomodoro.state.mode === 'focus' ? '該休息一下嘍！' : '繼續努力～';
      window.electronAPI.sendNotification('卡皮巴拉番茄鐘', message);
    }
  }, [isTimer, pomodoro.state.timeLeft, pomodoro.state.mode]);

  useEffect(() => {
    // 監聽來自 main process 的切換信號；回傳 unsubscribe 供 cleanup（避免重複註冊）
    const unsubscribe = window.electronAPI.onToggleLayout(() => {
      setLayout((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
    });
    return unsubscribe;
  }, []);

  // 進入分鐘輸入時自動 focus 並全選
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const togglePlay = useCallback(() => {
    const running = isTimer ? timer.state.isRunning : pomodoro.state.isRunning;
    if (running) {
      isTimer ? timer.pauseTimer() : pomodoro.pauseTimer();
    } else {
      isTimer ? timer.startTimer() : pomodoro.startTimer();
    }
  }, [isTimer, timer, pomodoro]);

  const resetActive = useCallback(() => {
    if (isTimer) timer.resetTimer();
    else pomodoro.resetTimer();
  }, [isTimer, timer, pomodoro]);

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
      resetActive();
    } else {
      setResetArmed(true);
      resetTimeoutRef.current = setTimeout(() => {
        resetTimeoutRef.current = null;
        setResetArmed(false);
      }, RESET_CONFIRM_TIMEOUT);
    }
  }, [resetArmed, disarmReset, resetActive]);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // 切換番茄鐘 ⇄ 計時器：暫停兩邊計時、解除重置確認與輸入狀態
  const toggleMode = useCallback(() => {
    timer.pauseTimer();
    pomodoro.pauseTimer();
    disarmReset();
    setEditing(false);
    setAppMode((prev) => (prev === 'timer' ? 'pomodoro' : 'timer'));
  }, [timer, pomodoro, disarmReset]);

  // 以 ref 穩定 toggleMode，讓監聽 effect 只註冊一次（toggleMode 每 render 會重建）
  const toggleModeRef = useRef(toggleMode);
  toggleModeRef.current = toggleMode;

  // 監聽 Cmd+T 切換模式（deps []，配合 cleanup 只註冊一次）
  useEffect(() => {
    const unsubscribe = window.electronAPI.onToggleMode(() => {
      toggleModeRef.current();
    });
    return unsubscribe;
  }, []);

  const dismissNotification = useCallback(() => {
    window.electronAPI.dismissNotification();
  }, []);

  // gi：進入分鐘直接輸入（僅計時器設定狀態）
  const enterInput = useCallback(() => {
    if (!isTimer || timer.state.hasStarted) return;
    setInputValue(String(timer.state.minutes));
    setEditing(true);
  }, [isTimer, timer.state.hasStarted, timer.state.minutes]);

  const commitInput = useCallback(() => {
    const n = parseInt(inputValue, 10);
    if (!Number.isNaN(n)) timer.setMinutes(n);
    setEditing(false);
  }, [inputValue, timer]);

  const cancelInput = useCallback(() => {
    setEditing(false);
  }, []);

  const noop = useCallback(() => {}, []);

  // 解除 timeout，避免 unmount 後觸發 setState
  useEffect(
    () => () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    },
    [],
  );

  const focusRefs = useMemo(
    () => [playButtonRef, resetButtonRef, modeButtonRef, darkButtonRef],
    [],
  );

  useKeyboardControls({
    onTogglePlay: togglePlay,
    onRequestReset: requestReset,
    onSkipNext: isTimer ? noop : pomodoro.skipToNext,
    onToggleDark: toggleDark,
    onCancel: disarmReset,
    onDismissNotification: dismissNotification,
    focusRefs,
    onIncrement: isTimer ? timer.increment : undefined,
    onDecrement: isTimer ? timer.decrement : undefined,
    onEnterInput: isTimer ? enterInput : undefined,
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const isRunning = isTimer ? timer.state.isRunning : pomodoro.state.isRunning;
  // key 用實際圖片：番茄(focus) ⇄ 計時 同圖不重播動畫，切換才會即時無延遲
  const imageMode = isTimer ? 'focus' : pomodoro.state.mode;
  const title = isTimer ? '卡皮巴拉計時器' : '卡皮巴拉番茄鐘';

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
        <ModeToggleButton
          ref={modeButtonRef}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMode}
          title="切換番茄鐘 / 計時器 (Cmd+T)"
          aria-label="切換番茄鐘或計時器模式"
        >
          {isTimer ? '計時' : '番茄'}
        </ModeToggleButton>

        <ToggleButton
          ref={darkButtonRef}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          title="切換深色模式 (d)"
          aria-label="切換深色模式"
        >
          {isDark ? '暗' : '亮'}
        </ToggleButton>

        <Title layout={layout}>{title}</Title>

        <ContentWrapper>
          <AnimatePresence mode="wait">
            <CapybaraImage
              key={imageMode}
              src={`assets/capybara-${imageMode}.png`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {isTimer && !timer.state.hasStarted ? (
            editing ? (
              <MinutesInput
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={inputValue}
                onChange={(e) =>
                  setInputValue(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitInput();
                  else if (e.key === 'Escape') cancelInput();
                }}
                onBlur={commitInput}
                aria-label="輸入分鐘數"
              />
            ) : (
              <Stepper>
                <StepButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={timer.decrement}
                  aria-label="減一分鐘"
                >
                  −
                </StepButton>
                <MinutesDisplay>
                  {timer.state.minutes}
                  <MinutesUnit>分</MinutesUnit>
                </MinutesDisplay>
                <StepButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={timer.increment}
                  aria-label="加一分鐘"
                >
                  +
                </StepButton>
              </Stepper>
            )
          ) : (
            <Timer>
              {formatTime(
                isTimer ? timer.state.timeLeft : pomodoro.state.timeLeft,
              )}
            </Timer>
          )}

          <ButtonGroup>
            <Button
              ref={playButtonRef}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
            >
              {isRunning ? '暫停' : '開始'}
            </Button>

            <Button
              ref={resetButtonRef}
              armed={resetArmed}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={requestReset}
              onBlur={disarmReset}
            >
              {resetArmed ? '確認重置？' : '重置'}
            </Button>
          </ButtonGroup>

          <StreakText>完成的番茄鐘: {streak.toFixed(2)}</StreakText>
        </ContentWrapper>
      </Container>
    </ThemeProvider>
  );
};

export default App;
