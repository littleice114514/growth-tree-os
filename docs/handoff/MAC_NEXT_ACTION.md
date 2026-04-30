# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 当前模块：Time Debt Calendar
- 当前设备完成时间：2026-04-30 20:29 CST
- 最新 UI commit：`e4ebcff`
- GitHub push 状态：未成功；当前 Mac 缺少 `gh`，上一轮 HTTPS push 报错 `could not read Username for 'https://github.com': Device not configured`

## 2. 当前稳定能力

- Time Debt 日历支持日 / 周 / 月 / 自定义天数视图。
- 事件点击后右侧详情面板持续显示。
- Completed / Planned / Missed 事件可拖拽移动到新日期或新时间。
- Active 事件可查看详情，但不可拖拽或 resize。
- 当前时间线为左侧时间标签、1px 红线和今日列小红点。
- 重叠事件按同一天并发列布局。

## 3. 本轮已完成

- 2026-04-30 收尾同步：确认当前分支仍为 `feature/mac-time-debt-plan-flow-overlap-ui`，HEAD 为 `e4ebcff`，工作区 clean。
- 2026-04-30 收尾同步：确认本机没有 GitHub CLI，未继续消耗 token 反复认证试错。
- 2026-04-30 收尾同步：重新运行最小 typecheck，两个 TypeScript 检查通过。
- 当前时间线 overlay 提升到独立高层级，保持 `pointer-events: none`。
- 事件块颜色改为浅背景、深色左侧状态条、深色文字。
- Completed / Planned / Missed 增加上下边缘 resize。
- resize 使用 15 分钟吸附，最短 15 分钟。
- resize 后更新 Completed 日志或 Planned 计划，并同步计划提醒时间。
- 创建 `docs/handoff/TIME_DEBT_MODULE_INDEX.md`，后续替代反复阅读长日志。

## 4. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/DayCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/WeekCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/CustomDaysCalendarView.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`

## 5. 当前未完成问题

- Mac 端 GitHub push 仍未完成，Win 端暂时拉不到 `e4ebcff`。
- 当前 Mac 需要先通过 GitHub Desktop 登录并发布当前分支，或安装 GitHub CLI 后运行 `gh auth login`。
- 月视图事件密度还未优化。
- 跨周 / 跨月复杂拖拽不在本轮范围。
- 字段系统和仪表盘只记录为 backlog，未开发。
- 需要在有真实 Time Debt 数据的环境中人工验收 resize。

## 6. 下一轮唯一目标

Win 端拉取 Mac 分支并做跨端 smoke 验收。push 成功前不要继续叠加 UI 需求。

## 7. 下一轮必读文件

- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarDragPreviewUtils.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`

## 8. 禁止修改范围

- 不动 3D、财富、成长树、周回看。
- 不动 skills、脚本、工具链、协议文件。
- 不做 Notion API、Google Calendar / iCal、系统通知、数据库大重构。
- 不开发字段系统和仪表盘。

## 9. 验收标准

- `node_modules/.bin/tsc --noEmit -p tsconfig.node.json` 通过，2026-04-30 收尾同步复验通过。
- `node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json` 通过，2026-04-30 收尾同步复验通过。
- `node_modules/.bin/electron-vite dev` 可启动。
- Time Debt 页面和 Calendar 视图可打开。
- 当前时间线不遮挡点击、拖拽、resize。
- Planned / Active / Completed / Missed 颜色清楚可读。
- Completed / Planned / Missed 可通过上下边缘 resize。
- Active 不可 resize。
- resize 后事件高度和时间范围更新，详情面板持续显示。

## 10. Mac 端同步命令

```bash
cd /Users/ice/Documents/Codex/2026-04-25/growth-tree-os-mac-github-fresh/growth-tree-os
git status
git rev-parse --short HEAD
git push -u origin feature/mac-time-debt-plan-flow-overlap-ui
```

如果 `git push` 仍提示 GitHub HTTPS 凭据不可用，请使用 GitHub Desktop 登录 `Littleice114514`，添加当前仓库并 Publish / Push 当前分支；或先安装 GitHub CLI 后执行 `gh auth login`。

## 11. Win 端拉取命令

```bat
cd C:\Users\32042\Desktop\vibe coding项目\growth-tree-os
git fetch origin
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git pull origin feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
git status
```

预期：`git rev-parse --short HEAD` 输出至少应包含 `e4ebcff` 或后续 handoff commit。

## 12. Backlog

- FUTURE | Property System: 为 Time Debt、Wealth、Growth Tree 提供可配置字段。
- FUTURE | Time Debt Dashboard: 展示时间结构、计划偏差、时间负债趋势、有效时间变化、分类占比、周/月热力图。
