import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { getPomodoroSettings } from './config/pomodoro.config';

jest.mock('./config/pomodoro.config', () => ({
  getPomodoroSettings: jest.fn()
}));

describe('番茄鐘基本功能測試', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (getPomodoroSettings as jest.Mock).mockReturnValue({
      focusTime: 180, // 3分鐘
      shortBreakTime: 60, // 1分鐘
      longBreakTime: 120, // 2分鐘
      cyclesBeforeLongBreak: 4
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  // 1. 基本功能測試
  test('點擊開始，確認計時器開始倒數', async () => {
    render(<App />);
    const startButton = screen.getByText('開始');
    
    fireEvent.click(startButton);
    
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    // 使用 formatTime 函數來確保格式一致
    expect(screen.getByText('02:59')).toBeInTheDocument();
  });

  test('點擊暫停，確認計時器停止', () => {
    render(<App />);
    const startButton = screen.getByText('開始');
    
    fireEvent.click(startButton);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    const pauseButton = screen.getByText('暫停');
    fireEvent.click(pauseButton);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('02:59')).toBeInTheDocument();
  });

  test('點擊重置，確認回到初始狀態', () => {
    render(<App />);
    const startButton = screen.getByText('開始');
    const resetButton = screen.getByText('重置');
    
    fireEvent.click(startButton);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    fireEvent.click(resetButton);
    
    expect(screen.getByText('03:00')).toBeInTheDocument();
  });
});

// 2. 狀態轉換測試
describe('番茄鐘狀態轉換測試', () => {
  test('專注時間結束後的狀態變化', async () => {
    render(<App />);
    const mockNotification = jest.spyOn(window.electronAPI, 'sendNotification');
    
    const startButton = screen.getByText('開始');
    fireEvent.click(startButton);
    
    await act(async () => {
      jest.advanceTimersByTime(180000); // 完整的 3 分鐘
    });
    
    expect(mockNotification).toHaveBeenCalledWith(
      '卡皮巴拉番茄鐘',
      '該休息一下嘍！'
    );
  });
});

// 3. 循環測試
describe('番茄鐘循環測試', () => {
  test('完成 4 個專注時段後進入長休息', async () => {
    render(<App />);
    
    for (let i = 0; i < 4; i++) {
      const startButton = screen.getByText('開始');
      fireEvent.click(startButton);
      
      await act(async () => {
        jest.advanceTimersByTime(180000); // 3分鐘
      });
      
      await act(async () => {
        jest.advanceTimersByTime(60000); // 1分鐘休息
      });
    }
    
    expect(screen.getByAltText(/capybara-longBreak/i)).toBeInTheDocument();
    expect(screen.getByText('完成的番茄鐘: 4')).toBeInTheDocument();
  });
}); 