# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-10 17:48 CST

## 2. 本轮已完成

- 修复 Time Debt 日历时间轴顶部 `12 AM` 被裁切问题：隐藏首个轴标签，不改变网格和日志时间计算。
- 优化日历空状态：将中间浮层文案改为网格上方轻提示 `当前范围暂无时间块`，避免遮挡日历格子。
- 增加时区选择入口 MVP：工具栏按钮默认显示系统 `GMT` 偏移，菜单可选择系统时区、GMT+8、GMT-7 Los Angeles、GMT-4 New York、GMT+1 London。
- 时区选择本轮只改变 UI 显示状态，不做真实历史日志时间换算。
- 更新 `docs/handoff/TIME_DEBT_MODULE_INDEX.md` 记录 UI 修复、时区入口现状和下一轮入口。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm smoke` 通过。
- 轻量 UI smoke 通过：日历页可打开，顶部 `12 AM` 不再出现在时间轴快照中，`12:30 / 1 AM / 1:30` 仍显示，空状态不遮挡网格，时区菜单可打开并切换到 `GMT-4 New York`，日 / 周 / 月切换正常。

### 未验证 / 风险

- 真实开始 / 结束计时未在本轮 UI smoke 中执行，避免污染本地时间日志；Mac 端可用测试样本补验。
- 时区菜单目前是 UI-only，不会重算日志、计划、计时器或历史记录时间。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/Littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git pull origin feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
```

确认输出的 commit 应为本轮最终汇报中的 commit。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm smoke
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- Time Debt 日历视图顶部不再出现被裁切的 `12 AM`。
- `12:30`、`1 AM`、`1:30` 等后续刻度仍正常显示。
- 空状态提示不遮挡日历格子，有日志时不显示。
- 工具栏能看到时区按钮，点击能打开菜单。
- 选择 GMT+8、GMT-7 Los Angeles、GMT-4 New York、GMT+1 London 后按钮文字会变化。
- day / week / month / custom 切换正常。
- 开始 / 结束计时和已有日志显示不受影响。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

用真实 Electron UI 完成本轮 Time Debt Calendar UI smoke：检查顶部时间轴、空状态提示、时区菜单选择、day/week/month/custom 切换、开始/结束计时；通过后只补充简短验收日志，不扩展真实多时区换算。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm dev` 完整报错；
- Time Debt 日历页面异常截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要修改 Wealth、DB、IPC、store、MainWorkspacePage 或 project-state 三件套。
- 不要把时区入口扩展成真实换算，除非先做数据层设计和历史日志解释规则。
