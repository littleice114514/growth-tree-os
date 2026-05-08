# M13 P0｜Time Debt Timer Stability on Latest UI

## 任务

基于 `origin/feature/mac-time-debt-plan-flow-overlap-ui@cfc1689` 新建修复分支，手动迁移旧 P0 commit `573e07e` 的 running timer 稳定性能力。

## Skill / 工作流

- 已搜索本机会话可用 skill。
- 未命中更合适的专用工程迁移 skill。
- 本轮采用基础工程代码修改 + 文档交接 + GitHub Sync Gate 工作流。
- 候选沉淀项：Time Debt active timer 稳定性 smoke SOP，可在 P1/P2 再次复用后沉淀。

## 改动

- `TimeDebtDashboard.tsx`
  - 新增 `timerError` 状态与全局错误提示。
  - 计时中注册 `beforeunload` 离开提醒。
  - 开始计时时先写入 `timeDebtActiveTimerStorage.ts`，写入失败则提示并停止进入运行态。
  - 结束计时时捕获保存异常，失败时保留 running timer 并提示重试或安全清理。
  - 结束成功后清理 active timer storage。
- `timeDebtActiveTimerStorage.ts`
  - 读取到无效或损坏 active timer payload 时清理现有 key。

## 验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `git diff --name-only` 只包含 Time Debt 文件与本轮文档。
- `TimeDebtDashboard.tsx` 保持新版 UI 规模，当前 2437 行。
- `calendar/*` 文件仍存在。
- `git diff --name-only | rg -i '(^|/)(3d|wealth|tree)(/|\\.|$)'` 输出为空。

## 手动验收说明

- 开始计时：从执行台或计划任务点击开始，应进入进行中状态，并写入 `growth-tree-os:time-debt:active-timer`。
- 刷新恢复：刷新页面后，应恢复当前计时标题、分类、实际开始时间和 elapsed time。
- 结束计时保存：点击结束计时并生成日志，应新增日志；如果来自计划任务，应完成计划并归档提醒。
- 结束后清理：保存成功后 `growth-tree-os:time-debt:active-timer` 应被移除。
- 刷新/关闭提醒：计时进行中刷新或关闭页面时，应出现浏览器离开确认。
- 保存失败：模拟 localStorage 写入失败时，应显示错误提示，running timer 保留，可重试结束或使用安全清理入口。

## 下一步

M13 P1｜Time Debt 跨天计时拆分。
