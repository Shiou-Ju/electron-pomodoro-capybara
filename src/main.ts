import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// 加入這段在檔案開頭
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
    forceHardReset: true
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/assets/capybara-longBreak.png')
  });

  // TODO: 註解掉測試 release 是否有問題
  // // 新增：設定應用程式圖示
  const isMac = process.platform === 'darwin';
  const isDev = process.env.NODE_ENV === 'development';
  if (isMac && isDev) {
    app.dock.setIcon(path.resolve(__dirname, '../public/assets/capybara-longBreak.png'));
  }

  // 開發環境使用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadFile('dist/renderer/index.html');
    // TODO: if needed, open devtools
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
