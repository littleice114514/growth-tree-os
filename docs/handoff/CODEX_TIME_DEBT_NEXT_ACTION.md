# Codex Time Debt 下一步操作卡

## 1. 当前任务

- 项目：growth-tree-os
- 分支：feature/integration-time-debt-wealth
- 模块：Time Debt / 快速记录浮窗
- 当前路线：C 线全局快捷键 / 系统级唤起
- 当前状态：A 线已封存；B 线已封存；C 线已完成并通过真实 Electron UI smoke 复验，可封存；D 线暂不开始

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
- C 线：Electron main 进程注册 Time Debt 全局快捷键。
- C 线：首选快捷键为 `CommandOrControl+Shift+Space`，注册失败时 fallback 到 `CommandOrControl+Shift+L`。
- C 线：快捷键触发后聚焦/显示主窗口，并发送 `time-debt:open-quick-float` 给 renderer。
- C 线：preload 暴露 `window.growthTree.timeDebt.onOpenQuickFloat(callback)` 安全订阅接口，不暴露任意 `ipcRenderer`。
- C 线：renderer 收到事件后展开既有 B 线 `时间控制台` 浮窗，并显示轻提示 `已通过快捷键打开`。
- C 线：不强制切换页面；在 Wealth 页面触发后仍停留 Wealth，只展开右下角 Time Debt 浮窗。
- C 线复验：`5cb88bd` 已通过真实 Electron UI smoke，实际快捷键为 `CommandOrControl+Shift+Space`，fallback 未触发。
- C 线复验：使用 `浮窗C线复验测试` 创建真实测试记录，记录已保留。

## 3. 修改文件

- `app/main/index.ts`
- `app/preload/index.ts`
- `app/shared/contracts.ts`
- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-c-hotkey.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-c-smoke.md`
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
- C 线真实 Electron UI smoke：
  - App 正常启动，终端无 `globalShortcut` 注册崩溃。
  - 在非展开浮窗状态按实际注册快捷键，App 被聚焦，右下角浮窗展开为 `时间控制台`。
  - 在 Wealth 页面按快捷键后不切页，Wealth 不白屏，Time Debt 浮窗展开。
  - 计时中收起浮窗后按快捷键，计时状态仍存在且继续递增。
  - 使用 `浮窗C线快捷键测试` 结束计时后，Time Debt 日志出现记录且不重复。
  - 退出并重启 App 后快捷键仍可注册。

## 5. 下一轮唯一任务

C 线已完成并通过真实 Electron UI smoke 复验，可封存。

当前不要进入 D 线，除非用户明确要求桌面级悬浮球。下一轮唯一建议：等待 Wealth/行情线程收口后做 integration 验收，不改 project-state 三件套，不 push 未确认的并行现场。

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
