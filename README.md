# electron-pomodoro-capybara


- 標準番茄鐘計時（25分鐘）
- 短休息時間（5分鐘）
- 長休息時間（10分鐘，每4個番茄鐘後）



## fix
1. src/preload.ts 同時導入了 ipcRenderer（雖然未使用）與暴露 sendNotification API，使用原生 Notification API 實作簡單通知，符合需求。
2. 現在的視窗調整
   1. 可能調成 1200 比較好看
   2. 在 src/main.ts 中修改了視窗尺寸（從 800x600 改成 600x1000），這是預期中的 UI 調整。
3. 現在時間經過如果在背景
   1. 大概是一半
   2. 如果沒有 focus 
4. 修正專心的圖片不要有眼鏡




