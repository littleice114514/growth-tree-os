# 开发日志｜Codex｜Time Debt 浮窗 C 线全局快捷键唤起｜2026-05-14

## 1. 本轮目标

推进 Time Debt 浮窗 C 线最小闭环：

```text
按下全局快捷键
→ Electron 主进程收到快捷键
→ 聚焦/显示主窗口
→ 通知 renderer
→ 展开 Time Debt 浮窗 B 线控制台
```

本轮不做桌面级悬浮球、不做 always-on-top 独立小窗、不做系统托盘、不做快捷键设置页。

## 2. 开工边界

- 仓库：`/Users/ice/Developer/growth-tree-os`
- 分支：`feature/integration-time-debt-wealth`
- 起始 commit：`22b555d`
- C 线首选快捷键：`CommandOrControl+Shift+Space`
- C 线 fallback 快捷键：`CommandOrControl+Shift+L`

检测到 Wealth/行情未提交现场：

- `app/main/finnhub.ts`
- `app/main/env.ts`
- `app/renderer/src/features/wealth/MarketQuotesPanel.tsx`
- `app/renderer/src/features/wealth/marketDataService.ts`
- `app/renderer/src/features/wealth/marketDataTypes.ts`

本轮未修改、未回退、未提交上述文件。

## 3. 实现内容

- Electron main 进程在 `app.whenReady()` 后注册 Time Debt 全局快捷键。
- 优先注册 `CommandOrControl+Shift+Space`，失败时 fallback 到 `CommandOrControl+Shift+L`。
- 快捷键注册失败只输出 `console.warn`，不阻塞 App 启动。
- 快捷键触发后恢复最小化窗口、显示主窗口、聚焦主窗口，并发送 `time-debt:open-quick-float` IPC 消息。
- App `will-quit` 时调用 `globalShortcut.unregisterAll()` 清理快捷键。
- preload 增加 `window.growthTree.timeDebt.onOpenQuickFloat(callback)` 安全订阅接口，并返回 unsubscribe 函数。
- renderer 收到事件后展开既有 B 线 `时间控制台` 浮窗，并显示 `已通过快捷键打开` 轻提示。
- 触发快捷键时不强制切换页面；在 Wealth 页面仍停留当前页面，只展开右下角 Time Debt 浮窗。

## 4. 修改文件

- `app/main/index.ts`
- `app/preload/index.ts`
- `app/shared/contracts.ts`
- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-c-hotkey.md`

## 5. 验证记录

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 可启动。
- 实际注册快捷键：`CommandOrControl+Shift+Space`。
- fallback：未触发。
- 终端输出：`[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 终端仅出现 Node SQLite experimental warning；无 `globalShortcut` 注册崩溃。
- 退出 / 重启：关闭 dev 进程时未见明显 unregister 报错；重新启动后快捷键仍可注册。

手动 smoke 建议任务名：`浮窗C线快捷键测试`。

真实 Electron UI smoke：

- App 正常启动，终端无 `globalShortcut` 注册崩溃。
- Time Debt 页面不白屏。
- Wealth 页面不白屏。
- 按 `CommandOrControl+Shift+Space` 后，右下角 Time Debt 浮窗展开，标题显示 `时间控制台`。
- 先切到 Codex，使 Electron 不在前台，再按快捷键，Electron 可被重新聚焦并展开浮窗。
- 在 Wealth 页面按快捷键后仍停留 Wealth 页面，Time Debt 浮窗展开，Wealth 不白屏。
- 输入 `浮窗C线快捷键测试` 后可以开始计时。
- 计时中收起浮窗后按快捷键，浮窗重新展开，计时状态仍存在，已用时继续递增。
- 点击结束计时后 Time Debt 今日记录变为 1 条，浮窗反馈显示 `已记录：浮窗C线快捷键测试 · 1 分钟`。
- Time Debt 页面今日统计显示 `今日日志 1 条 / 总记录时间 1 min`。
- 本轮未发现重复记录。

说明：Computer Use 的 `press_key` 未触发 Electron 全局快捷键；真实快捷键 smoke 改用 macOS `System Events` 发送 `Cmd+Shift+Space`，验证系统级快捷键链路可用。

## 6. 下一步

下一轮唯一建议：做 C 线真实 Electron UI smoke。

不要直接进入 D 线，不做桌面级悬浮球、不做系统托盘、不做 always-on-top 小窗、不做快捷键设置页。
