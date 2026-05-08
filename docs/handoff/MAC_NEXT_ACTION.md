# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/m13-time-debt-timer-stability-p0-on-latest-ui
- 最新 commit：以最终汇报中的 commit hash 为准
- 当前设备完成时间：2026-05-08

## 2. 本轮已完成

- 从 `origin/feature/mac-time-debt-plan-flow-overlap-ui@cfc1689` 新建 P0 修复分支。
- 手动迁移旧 P0 commit `573e07e` 的 running timer 稳定性能力。
- 复用新版 `timeDebtActiveTimerStorage.ts`，未新增第二套 storage key。
- 补齐刷新恢复、计时中离开提醒、结束成功清理、保存失败提示与安全清理入口。
- 保留最新版 Time Debt UI、计划流、日历视图、重叠布局和 resize/edit calendar 能力。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/dev-log/2026-05/2026-05-08/mac-time-debt-timer-stability-p0-on-latest-ui.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `TimeDebtDashboard.tsx` 当前 2437 行，仍为新版 UI 规模。
- `app/renderer/src/features/time-debt/calendar/*` 文件仍存在。
- `timeDebtActiveTimerStorage.ts` 仍存在并被正确使用。
- 本轮 diff 没有修改 3D / Wealth / Tree 相关文件。

### 未验证 / 风险

- 未在真实 Electron UI 中逐项点击验收。
- 未做 P1 跨天拆分。
- 未做 P2 任务名复用体验。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/Littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/m13-time-debt-timer-stability-p0-on-latest-ui
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git fetch origin
git checkout feature/m13-time-debt-timer-stability-p0-on-latest-ui
git pull origin feature/m13-time-debt-timer-stability-p0-on-latest-ui
git rev-parse --short HEAD
```

确认输出的 commit 应为最终汇报中的 commit hash。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt 执行台。
- 开始计时后，DevTools Local Storage 出现 `growth-tree-os:time-debt:active-timer`。
- 刷新页面后，当前计时恢复。
- 计时中刷新或关闭页面，浏览器出现离开确认。
- 点击结束计时并生成日志后，日志保存成功，active timer storage 被清理。
- 模拟保存失败时，页面出现错误提示，计时没有静默丢失，并可重试或安全清理。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

M13 P1｜Time Debt 跨天计时拆分。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install` / `pnpm dev` 完整报错；
- 页面异常截图；
- DevTools 控制台首个关键错误；
- DevTools Local Storage 中 `growth-tree-os:time-debt:active-timer` 的状态。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要回退到旧版 `TimeDebtDashboard.tsx`。
- 不要覆盖 `app/renderer/src/features/time-debt/calendar/*`。
- 不要修改 3D / Wealth / Tree 相关文件。
