export interface ElectronAPI {
  getVersion: () => string;
  sendNotification: (title: string, body: string) => void;
  onToggleLayout: (callback: () => void) => void;
  onReload: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
