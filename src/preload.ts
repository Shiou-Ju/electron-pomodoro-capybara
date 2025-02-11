import { contextBridge } from 'electron';

// 這裡可以定義要暴露給渲染進程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 之後可以加入番茄鐘相關的功能
  getVersion: () => process.versions.electron,
});
