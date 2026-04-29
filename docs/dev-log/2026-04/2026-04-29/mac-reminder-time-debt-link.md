# 开发日志｜Mac｜Reminder × Time Debt 联动｜2026-04-29

## 1. 本轮目标

把 Time Debt 规划任务接入提醒工作台：创建计划时生成 time-plan 提醒，到点后在 Reminder 页面显示，用户可跳转处理、开始计时、延后、转补记或忽略；计时完成后提醒进入本地归档。同时继续增强 Today 时间日志表的 Planned / Active / Completed / Missed 日历块体验。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/features/reminders/ReminderPanel.tsx`
- `app/renderer/src/features/reminders/timePlanReminderStorage.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `docs/dev-log/2026-04/2026-04-29/mac-reminder-time-debt-link.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

- 未修改 3D 模块、重资源、资源管线。
- 未修改 Windows skills、`.codex/`、`.claude/`。
- 未修改脚本、工具链和 `docs/dev-protocol/**`。
- 未修改财富、成长树、周回看业务文件。
- 本轮属于 Mac 默认 UI / 页面体验 / 交互范围，未触及跨边界修改。

## 5. 主要改动

- 新增 `growth-tree-os:time-plan-reminders:v1` 本地缓存，保存 time-plan 提醒、状态、计划时间、分类项目、延后次数和归档时间。
- 新增 `growth-tree-os:time-debt-navigation-intent:v1` 跳转意图缓存，让 Reminder 可以跳到 Time Debt Today 并定位对应计划。
- Time Debt 创建规划任务时同步创建 time-plan reminder；创建计划本身不会自动开始计时。
- 点击开始计时后，计划转 Active，写入真实开始时间，并同步 reminder 为 active。
- 结束计时后生成 Completed 日志，计划写入 actualEnd / actualDuration / completedLogId，并把 reminder 归档为 completed。
- Reminder 页面升级为提醒工作台：顶部概览、待处理列表、time-plan 操作按钮、原有 node-maintenance 能力、折叠归档区。
- Time Debt 今日时间日志表支持点击时间块查看详情；Planned / Missed 时间块可直接开始计时、转补记或忽略。

## 6. Reminder 与 Time Debt 联动方式

- Time Debt 计划任务是数据源，`sourceType = time-debt-plan`，`sourceId = plan.id`。
- Reminder 的 `去处理` 写入 focus intent 并跳转 Time Debt，不自动开始。
- Reminder 的 `开始计时` 写入 start intent；Time Debt 消费 intent 后由用户点击动作触发开始计时。
- Reminder 的 `转为补记` 写入 manual intent；Time Debt 打开补记弹窗并带入原计划信息。
- Reminder 的 `延后 10 分钟` 同步更新本地 reminder 与对应 Time Debt plan 的计划开始 / 结束时间，保留 originalPlannedStart。
- Reminder 的 `忽略` 将提醒标记为 dismissed 并进入归档，不生成时间日志。

## 7. 本地缓存 / 归档方式

- time-plan reminders 使用 localStorage：`growth-tree-os:time-plan-reminders:v1`。
- 跳转 intent 使用 localStorage：`growth-tree-os:time-debt-navigation-intent:v1`。
- completed / dismissed / archived 的提醒不再出现在待处理列表，会显示在折叠归档区。
- 刷新页面后 localStorage 中的归档状态仍保留。

## 8. 验收命令

```bash
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/electron-vite build
```

## 9. 验收结果

- TypeScript node 配置检查通过。
- TypeScript renderer 配置检查通过。
- Electron Vite build 通过。
- 未进行真实桌面点击流截图验收；需 Mac 端运行 `pnpm dev` 后按 handoff 路径检查。

## 10. 风险与遗留问题

- 本轮不接系统级通知、Google Calendar、Notion Calendar、iCal 或云同步。
- time-plan reminders 是前端 localStorage 能力，不写入现有后端 reminders 数据库。
- 日历块详情和重叠排布仍是轻量 V1，不是完整日历引擎。
- `TimeDebtDashboard.tsx` 仍较大，后续可在交互稳定后拆分组件。

## 11. 下一步建议

优先做真实 Electron smoke：创建未来计划、已到点计划、错过计划、重叠计划，从 Reminder 跳 Time Debt，验证 focus / start / manual / archive 四条路径。通过后再考虑拆分 Time Debt 组件和抽取 reminder 联动测试。
