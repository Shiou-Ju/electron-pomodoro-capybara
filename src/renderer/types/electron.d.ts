export interface ElectronAPI {
  getVersion: () => string;
  sendNotification: (title: string, body: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
