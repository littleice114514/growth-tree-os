# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-10

## 2. 本轮已完成

- 完成 M13 Time Debt 计时闭环与重叠显示稳定化代码路径验收。
- 确认 active timer 结束、legacy active plan 关闭、短任务真实时长与视觉高度分离、跨天分段、day/week/month/custom 切换、重叠布局和非今天记录访问均有现有实现支撑。
- 最小修复跨天 daily segment 详情：跨天分段只读展示，不再暴露会传入 `::segment::` id 的时间段编辑器。
- 更新 `docs/handoff/TIME_DEBT_MODULE_INDEX.md` 记录 M13 验收结论、修复点、验证结果和下一轮入口。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm smoke` 通过。

### 未验证 / 风险

- 真实 Electron 鼠标点击 smoke 未在本轮完成，需要 Mac 端拉取后补做。
- 重点补验 active timer 开始/结束、跨天分段详情只读、短任务真实分钟数、dense overlap 点击目标。

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

- 普通开始计时后可以结束并生成 completed log。
- 从 planned task 开始计时后可以结束，plan 变为 completed 并清空 active timer。
- 少于 15 分钟的补记或计时保存真实 `durationMinutes`，日历只用 15 分钟最小视觉高度。
- 跨天 completed / active 块在 day/week/custom/month 范围内分段展示，分段详情为只读。
- day / week / month / custom 切换后 active timer 和已选时间块不出现明显状态丢失。
- 同日重叠任务分列可读，短块仍可点击查看详情。
- 非今天日期的 completed / planned / missed 记录可以查看，并按现有规则操作。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

用真实 Electron UI 做 M13 点击 smoke：创建一个短任务、一个重叠任务、一个跨天任务样本，验证开始/结束计时、详情查看、视图切换和跨天分段只读；通过后只补充简短验收日志，不扩展新功能。

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
