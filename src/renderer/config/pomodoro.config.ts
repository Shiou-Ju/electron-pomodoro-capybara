export const devSettings = {
  focusTime: 3,
  shortBreakTime: 3,
  longBreakTime: 5,
  cyclesBeforeLongBreak: 4,
};

export const prodSettings = {
  focusTime: 25 * 60,
  shortBreakTime: 5 * 60,
  longBreakTime: 10 * 60,
  cyclesBeforeLongBreak: 4,
};

export const getPomodoroSettings = () => {
  return process.env.NODE_ENV === 'development' ? devSettings : prodSettings;
}; 