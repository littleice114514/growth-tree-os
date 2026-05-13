# 开发日志｜Codex｜Time Debt 快速记录浮窗 A 线｜2026-05-13

## 1. 本轮目标

只推进 Time Debt 快速记录浮窗，不碰 Wealth 投资模块，不修改 project-state 三件套，不修改 `MAP_STATUS.md`，不改 Electron IPC / db / 依赖。

## 2. 旧设计回收

- 未找到完整 A/B/C/D 浮窗旧设计文件。
- 找到 Time Debt 既有计时闭环：`timeDebtActiveTimerStorage.ts`、`timeDebtStorage.ts`、`TimeDebtDashboard.tsx`。
- 找到 Toolbar 活跃计时提示：`Toolbar.tsx`。
- 找到 Time Debt 模块索引：`docs/handoff/TIME_DEBT_MODULE_INDEX.md`。
- 结论：A 线 App 内右下角快速记录浮窗尚未完成，本轮按用户确认路线推进 A 线。

## 3. 实施内容

- 新增 `TimeDebtQuickFloat`，在 App 右下角提供 `记录` 按钮和快速记录面板。
- 新增 `timeDebtQuickTimer.ts`，复用现有 active timer 与 logs 存储。
- `timeDebtStorage.ts` 增加 `time-debt-logs-change` 事件，方便跨页面刷新 Time Debt 记录。
- `TimeDebtDashboard.tsx` 监听 active timer / logs 变更，浮窗结束计时后页面可刷新。
- `MainWorkspacePage.tsx` 只做浮窗挂载。
- 新增 `TIME_DEBT_FLOATING_WINDOW_MODE.md` 固化浮窗路线。

## 4. 状态保存方式

- 未结束计时复用既有 key：`growth-tree-os:time-debt:active-timer`。
- 历史记录继续写入 Time Debt 现有 account namespace logs key。
- localStorage 读取异常沿用现有 storage 兜底，不白屏。

## 5. 文件边界

- 已修改 Time Debt 与主布局挂载相关文件。
- 未修改 `app/renderer/src/features/wealth/**/*`。
- 未修改 `docs/project-state/CURRENT_STATUS.md`、`docs/project-state/NEXT_ACTION.md`、`docs/project-state/LOG_INDEX.md`。
- 未修改 `docs/project-map/MAP_STATUS.md`。
- 未修改 `package.json` / `pnpm-lock.yaml`。

## 6. 验证记录

待本轮执行：

```bash
pnpm typecheck
pnpm build
```

真实 Electron UI smoke 留给下一轮或本轮验证阶段执行。
