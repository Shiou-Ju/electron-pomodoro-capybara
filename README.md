# electron-pomodoro-capybara

卡皮巴拉番茄鐘 — Electron + React 桌面番茄鐘 / 計時器。

## 功能

### 番茄鐘模式

- 標準番茄鐘計時（25 分鐘）
- 短休息（5 分鐘）
- 長休息（10 分鐘，每 4 個番茄鐘後）

### 計時器模式

- 純倒數計時，只支援分鐘
- 設定時間：`+` / `−` 每次 ±1 分，或 `gi` 直接輸入分鐘數（範圍 1–9999）
- 時間到發系統通知，不自動進入下一階段

### 共用

- **streak**：番茄鐘與計時器共用累積值（番茄完成 +1、計時 +分鐘/25），底部顯示「完成的番茄鐘: X.XX」，記錄於本機並跨啟動保留
- 暗黑模式（右上角切換，跟隨系統、記住偏好）

### 快捷鍵

- `p` 開始 / 暫停、`r` 重置（二次確認）、`n` 跳下一階段（番茄鐘）
- `+` / `=` 加 1 分、`-` 減 1 分、`gi` 輸入分鐘（計時器設定時）
- `d` 切換暗色、`c` / `Esc` 關閉通知
- `hjkl` / 方向鍵移動焦點
- `Cmd+T` 切換番茄鐘 / 計時器、`Cmd+L` 切換直式 / 橫式佈局

## 開發

套件管理使用 **pnpm**（`packageManager: pnpm@10.12.1`）。

```bash
pnpm install        # 安裝相依（electron binary 自動 build）
pnpm dev            # 開發模式（watch + 啟動 electron，計時為秒級方便測試）
pnpm build          # 生產建置
pnpm test           # 單元測試（Vitest）
pnpm package:mac    # 打包 macOS dmg，輸出至 release/
```

## 安裝（macOS）

DMG **未做程式碼簽章**，首次開啟會被 Gatekeeper 擋下。請對 app 按右鍵 →「打開」→ 確認，或到「系統設定 → 隱私權與安全性」放行。

## App 名稱與 Spotlight

在 macOS 上，Finder 顯示的是 `productName`「Capybara Pomodoro」；Spotlight 可用 `capybara`、`pomodoro`（來自 `InfoPlist.strings`）與中文「卡皮巴拉」「番茄鐘」搜尋到。
