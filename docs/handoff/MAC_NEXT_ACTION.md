# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-07

## 2. 本轮已完成

- 修复旧 Active plan 点击“结束计时”无效的问题：无 `runningTimer` 时也能按当前时间生成 Completed log，并把 plan 改为 completed。
- 结束计时会写入 actualEnd / actualDurationMinutes，归档 reminder，并清除 active timer localStorage。
- 新增跨天日历分段工具，Active / Completed 跨天块在可见范围内按天拆分显示。
- 开始计时 / 补记时间 / 规划任务的任务名改为历史任务 Combobox，可搜索历史任务，也可直接输入新任务。
- Active 任务超过 24 小时会显示异常提示和“立即结束计时”按钮；Active 块继续禁止拖拽、resize 和直接编辑时间段。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `app/renderer/src/features/time-debt/calendar/calendarDailySegmentUtils.ts`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm smoke` 通过，包含 renderer production build。

### 未验证 / 风险

- 未在真实 Electron UI 中手动点击那个 188 小时 `vibe coding` 旧 Active 数据。
- 跨天 segment 的拖拽 / resize 暂不开放；普通同日 Completed / Planned 拖拽 resize 保持原逻辑。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/Littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/mac-time-debt-plan-flow-overlap-ui
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
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

- 打开 Time Debt 页面，点击 188 小时 `vibe coding` Active 任务的“结束计时”或“立即结束计时”。
- 预期：状态变为 Completed，actualEnd / actualDurationMinutes 写入，顶部和执行台不再显示正在计时。
- DevTools Local Storage 中 `growth-tree-os:time-debt:active-timer` 被清除，刷新后不会恢复旧 Active。
- 新建一个跨天 Completed 或 Active 测试块，周视图中应按每天显示 segment。
- 开始计时 / 补记时间 / 规划任务弹窗中，任务名可搜索历史任务，点击后填入任务名、一级分类、二级项目和标签。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

对本轮 Time Debt Active Timer 修复做真实 UI 验收：用现有 `vibe coding` 异常 Active 数据点击结束计时，确认刷新后不恢复 Active；如通过，只补一条简短验收日志，不扩展洞察页或字段系统。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm dev` 完整报错；
- Time Debt 页面异常截图；
- DevTools 控制台首个关键错误；
- DevTools Local Storage 中 active timer key 的截图或值。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要在本轮基础上扩展洞察页、仪表盘、字段系统、Notion API 或外部日历同步。
