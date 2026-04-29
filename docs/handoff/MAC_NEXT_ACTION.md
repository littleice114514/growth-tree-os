# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-29 16:13 CST

## 2. 本轮已完成

- Reminder × Time Debt：规划任务会生成本地 time-plan reminder，Reminder 可跳转 Time Debt、开始计时、延后、补记或忽略。
- Time Debt 表单稳定性：补记、规划、开始计时弹窗只保留一个 `分类项目` 入口，不再重复显示一级分类 / 二级项目。
- Modal 空白修复：Time Entry Modal 使用 fixed overlay、内部滚动和 body 滚动锁，打开后不再撑出页面底部空白。
- 跨页面计时保持：active timer 写入 `growth-tree-os:time-debt:active-timer`，切换页面再回 Time Debt 会继续累计。
- 顶部全局计时提示：存在 active timer 时，Toolbar 显示正在计时任务和累计时间，点击可回 Time Debt。
- 结束计时后生成 Completed 日志，清除 active timer，并保留 Planned / Reminder 联动归档。

## 3. 本轮修改文件

- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/features/reminders/ReminderPanel.tsx`
- `app/renderer/src/features/reminders/timePlanReminderStorage.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-reminder-time-debt-link.md`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-modal-timer-stability.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- TypeScript node 配置检查通过。
- TypeScript renderer 配置检查通过。
- Electron Vite build 通过。
- 未修改 3D、skills、`.codex`、`.claude`、脚本工具链和 `docs/dev-protocol/**`。

### 未验证 / 风险

- 真实 Electron 完整点击流仍建议继续截图验收。
- time-plan reminders 与 active timer 均为前端 localStorage 能力，不做跨设备同步。
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
- 点击 `补记时间`，确认弹窗只有一个 `分类项目` 入口，没有重复一级分类 / 二级项目字段。
- 点击 `规划任务`，确认弹窗只有一个 `分类项目` 入口，页面底部不出现大块空白。
- 点击 `开始计时`，创建一个 active 任务。
- 切换到 Reminder，等待 5-10 秒，再切回 Time Debt，确认计时器继续累计而不是从 0 开始。
- 切换到成长树、财富、周回看，再切回 Time Debt，确认计时器仍继续。
- 存在 active timer 时，确认顶部 Toolbar 显示正在计时提示。
- 点击结束计时，确认生成 Completed 日志，active timer 清除，Toolbar 计时提示消失。
- 创建规划任务后确认不会自动开始计时，Reminder 联动仍正常。
- 创建两个时间重叠的计划任务，确认 Time Debt 时间轴中两个时间块并排显示，不互相覆盖。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

运行真实 Electron smoke 并截图记录：补记弹窗、规划弹窗、Modal 无底部空白、开始计时 Active 状态、切换页面后计时继续、结束计时后的 Completed 日志。如都通过，再考虑拆分 `TimeDebtDashboard.tsx` 和 `ReminderPanel.tsx` 中较大的子组件。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Reminder 页面异常截图
- Time Debt 页面异常截图
- 开发者控制台首个关键错误
- 具体失败入口：补记弹窗 / 规划弹窗 / Modal 滚动 / 开始计时 / 跨页面恢复 / 结束计时 / Reminder 联动

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- active timer 是 V1 本地持久化能力，不代表已实现跨设备同步、外部日历接入或系统通知。
