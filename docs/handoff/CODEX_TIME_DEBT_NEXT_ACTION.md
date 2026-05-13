# Codex Time Debt 下一步操作卡

## 1. 当前任务

- 项目：growth-tree-os
- 分支：feature/integration-time-debt-wealth
- 模块：Time Debt / 快速记录浮窗
- 当前路线：A 线 App 内浮窗按钮
- 当前状态：A 线已实现，待真实 Electron UI smoke

## 2. 本轮完成

- 新增 App 右下角 `记录` 浮窗入口。
- 浮窗支持展开/收起、任务名称输入、开始计时、计时中状态、已用时长展示和结束计时。
- 空任务名会提示 `先写一下这次在做什么`。
- 复用现有 Time Debt active timer localStorage，不新建第二套长期记录系统。
- 结束计时后写入现有 Time Debt logs，Time Debt 页面可通过 logs 变更事件刷新。
- 写入 `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md` 固化 A → B → C → D 浮窗路线。

## 3. 修改文件

- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `app/renderer/src/features/time-debt/timeDebtQuickTimer.ts`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-13/codex-time-debt-floating-window.md`

## 4. 验证

必须验证：

```bash
pnpm typecheck
pnpm build
```

手动 smoke：

- 打开 App，右下角看到 `记录`。
- 点击后展开 `快速记录时间`。
- 空任务名点击开始会提示。
- 输入任务名后可以开始计时。
- 切换到 Wealth 后计时状态不丢失。
- 切回 Time Debt 后计时状态仍在。
- 刷新后未结束计时可恢复。
- 点击结束计时后 Time Debt 能看到新记录。
- Wealth 不白屏。

## 5. 下一轮唯一任务

本轮已完成 A 线真实 Electron UI smoke，结论：通过。

下一轮唯一任务：封存 A 线验收结论，并只在发现 A 线回归时做修复。不要开发 B/C/D，不要改 Wealth，不要改 project-state 三件套。

## 6. A 线 Smoke 结果｜2026-05-13

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：可启动。
- 右下角 `记录` 按钮：通过。
- `快速记录时间` 展开面板：通过。
- 空任务名提示 `先写一下这次在做什么`：通过。
- `浮窗A线smoke测试` 开始计时：通过。
- 切换 Wealth 不丢计时且 Wealth 不白屏：通过。
- 切回 Time Debt 后计时仍在：通过。
- 计时中刷新后恢复，开始时间未重置：通过。
- 结束计时后写入 Time Debt：通过。
- 日历出现 `浮窗A线smoke测试 / 1 min / 已完成`：通过。
- 测试记录：已保留，未删除。
- Wealth 并行未提交文件：本轮未修改、未回退、未提交。
