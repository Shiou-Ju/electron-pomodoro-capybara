# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

Capybara Pomodoro（卡皮巴拉番茄鐘）是一個 Electron + React 19 桌面番茄鐘應用，使用 TypeScript、Emotion（CSS-in-JS）與 Framer Motion。套件管理使用 **pnpm**（有 `pnpm-lock.yaml`，`packageManager: pnpm@10.12.1`）。Electron 需在 `package.json` 的 `pnpm.onlyBuiltDependencies` 列入 `electron` 才會 build binary；`.npmrc` 設 `node-linker=hoisted` 避免多版本 @types 型別衝突。

## 常用指令

```bash
pnpm install        # 安裝相依（electron binary 會自動 build）
pnpm dev            # 開發：清 dist → 建 renderer bundle → tsc → 同時 watch + 啟動 electron
pnpm build          # 生產建置：webpack(renderer) + tsc(main/preload)
pnpm start          # 僅以 development 模式啟動 electron（需先 build 過）
pnpm format         # prettier 格式化 src 下所有檔案

# 打包（electron-builder，輸出至 release/）
pnpm package        # mac + win + linux
pnpm package:mac    # 僅 macOS（dmg）

pnpm test           # 單元測試（Vitest，跑一次）
pnpm test:watch     # 單元測試 watch 模式

npx tsc --noEmit    # 型別檢查（無專用 typecheck script）
```

**Lint 現況**：`eslint.config.mjs` 仍是舊式（eslintrc）格式，在 ESLint 9 flat config 下實際不生效（`npx eslint src` 會回報全檔 ignored）。目前品質把關靠 `npx tsc --noEmit`（型別）＋ `pnpm format`（prettier）。

**測試**：用 **Vitest**。純函式測試與其原始檔同放於 `src/renderer/utils/`（如 `streak.ts` / `streak.test.ts`）。`tsconfig.json` 以 `exclude: ["**/*.test.ts"]`、electron-builder `build.files` 以 `!dist/**/*.test.*` 確保測試檔不進 `dist`／打包。React hook 邏輯偏好抽成純函式再測（避免 DOM 環境）。

## 建置架構（兩段式編譯，關鍵）

這是理解本專案最重要的一點：**main/preload process 與 renderer process 用不同工具編譯，產物路徑不同**。

- **Renderer（React）** 由 **webpack**（`webpack.renderer.config.js`）編譯
  - entry：`src/renderer/index.tsx` → 輸出 `dist/renderer/bundle.js`
  - `copy-webpack-plugin` 把 `src/renderer/index.html` 與整個 `public/`（含 `public/assets/` 圖片）複製到 `dist/renderer/`
- **Main + Preload** 由 **tsc**（`tsconfig.json`，commonjs）編譯到 `dist/`
  - `dist/main.js` 是 app 進入點（package.json `main`）
  - `src/preload.ts` → `dist/preload.js`，main.ts 以 `path.join(__dirname, 'preload.js')` 載入

修改 main 或 preload 後，純跑 webpack 不會生效，需 tsc 重編。`pnpm dev` 的 watch 同時跑 `webpack --watch` 與 `tsc --watch` 處理這兩條線。

## 執行期架構

三個進程層，透過 contextBridge + IPC 溝通（`contextIsolation: true`、`nodeIntegration: false`）：

1. **Main（`src/main.ts`）**：建立 `BrowserWindow`（`resizable: false`）、處理系統通知、註冊全域快捷鍵。
2. **Preload（`src/preload.ts`）**：用 `contextBridge.exposeInMainWorld('electronAPI', ...)` 暴露 `getVersion` / `sendNotification` / `dismissNotification` / `onToggleLayout` / `onToggleMode` 給 renderer。型別定義在 `src/renderer/types/electron.d.ts`。
3. **Renderer（`src/renderer/`）**：React app。`App.tsx` 持有 `appMode`（`'pomodoro' | 'timer'`，localStorage `capybara-app-mode`），同時掛載 `usePomodoro` 與 `useTimer` 兩個 hook，依 `appMode` 決定渲染哪一套並接線；計數由 `useStreak` 統一管理。倒數計時邏輯（rAF + `Date.now()` delta）抽在共用的 `useCountdownTick`，番茄鐘與計時器都用它。

### 番茄鐘狀態機（`src/renderer/hooks/usePomodoro.ts`）

- 計時用 `requestAnimationFrame` + `Date.now()` 計算 delta（非固定 setInterval），`focus → shortBreak/longBreak → focus` 循環，每 `cyclesBeforeLongBreak`（4）次 focus 後進長休息。
- 計時長度來自 `src/renderer/config/pomodoro.config.ts`：**dev 用秒級短時間（focus 3 秒）方便測試，prod 才是 25/5/10 分鐘**，由 `process.env.NODE_ENV` 切換。

### 雙佈局（portrait / landscape）切換

- `CommandOrControl+L` 經 **electron-localshortcut**（非 `globalShortcut`）註冊在視窗上（`src/main.ts`）。觸發時 main 同時 `setSize` 改視窗尺寸並 `webContents.send('toggle-layout')` 通知 renderer 改 CSS 佈局。
- 兩邊的視窗尺寸與樣式定義都來自 **`src/renderer/themes/layouts.ts`**（被 main 與 renderer 共用）。改佈局尺寸請改這一處。
- 快捷鍵在視窗 `close` 事件 `unregisterAll`（順序很重要，需在視窗銷毀前）。

### 通知關閉（`c` / `Esc`）

- main（`src/main.ts`）用一個 `Set<Notification>` 記住目前在畫面上的通知；每個通知 `on('close')` 時自清。renderer 按 `c` 或 `Esc` → `dismissNotification()` → `dismiss-notification` IPC → main 把 Set 內所有通知 `close()`。
- 純加法，**不更動兩處 `sendNotification` 的送出邏輯**（見下方「通知邏輯重複」）。

### 計時器模式（`src/renderer/hooks/useTimer.ts`）

- 有別於番茄鐘循環，計時器是**純倒數**：只支援分鐘（內部仍秒級倒數，用 `useCountdownTick`）。
- 設定狀態（未開始）顯示步進器 `− 分 +`；`+/-`（鍵盤 `+`/`=`/`-`）±1 分，`gi`（vim 風格 g 前綴 chord，見 `useKeyboardControls`）進入直接輸入。範圍 `MIN_MINUTES`(1)–`MAX_MINUTES`(9999)。
- `Cmd+T` 經 electron-localshortcut 註冊在視窗（`src/main.ts`，與 `Cmd+L` 同模式），`webContents.send('toggle-mode')` 通知 renderer 切 `appMode`；切換時暫停兩邊計時。
- 強調色：計時器用暖琥珀，定義在 `src/renderer/themes/colors.ts`（`AccentKey = PomodoroMode | 'timer'`，亮色另有加深版）。
- 結束時發系統通知但**不**自動進下一階段；圖片沿用 `capybara-focus.png`。

### streak（`src/renderer/hooks/useStreak.ts` + `utils/streak.ts`）

- 番茄鐘與計時器**共用**單一累積值，存 localStorage `capybara-streak`。番茄完成 +1、計時結束 +`分鐘/25`（25 分 = 1.00）。
- 計算為純函式集中在 `src/renderer/utils/streak.ts`（`round2` / `minutesToStreak` / `addStreak` / `clampMinutes`），有對應單元測試。
- 兩模式底部統一顯示「完成的番茄鐘: X.XX」（小數 2 位）。

## 已知的待整理處（與 main 分支現況相關）

- **通知邏輯重複**：`App.tsx` 的 `useEffect` 與 `usePomodoro.ts` 內各有一份番茄鐘 `sendNotification`，兩者都在 `timeLeft === 0` 時觸發。改通知行為時注意兩處。
- `usePomodoro.ts` 的 `getNextState` 被標註「not used」但實際上有被 effect 呼叫——修改前先確認實際引用。

## 平台慣例

- macOS 專屬：`app.setName('Capybara Pomodoro')`（英文供 Spotlight 搜尋）、`app.dock.setIcon`、`setActivationPolicy('regular')`。productName 中文「Capybara Pomodoro」/ 番茄鐘的本地化在 electron-builder 的 `CFBundleLocalizations`（en, zh_TW）。
- 圖片資源命名對應 mode：`assets/capybara-${mode}.png`（`capybara-focus.png` / `capybara-shortBreak.png` / `capybara-longBreak.png`），renderer 以相對路徑 `assets/...` 載入（對應 `public/assets/`）。
