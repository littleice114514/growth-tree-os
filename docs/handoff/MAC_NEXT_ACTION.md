# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-30 17:55 CST

## 2. 本轮已完成

- Time Debt Calendar 事件点击后右侧详情面板持续显示，不再像 hover/active 一样松手消失。
- 日 / 周 / 自定义天数视图所有日期列共用同一套事件点击、选中、拖拽逻辑，非当天事件可交互。
- 拖拽松手后真实更新前端状态与 localStorage：Completed 日志更新实际时间，Planned/Missed 计划更新计划时间并同步 Reminder planned time。
- Active 时间块保持可选中查看详情，但不可拖动，避免破坏 active timer 跨页面状态。
- 拖拽 preview 支持纵向 15 分钟吸附与周/自定义天数横向跨日期列落位。
- 重叠事件继续按同一天 cluster 并发列布局，事件块保留间距和最小高度。
- 当前时间线改为 Notion 风格：左侧红色时间标签、1px 红线、今日列小红点，装饰层不拦截 pointer events。
- 月视图保留独立 MonthGrid，只弱化今天日期高亮，不显示分钟级当前时间线。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CustomDaysCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/DayCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/MonthCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/WeekCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/dev-log/2026-04/2026-04-30/mac-time-debt-calendar-interaction-stability.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/tsc --noEmit -p tsconfig.node.json`：通过。
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`：通过。
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/electron-vite dev`：通过，renderer 启动在 `http://localhost:5174/`，Electron app 可启动。
- 浏览器 smoke：通过，可进入 Time Debt 日历 tab，周视图、半小时时间轴和左侧当前时间标签可见。

### 未验证 / 风险

- 由于当前本地 Time Debt 数据为空，本轮未创建测试业务数据；点击已有事件、非当天事件拖拽、拖拽后刷新保留需要在有事件数据时继续人工验收。
- 系统级 `pnpm/npm/corepack` 仍不在 PATH，本轮使用 bundled Node + `node_modules/.bin`。
- 未实现 resize 改事件时长、跨周/跨月超长拖动、月视图拖拽和云同步。

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

优先使用：

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm typecheck
pnpm dev
```

如果 shell 里没有 `pnpm/npm/corepack`，可使用本仓库当前验证方式：

```bash
export PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
node_modules/.bin/tsc --noEmit -p tsconfig.node.json
node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json
node_modules/.bin/electron-vite dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，进入日历页。
- 点击今天事件块，松开鼠标后右侧详情持续显示。
- 点击非今天事件块，详情切换并持续显示。
- 点击空白日期列，选中状态可清空。
- 拖动今天事件到新时间，确认松手后事件落位。
- 拖动非今天事件到其他日期或新时间，确认松手后事件落位。
- 刷新前页面状态显示更新后位置；Completed/Planned 本地持久化可在刷新后保留。
- Active 任务不可拖动，但仍可点击查看详情和结束计时。
- 两个/三个重叠事件并排，不重叠事件占满整列。
- 当前时间线为左侧标签 + 1px 红线 + 今日列小红点，没有红色大框。
- 切换日 / 周 / 月 / 天数视图，确认可用。
- 打开执行台、洞察、提醒页面，确认无明显回归。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

```text
1. 拖拽 resize 改变事件时长。
2. 月视图事件密度优化。
3. 自定义天数视图细化。
4. 提醒系统与计划任务到点联动强化。
```

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- 依赖安装、typecheck、dev 启动的完整报错
- Time Debt 页面异常截图
- 点击事件后详情面板异常截图
- 非今天事件点击/拖拽异常截图
- 拖动前后落位异常截图
- 当前时间线异常截图
- 控制台首个关键错误

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- 本轮不接 Notion API、Google Calendar、iCal、云同步、系统通知或数据库迁移。
