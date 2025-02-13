# electron-pomodoro-capybara


- 標準番茄鐘計時（25分鐘）
- 短休息時間（5分鐘）
- 長休息時間（10分鐘，每4個番茄鐘後）



## fix
1. src/preload.ts 同時導入了 ipcRenderer（雖然未使用）與暴露 sendNotification API，使用原生 Notification API 實作簡單通知，符合需求。
2. 現在的視窗調整
   1. 可能調成 1200 比較好看
   2. 在 src/main.ts 中修改了視窗尺寸（從 800x600 改成 600x1000），這是預期中的 UI 調整。
3. dev 環境的通知是 electron 的，生產環境的不確定

## refactor
1. 修改背景為粉紅色









