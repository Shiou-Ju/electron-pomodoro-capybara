import { contextBridge, ipcRenderer } from 'electron';

// 這裡可以定義要暴露給渲染進程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 之後可以加入番茄鐘相關的功能
  getVersion: () => process.versions.electron,
  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  dismissNotification: () => {
    ipcRenderer.send('dismiss-notification');
  },
  // 回傳 unsubscribe，供 renderer effect cleanup，避免重複註冊累積 listener
  onToggleLayout: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-layout', handler);
    return () => ipcRenderer.removeListener('toggle-layout', handler);
  },
  onToggleMode: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-mode', handler);
    return () => ipcRenderer.removeListener('toggle-mode', handler);
  },
});
