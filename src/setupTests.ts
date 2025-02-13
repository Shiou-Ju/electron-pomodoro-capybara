import '@testing-library/jest-dom';

jest.mock('./renderer/config/pomodoro.config', () => ({
  getPomodoroSettings: jest.fn().mockReturnValue({
    focusTime: 180,
    shortBreakTime: 60,
    longBreakTime: 120,
    cyclesBeforeLongBreak: 4
  })
}));

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: {
    sendNotification: jest.fn(),
    getVersion: jest.fn()
  }
}); 