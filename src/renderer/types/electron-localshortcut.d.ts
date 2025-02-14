declare module 'electron-localshortcut' {
  import { BrowserWindow } from 'electron';
  
  export function register(win: BrowserWindow, accelerator: string, callback: () => void): void;
  export function unregisterAll(win: BrowserWindow): void;
} 