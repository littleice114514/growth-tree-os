# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 当前模块：Time Debt Calendar
- 当前设备完成时间：2026-05-05 20:37 CST
- 最新本地 commit：以 `git rev-parse --short HEAD` 输出为准
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
- 2026-05-05：右侧详情面板补齐时间段二次编辑，Completed 编辑实际开始 / 结束，Planned / Missed 编辑计划开始 / 结束，Active 显示禁止编辑提示。
- 2026-05-05：详情面板接入 resize 预览时间段，松手后沿用 resize 保存链路回写并重算日历布局。
- 2026-05-05：本机运行 smoke 后修复两个交互问题：datetime-local 自动化输入同步不稳、事件块边缘拖动容易误触发整体移动；现在详情编辑保存和上边缘 resize 已在运行页面复验通过。
- 创建 `docs/handoff/TIME_DEBT_MODULE_INDEX.md`，后续替代反复阅读长日志。

## 4. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
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
- 本机 Codex App 环境没有 `pnpm` / `npm` / `corepack`，直接 `electron-vite dev` 会因 Codex App Node 加载 Rollup darwin optional dependency 签名问题失败；可用 Electron 自带 Node 绕过并启动，见下方命令。
- 月视图事件密度还未优化。
- 跨周 / 跨月复杂拖拽不在本轮范围。
- 字段系统和仪表盘只记录为 backlog，未开发。
- 需要在有真实 Time Debt 数据的环境中人工验收 resize。

## 6. 下一轮唯一目标

先修复本机依赖环境并启动 Time Debt 页面做人工 smoke：点击 Completed / Planned / Active，验证右侧时间编辑、上下边缘 resize、详情面板持续显示和 overlap 重算。

## 7. 下一轮必读文件

- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- `app/renderer/src/features/time-debt/calendar/CalendarViewShell.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarGrid.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
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
- `node_modules/.bin/tsc --noEmit -p tsconfig.node.json` 通过，2026-05-05 本轮复验通过。
- `node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json` 通过，2026-05-05 本轮复验通过。
- `node_modules/.bin/electron-vite dev` 直接运行未通过，原因是 Codex App Node 加载 Rollup darwin optional dependency 原生包签名异常。
- 使用 Electron 自带 Node 启动成功，renderer 位于 `http://localhost:5173/`。
- 运行页面已创建临时 Completed 测试块并复验：右侧结束时间保存后实际结束 / 实际时长 / 事件块文案同步更新；拖动上边缘 resize 后开始时间更新且详情同步。
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
node_modules/.bin/tsc --noEmit -p tsconfig.node.json
node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json
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
