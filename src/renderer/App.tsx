import React, { useEffect } from 'react';
import { usePomodoro } from './hooks/usePomodoro';
import {
  Container,
  Title,
  Timer,
  Button,
  CapybaraImage,
  ContentWrapper,
  ButtonGroup,
  CompletedText,
} from './components/styled';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const { state, startTimer, pauseTimer, resetTimer } = usePomodoro();

  useEffect(() => {
    if (state.timeLeft === 0) {
      const message = state.mode === 'focus' ? '該休息一下嘍！' : '繼續努力～';

      window.electronAPI.sendNotification('卡皮巴拉番茄鐘', message);
    }
  }, [state.timeLeft, state.mode]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Container>
      <Title>卡皮巴拉番茄鐘</Title>

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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={state.isRunning ? pauseTimer : startTimer}
          >
            {state.isRunning ? '暫停' : '開始'}
          </Button>

          <Button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
          >
            重置
          </Button>
        </ButtonGroup>

        <CompletedText>完成的番茄鐘: {state.completedPomodoros}</CompletedText>
      </ContentWrapper>
    </Container>
  );
};

export default App;
