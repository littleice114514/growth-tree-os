# Codex Time Debt 下一步操作卡

## 1. 当前任务

- 项目：growth-tree-os
- 分支：feature/integration-time-debt-wealth
- 模块：Time Debt / 快速记录浮窗
- 当前路线：B 线 App 内小控制台
- 当前状态：A 线已完成并通过真实 Electron UI smoke；B 线已进入实现，下一步必须做真实 Electron UI smoke

## 2. 本轮完成

- A 线：App 右下角 `记录` 浮窗入口已完成，真实 Electron UI smoke 已通过。
- B 线：浮窗增强为 App 内小控制台。
- 收起态无计时时显示 `记录`，计时中显示 `计时中 · HH:MM:SS`。
- 展开态显示时间控制台、当前状态、任务名称输入、开始计时、收起按钮。
- 计时中显示当前计时卡片：任务名、开始时间、已用时和结束计时。
- 结束计时后显示最近一次记录反馈，例如 `已记录：xxx · N 分钟`。
- 从已有 Time Debt logs 提取最多 3 个最近任务名，支持快捷填入。
- 继续复用现有 Time Debt active timer localStorage，不新建第二套长期记录系统。
- 结束计时后仍写入现有 Time Debt logs，Time Debt 页面可通过 logs 变更事件刷新。

## 3. 修改文件

- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-b-console.md`

## 4. 验证

必须验证：

```bash
pnpm typecheck
pnpm build
```

手动 smoke：

- 打开 App，右下角看到 `记录`。
- 点击后展开 `时间控制台`。
- 空任务名点击开始会提示。
- 输入 `浮窗B线控制台测试` 后可以开始计时。
- 收起后按钮显示 `计时中 · HH:MM:SS`。
- 展开后当前计时卡片显示任务名、开始时间和已用时。
- 切换到 Wealth 后计时状态不丢失。
- 切回 Time Debt 后计时状态仍在。
- 刷新后未结束计时可恢复。
- 点击结束计时后 Time Debt 能看到新记录。
- 结束后面板底部显示最近一次记录反馈。
- 有历史 logs 时，最近任务快捷项最多显示 3 个，点击可填入任务名称。
- Wealth 不白屏。

## 5. 下一轮唯一任务

本轮完成 B 线实现后，下一轮唯一任务是做 B 线真实 Electron UI smoke。

不要直接进入 C/D，不做全局快捷键，不做系统托盘，不做 always-on-top 桌面小窗，不改 Wealth，不改 project-state 三件套。

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

## 7. B 线实现记录｜2026-05-14

- 基线：本机 `feature/integration-time-debt-wealth @ d05f24c`。
- 远程同名分支仍停在 `75911c0`，本轮不 pull，不覆盖 Wealth/行情现场。
- 检测到 Wealth/行情未提交改动和 `app/main/env.ts`，本轮未修改、未回退、未提交。
- 新增浮窗 UI 状态 key：`growth-tree-os:time-debt-floating-ui:v1`。
- 核心计时仍复用：`growth-tree-os:time-debt:active-timer`。
- 下一步必须先 smoke B 线，确认小控制台稳定后再讨论后续路线。
