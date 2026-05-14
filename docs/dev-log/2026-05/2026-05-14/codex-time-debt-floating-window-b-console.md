# 开发日志｜Codex｜Time Debt 浮窗 B 线 App 内小控制台｜2026-05-14

## 1. 本轮目标

在 A 线 App 内快速记录浮窗基础上推进 B 线 App 内小控制台。

本轮只增强 App 内浮窗，不做全局快捷键、不做系统托盘、不做 always-on-top 桌面小窗、不进入 C/D。

## 2. 开工边界

- 仓库：`/Users/ice/Developer/growth-tree-os`
- 分支：`feature/integration-time-debt-wealth`
- 本机起始 commit：`d05f24c`
- 远程同名分支 HEAD：`75911c0`
- 策略：基于本机当前 HEAD 推进，不 pull，不覆盖 Wealth/行情现场。

检测到并行未提交改动：

- `app/main/finnhub.ts`
- `app/main/env.ts`
- `app/renderer/src/features/wealth/MarketQuotesPanel.tsx`
- `app/renderer/src/features/wealth/marketDataService.ts`
- `app/renderer/src/features/wealth/marketDataTypes.ts`

本轮未修改、未回退、未提交上述文件。

## 3. 实现内容

- 收起态无计时时显示 `记录`，计时中显示 `计时中 · HH:MM:SS`。
- 展开态改为 `时间控制台`，显示当前状态、任务名称输入、开始计时、收起按钮。
- 计时中显示当前计时卡片：任务名、开始时间、已用时、结束计时。
- 结束计时后显示最近一次记录反馈，例如 `已记录：xxx · N 分钟`。
- 从现有 Time Debt logs 中提取最近任务名，最多显示 3 个快捷填入按钮。
- 长任务名在面板内换行或截断，不撑破浮窗。
- 面板固定右下角，宽度约 340px，高度超过视口时内部滚动。

## 4. 状态持久化

- 核心计时继续复用：`growth-tree-os:time-debt:active-timer`
- 新增 UI 状态 key：`growth-tree-os:time-debt-floating-ui:v1`

新增 UI key 只保存展开/收起状态和最近一次记录反馈，不参与核心计时记录。

## 5. 修改文件

- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-b-console.md`

## 6. 验证记录

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：可启动，renderer 地址为 `http://localhost:5174/`；终端仅出现 Node SQLite experimental warning。

轻量 UI smoke 使用任务名：`浮窗B线控制台测试`。

- 右下角 `记录` 按钮可见。
- 点击后展开 `时间控制台`。
- 空任务名点击开始会提示 `先写一下这次在做什么`。
- 输入 `浮窗B线控制台测试` 后可以开始计时。
- 计时中卡片显示任务名、开始时间、已用时和 `结束计时`。
- 收起后按钮显示 `计时中 · HH:MM:SS`。
- 切换到 Wealth 后计时状态仍在；浏览器直开 renderer 未发现 Wealth 白屏。
- 刷新后 active timer 恢复，仍显示 `计时中 · HH:MM:SS`。
- 点击 `结束计时` 后 active timer 清空，显示 `已记录：浮窗B线控制台测试 · 1 分钟`。
- 最近任务快捷项出现 `浮窗B线控制台测试`。

说明：本次轻量 UI smoke 使用浏览器打开 renderer，不等同于真实 Electron UI smoke；浏览器控制台出现既有 Electron API 缺失错误 `Cannot read properties of undefined (reading 'tree')`。下一轮仍需在真实 Electron 窗口中复验 B 线。

## 7. 下一步

下一轮唯一建议：先做 B 线真实 Electron UI smoke。

不要直接进入 C/D，不做全局快捷键、不做系统托盘、不做桌面级悬浮球。
