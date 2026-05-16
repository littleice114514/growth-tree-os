# Wealth 全局快捷键｜C 路线开发记录

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：be228ab feat(wealth): add quick record float window

## 本轮目标

新增系统快捷键 `CommandOrControl+Alt+Z`（Mac: Option + Command + Z），用于唤出/收起 Wealth 快捷记录浮窗。

## 实现

完全复用 Time Debt 快捷键的架构模式：

### Main process（app/main/index.ts）

- 新增 IPC channel：`wealth:open-quick-float`
- 新增快捷键：`CommandOrControl+Alt+Z`
- `openWealthQuickFloat()`：显示/聚焦窗口，发送 IPC 事件
- `sendWealthQuickFloat()`：处理 loading 状态下的延迟发送
- `registerWealthShortcut()`：注册 globalShortcut，失败时安全输出日志
- 在 `app.whenReady` 中调用 `registerWealthShortcut()`
- `will-quit` 时 `globalShortcut.unregisterAll()` 已覆盖（共享）

### Preload（app/preload/index.ts）

- 新增 channel 常量：`wealthOpenQuickFloatChannel`
- 在 api 对象中新增 `wealth.onOpenQuickFloat(callback)` 回调
- 返回清理函数，与 timeDebt 模式一致

### Contracts（app/shared/contracts.ts）

- `GrowthTreeApi` 新增 `wealth` 命名空间
- 类型：`onOpenQuickFloat(callback: () => void): () => void`

### Renderer（WealthQuickRecordFloat.tsx）

- 新增 `useEffect` 监听 `window.growthTree.wealth.onOpenQuickFloat`
- 触发时切换浮窗展开/收起状态（`setIsOpen(prev => !prev)`）
- 组件卸载时自动清理监听（返回 cleanup 函数）

## 文件变更

- `app/main/index.ts`（修改：新增 Wealth 全局快捷键注册 + IPC 发送）
- `app/preload/index.ts`（修改：新增 wealth channel + onOpenQuickFloat 暴露）
- `app/shared/contracts.ts`（修改：新增 wealth 命名空间类型）
- `app/renderer/src/features/wealth/WealthQuickRecordFloat.tsx`（修改：新增快捷键监听）

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- 未修改 Time Debt 业务文件
- 未修改 MainWorkspacePage

## 手动验收步骤

1. pnpm dev
2. 进入 Wealth 页面
3. 按 Option + Command + Z（Mac）或 Ctrl + Alt + Z（Windows）
4. Wealth 快捷记录浮窗打开
5. 再按一次，浮窗收起
6. Time Debt 快捷键（Command+Option+T）仍不受影响
