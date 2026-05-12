# 开发日志｜Mac｜Time Debt 计划流与重叠时间块优化｜2026-04-29

## 1. 本轮目标

修正 Time Debt 规划任务与真实计时混淆的问题，补齐 Planned / Active / Completed 状态流，增加页面内到点提醒，并让今日时间轴支持重叠时间块并排显示。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-plan-flow-overlap-ui.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

- 未修改 3D 模块。
- 未修改 Windows 端 skills、`.codex/`、`.claude/`。
- 未修改脚本、工具链和资源管线。
- 未修改 `docs/dev-protocol/**`。
- 未修改共享 `TimeDebtLog` 数据结构和数据库。

## 5. 验收命令

```bash
git status --short --branch
git branch --show-current
git remote -v
./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/electron-vite build
```

## 6. 验收结果

- TypeScript 检查通过。
- 使用 bundled Node runtime 执行 `electron-vite build` 通过。
- 本轮尚未完成真实桌面点击验收；需要 Mac 端运行 `pnpm dev` 后按 `docs/handoff/MAC_NEXT_ACTION.md` 逐项检查。

## 7. 修复的 bug / 主要改动

- 日常任务弹窗不再显示“分类字典”，改为 `一级分类 / 二级项目`。
- 规划任务保存后只生成 Planned，不会自动进入 Active。
- Planned 任务点击 `开始计时` 后才写入 `actualStartTime` 并转为 Active。
- Active 计时保留 `plannedStartTime / plannedEndTime`，并显示实际开始和建议结束。
- 结束计时后写入 `actualEndTime / actualDurationMinutes / completedLogId`，同时生成正式 Completed 日志。
- 已错过计划提供 `现在开始 / 转为补记 / 放弃`。
- 今日待开始任务增加 `计划中 / 即将开始 / 已到点 / 已错过` 页面内提醒状态。
- 今日时间日志表支持重叠时间块并排显示，避免互相完全覆盖。

## 8. 风险与遗留问题

- 本轮不接系统级通知、不接 Google Calendar / Notion Calendar。
- 计划任务仍使用 Time Debt 私有 localStorage：`growth-tree-os:time-debt-plans:v1`。
- 提醒模块仅预留 `reminderHint` 字段，未写入现有 reminders 数据库。
- 重叠布局是轻量并排算法，不是完整日历排布引擎。

## 9. 下一步建议

优先在桌面端进行真实点击验收：创建未来计划、即将开始计划、已到点计划、已错过计划、重叠计划，确认状态流和 UI 表现。如果通过，再考虑把 `TimeDebtDashboard.tsx` 拆分成 `TodayView`、`DailyCalendarView`、`PlanEntryModal` 等独立组件。
