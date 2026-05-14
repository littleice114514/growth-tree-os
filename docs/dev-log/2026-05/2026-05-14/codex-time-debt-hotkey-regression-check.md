# 开发日志｜Codex｜Time Debt 全局快捷键回归排查｜2026-05-14

## 1. 本轮目标

只排查 Time Debt C 线全局快捷键是否仍可用，并在必要时做最小修复。

本轮不做 Settings 页面、不做快捷键自定义、不进入 D 线、不做桌面悬浮球、不做系统托盘、不做 always-on-top 小窗。

## 2. Skill 与工作流

- 已搜索本机已有 skill。
- 未命中专门覆盖 Electron 全局快捷键回归排查的 skill。
- 本轮采用基础工作流：工程回归诊断 + 真实 Electron smoke + 文档交接 + GitHub Sync Gate。
- 候选沉淀项：可沉淀为 `Electron globalShortcut 回归排查 SOP`，但本轮只记录为候选，不生成正式 skill。

## 3. 开工现场

- 仓库：`growth-tree-os`
- 分支：`feature/integration-time-debt-wealth`
- 起始 commit：`9d89025`
- 远程：`git@github.com:littleice114514/growth-tree-os.git`

检测到并行未提交现场，本轮未修改、未回退、未提交：

- `app/main/finnhub.ts`
- `app/main/ipc.ts`
- `app/preload/index.ts`
- `app/renderer/src/features/wealth/MarketQuotesPanel.tsx`
- `app/renderer/src/features/wealth/marketDataService.ts`
- `app/renderer/src/features/wealth/marketDataTypes.ts`
- `app/shared/contracts.ts`
- `app/main/env.ts`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-b-smoke.md`

## 4. C 线代码链路检查

- `app/main/index.ts` 仍导入并使用 `globalShortcut`。
- 主快捷键仍为 `CommandOrControl+Shift+Space`。
- fallback 快捷键仍为 `CommandOrControl+Shift+L`。
- IPC channel 仍为 `time-debt:open-quick-float`。
- `app/main/index.ts` 快捷键触发后仍会显示/聚焦主窗口，并向 renderer 发送 IPC。
- `app/preload/index.ts` 仍暴露 `window.growthTree.timeDebt.onOpenQuickFloat(callback)`。
- `app/shared/contracts.ts` 仍声明 `timeDebt.onOpenQuickFloat(callback): () => void`。
- `TimeDebtQuickFloat.tsx` 仍监听该事件，展开浮窗并显示 `已通过快捷键打开`。
- `MainWorkspacePage.tsx` 仍挂载 `TimeDebtQuickFloat`。

结论：C 线 main -> preload -> renderer 链路仍存在。

## 5. 验证结果

命令验证：

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 可启动。
- 终端输出：`[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 未发现 `globalShortcut` 注册失败日志。
- 终端仅出现 Node SQLite experimental warning。

真实 Electron smoke：

- App 聚焦时，使用系统事件发送 `Cmd+Shift+Space`，右下角 Time Debt 浮窗展开。
- 浮窗标题显示 `时间控制台`。
- 浮窗显示 `已通过快捷键打开`。
- App 不聚焦时，先切到 Finder，再发送 `Cmd+Shift+Space`，Electron App 被重新聚焦，Time Debt 浮窗展开。
- 当前页面停留在 Wealth，未强制切换页面。
- Wealth 页面未白屏。
- fallback `CommandOrControl+Shift+L` 未测试；主快捷键已注册且生效，本轮无需触发 fallback。

说明：Computer Use 的 `press_key` 未触发 Electron 全局快捷键；真实快捷键 smoke 使用 macOS `System Events` 发送 `Cmd+Shift+Space` 完成。

## 6. 本轮结论

- C 线快捷键代码仍存在。
- 当前实际注册快捷键：`CommandOrControl+Shift+Space`。
- fallback：`CommandOrControl+Shift+L`。
- 主快捷键注册成功。
- App 聚焦时快捷键生效。
- App 不聚焦时快捷键生效。
- 未发现 IPC 断链。
- 未发现 renderer 监听组件未挂载。
- 未修改默认快捷键。
- 未修改 Wealth。

## 7. 下一步

本轮无需做代码修复，C 线可继续视为可用。

下一轮建议：等待 Wealth/行情线程收口后做 integration 验收；不要在本轮基础上直接进入 D 线或 Settings 页面。
