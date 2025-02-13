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
4. 現在 app name ，但是希望是中文，然後再 spotlight 搜尋的時候，可以搜尋到 英文

## refactor
1. 修改背景為粉紅色



# app name issue
但是我看另外一款 app 

他在資料夾是`番茄鐘`

但是我在 spotlight 打 tomato 找得到他？ 

## 解釋
在 macOS 平台上，應用程序的名稱在不同情況下可能會有所不同。具體如下：

* 在 Finder 中，應用程序的名稱是根據 `productName` 定義的，即「卡皮巴拉番茄鐘」。
* 在 Spotlight 搜尋時，系統會使用以下關鍵字進行匹配：
  + capybara（來自 InfoPlist.strings）
  + pomodoro（來自 InfoPlist.strings）
  + 卡皮巴拉（來自 productName）
  + 番茄鐘（來自 productName）


