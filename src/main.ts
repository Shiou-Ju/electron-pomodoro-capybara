import { app, BrowserWindow, Notification, ipcMain } from 'electron';
import * as path from 'path';


// 在 createWindow 函數之前加入這段
ipcMain.on('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ 
      title, 
      body,
      silent: false,
      icon: path.resolve(__dirname, '../public/assets/capybara-longBreak.png'),
      timeoutType: 'default',
      urgency: 'normal',
      actions: [{
        type: 'button',
        text: '確定'
      }]
    });
    
    notification.show();
  }
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    },
    backgroundColor: '#FFFFFF',  // 添加背景色
    show: false  // 先不顯示視窗
  });

  const isMac = process.platform === 'darwin';
  
  if (isMac) {
    app.setName('Capybara Pomodoro');  // 使用英文名稱
    app.dock.setIcon(path.resolve(__dirname, '../public/assets/capybara-longBreak.png'));
  }

  // 開發環境使用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadFile('dist/renderer/index.html');
    // TODO: if needed, open devtools
    // mainWindow.webContents.openDevTools();
  } else {
    // 使用 app.getAppPath() 來確保在打包後能正確找到檔案
    const indexPath = path.join(app.getAppPath(), 'dist', 'renderer', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // 等待內容準備好再顯示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 檢查通知權限
  if (Notification.isSupported()) {
    console.log('系統支援通知功能');
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    // 設定 macOS 的通知權限
    app.setActivationPolicy('regular');
  }
  
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
