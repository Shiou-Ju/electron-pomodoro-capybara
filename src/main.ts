import { app, BrowserWindow, Notification, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
import { layouts } from './renderer/themes/layouts';
import electronLocalshortcut from 'electron-localshortcut';


// 記住目前還在畫面上的通知，供「c / Esc 一鍵關閉」使用
const activeNotifications = new Set<Notification>();

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

    activeNotifications.add(notification);
    // banner 自動消失或被點掉時自清，避免留下無效 reference
    notification.on('close', () => activeNotifications.delete(notification));

    notification.show();
  }
});

// 關閉所有還在畫面上的通知（鍵盤快捷鍵觸發）
ipcMain.on('dismiss-notification', () => {
  activeNotifications.forEach((n) => n.close());
  activeNotifications.clear();
});

// 保存當前布局狀態
let currentLayout: 'portrait' | 'landscape' = 'landscape';

function createWindow(layoutType: 'portrait' | 'landscape' = 'landscape') {
  currentLayout = layoutType;
  const { width, height } = layouts[currentLayout].window;
  
  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    },
    backgroundColor: '#FFFFFF',
    show: false,
    resizable: false  // 防止用戶調整視窗大小
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

  // 註冊快捷鍵
  electronLocalshortcut.register(mainWindow, 'CommandOrControl+L', () => {
    const newLayout = currentLayout === 'portrait' ? 'landscape' : 'portrait';
    const { width, height } = layouts[newLayout].window;
    
    mainWindow.setSize(width, height);
    mainWindow.center();
    
    currentLayout = newLayout;
    
    mainWindow.webContents.send('toggle-layout');
  });

  // 清理快捷鍵
  mainWindow.on('close', () => {
    electronLocalshortcut.unregisterAll(mainWindow);
  });
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
