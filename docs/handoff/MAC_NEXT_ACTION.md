# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-29 15:33 CST

## 2. 本轮已完成

- Time Debt 创建规划任务时同步生成本地 time-plan reminder。
- Reminder 页面升级为提醒工作台，合并展示 time-plan 与原有 node-maintenance 提醒。
- time-plan 支持去处理、开始计时、延后 10 分钟、转为补记、忽略。
- Reminder 到 Time Debt 使用本地 navigation intent 跳转并定位对应计划。
- 开始计时后写入真实开始时间，结束计时后生成 Completed 日志并归档提醒。
- 已归档提醒保存在 localStorage，刷新后仍可在折叠归档区查看。
- Time Debt 今日时间日志表增强 Planned / Active / Completed / Missed 状态，点击时间块可查看详情和操作。

## 3. 本轮修改文件

- `app/renderer/src/features/reminders/ReminderPanel.tsx`
- `app/renderer/src/features/reminders/timePlanReminderStorage.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `docs/dev-log/2026-04/2026-04-29/mac-reminder-time-debt-link.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- TypeScript node 配置检查通过。
- TypeScript renderer 配置检查通过。
- Electron Vite build 通过。
- 未修改 3D、skills、`.codex`、`.claude`、脚本工具链和 `docs/dev-protocol/**`。

### 未验证 / 风险

- 真实 Electron 点击流尚需 Mac 端运行后验收。
- time-plan reminders 是前端 localStorage 能力，不做跨设备同步。
- 未接系统通知、Google Calendar、Notion Calendar、iCal 或云同步。

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

确认输出的 commit 应与本轮最终汇报一致。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

如果 `pnpm` 不存在：

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，无页面报错。
- 创建一个未来 5-10 分钟的规划任务，确认 Today 右侧出现 Planned 时间块。
- 打开 Reminder，确认该任务出现在待处理提醒中，类型为 time-plan，状态为计划中 / 即将开始。
- 创建一个当前时间已到点的规划任务，确认 Reminder 显示已到点。
- 点击 Reminder 的 `去处理`，确认跳转到 Time Debt Today，且不自动开始计时。
- 点击 Reminder 的 `开始计时`，确认任务转为 Active，并显示真实开始时间。
- 点击结束计时，确认任务转为 Completed，并生成 Completed 日志。
- 回到 Reminder，确认对应提醒进入已归档区域。
- 刷新页面，确认归档状态仍保留。
- 创建两个时间重叠的计划任务，确认 Time Debt 时间轴中两个时间块并排显示，不互相覆盖。
- 快速检查成长树、财富、周回看页面无明显报错或布局崩坏。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

运行真实 Electron smoke 并截图记录 Reminder × Time Debt 联动：未来计划、到点提醒、去处理跳转、开始计时、结束归档、刷新保留、重叠时间块。若通过，再拆分 `TimeDebtDashboard.tsx` 和 `ReminderPanel.tsx` 中较大的子组件；若失败，优先修复 navigation intent 与归档同步。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Reminder 页面异常截图
- Time Debt 页面异常截图
- 开发者控制台首个关键错误
- 具体失败入口：创建计划 / Reminder 待处理 / 去处理跳转 / 开始计时 / 结束计时 / 归档刷新 / 重叠时间块

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- Planned 计划任务是 V1 前端本地能力，不代表已实现跨设备同步、外部日历接入或系统通知。
