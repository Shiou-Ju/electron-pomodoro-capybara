import React from 'react';

const App: React.FC = () => {
  return (
    <div>
      <h1>Capybara Pomodoro</h1>
      <p>Version: {window.electronAPI.getVersion()}</p>
    </div>
  );
};

export default App;
