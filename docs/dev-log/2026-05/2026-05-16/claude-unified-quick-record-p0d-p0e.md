# P0-D + P0-E｜统一入口挂载 + 统一快捷键

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：30f251d feat(app): add unified quick record shell

## 本轮目标

一步到位完成：
1. P0-D：主工作区挂载 UnifiedQuickRecordFloat
2. P0-E：统一快捷键 `CommandOrControl+Alt+R`
3. 旧快捷键兼容到统一入口

## 实现

### P0-D：主工作区挂载（已在 7710920 完成）

`app/renderer/src/pages/MainWorkspacePage.tsx`
- 替换 `TimeDebtQuickFloat` 为 `UnifiedQuickRecordFloat`
- 统一入口在所有页面可见

`app/renderer/src/features/wealth/WealthDashboard.tsx`
- 移除 `WealthQuickRecordFloat` 挂载
- 避免 Wealth 页面出现两个浮窗

### P0-E：统一快捷键

#### main (`app/main/index.ts`)

新增：
- `quickRecordOpenChannel = 'quick-record:open'`
- `preferredQuickRecordShortcut = 'CommandOrControl+Alt+R'`
- `sendQuickRecordOpen(window, mode)` — 发送 `quick-record:open` IPC 事件 + mode
- `openQuickRecordChoose()` — 快捷键回调，发送 mode='choose'
- `registerQuickRecordShortcut()` — 注册 `Cmd+Alt+R`

旧快捷键兼容：
- Time Debt 快捷键 (`Cmd+Alt+T`) → `sendQuickRecordOpen(window, 'time')`
- Wealth 快捷键 (`Cmd+Alt+Z`) → `sendQuickRecordOpen(window, 'wealth')`

不再通过旧 IPC channel 打开旧浮窗。

#### preload (`app/preload/index.ts`)

新增：
- `quickRecordOpenChannel` 常量
- `quickRecord.onOpenQuickRecord(callback)` — 监听 `quick-record:open` 事件，接收 mode 参数

#### contracts (`app/shared/contracts.ts`)

新增：
- `quickRecord.onOpenQuickRecord(callback: (mode: 'choose' | 'time' | 'wealth') => void): () => void`

#### renderer (`UnifiedQuickRecordFloat.tsx`)

新增 `useEffect` 监听 `window.growthTree.quickRecord.onOpenQuickRecord`：
- 打开浮窗（`isOpen: true`）
- mode='time' → 切到记录时间
- mode='wealth' → 切到记录财富
- mode='choose' → 保持当前选中 tab

### 快捷键行为总结

| 快捷键 | mode | 效果 |
|---|---|---|
| `Cmd+Alt+R` (新) | choose | 打开统一入口，显示类型选择 |
| `Cmd+Alt+T` (旧 Time Debt) | time | 打开统一入口，直接切到记录时间 |
| `Cmd+Alt+Z` (旧 Wealth) | wealth | 打开统一入口，直接切到记录财富 |

## 验证

- pnpm typecheck 通过
- pnpm build 通过

## 不做的事

- 不删除旧组件源码
- 不改 Settings 页面快捷键设置项
- 不改投资/行情/Review/Reminders 业务逻辑
