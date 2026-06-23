export interface ElectronAPI {
  getVersion: () => string;
  sendNotification: (title: string, body: string) => void;
  dismissNotification: () => void;
  onToggleLayout: (callback: () => void) => () => void;
  onToggleMode: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
