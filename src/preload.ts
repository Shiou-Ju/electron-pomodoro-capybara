import { contextBridge, ipcRenderer } from 'electron';

// 這裡可以定義要暴露給渲染進程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 之後可以加入番茄鐘相關的功能
  getVersion: () => process.versions.electron,
  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  onToggleLayout: (callback: () => void) => {
    ipcRenderer.on('toggle-layout', () => callback());
  }
});
