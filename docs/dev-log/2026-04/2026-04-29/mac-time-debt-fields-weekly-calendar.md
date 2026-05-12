# 开发日志｜Mac｜Time Debt 字段系统 + 周视图续推｜2026-04-29

## 1. 断点检查结果

- 当前分支：`feature/mac-time-debt-plan-flow-overlap-ui`
- 开工前工作树：干净
- 最近 Time Debt 提交：`fcefbab fix(time-debt): restore form fields and plan start guards`
- 已有字段修复：一级分类 / 二级项目已恢复，AI 赋能比例已走 0-100 输入，计划未到点开始守卫已存在。
- 已有周视图能力：只有 Today 内的单日时间日志表和重叠块布局，不是 7 天周视图。
- 半成品风险：`workload/workloadUnit` 仍作为历史兼容字段存在；UI 不再作为新输入暴露。

## 2. 本轮目标

- 建立 Time Debt 轻量字段配置层。
- 统一开始计时、补记时间、规划任务弹窗字段。
- 保留动态一级分类统计。
- 将时间轴升级为周视图时间日志，并提供右侧详情面板。

## 3. 修改文件

- `app/renderer/src/features/time-debt/timeDebtFieldConfig.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtOptionsStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `app/shared/timeDebt.ts`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 字段类型实现方式

- 新增集中字段配置：`text / number / percent / select / multi_select / status / datetime / checkbox`。
- 预留 `relation / rollup / formula`，本轮不实现动态数据库编辑器。
- 字段配置包含 `fieldKey / label / type / required / options / placeholder / defaultValue / validation`。

## 5. 表单字段修复情况

- 开始计时：任务名、一级分类、二级项目、开始时间、AI 赋能比例（%）、标签、备注。
- 补记时间：任务名、一级分类、二级项目、开始时间、结束时间、状态分、AI 赋能比例（%）、标签、干扰源、备注。
- 规划任务：任务名、一级分类、二级项目、计划开始、计划结束、标签、备注。
- 新日志 / 计划支持 `tags`；日志支持 `distractionSource`。
- `workload/workloadUnit` 仅保留历史兼容，不在新 UI 输入中展示。

## 6. 周视图实现方式

- `时间轴` tab 更名为 `周视图`，页面标题为 `本周时间日志`。
- 顶部工具栏支持当前周范围、上一周、下一周、今天和新增日志。
- 主体为左侧小时刻度 + 顶部日期栏 + 7 天时间网格。
- 当前周包含今天时突出今天列并显示当前时间线。
- 默认滚动到当前时间附近；非当前周按 8:00 位置进入。

## 7. 时间块定位与重叠处理

- Completed 使用 `startTime/endTime`。
- Planned 使用 `plannedStartTime/plannedEndTime`。
- Active 使用实际开始到当前时间。
- Missed 由 planned 过期状态计算。
- 同一天内按时间段相交检测重叠，同组并排显示，最多压缩到 4 列。

## 8. 详情面板实现方式

- 点击时间块后右侧显示任务名、状态、一级分类、二级项目、时间、时长、AI 赋能比例、状态分、标签、干扰源和备注。
- Planned 未到点禁用开始，到点允许开始。
- Missed 显示现在开始、转为补记、忽略。
- Active 显示结束计时。
- Completed 第一版只读，保留删除日志入口。

## 9. 动态分类统计

- 今日统计继续按当天 Completed 日志的 `primaryCategory` 聚合。
- 默认分类保留，有时长的新分类会自动加入并排在前面。
- 每行展示分类名、时长和条形进度。

## 10. 验收结果

- 通过：`./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`
- 通过：`./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`
- 失败：`./node_modules/.bin/electron-vite build`
- 失败原因：当前本机 Rollup native optional dependency `@rollup/rollup-darwin-arm64` 动态库签名 / optional dependency 加载异常，需重装依赖后再跑真实 Electron smoke。

## 11. 是否触及跨边界

- 未触及跨边界。
- 未修改 3D、skills、脚本工具链、协议文件、财富、成长树或周回看业务逻辑。

## 12. 未完成事项

- 未做拖拽创建 / 调整时间块。
- 未接 Notion / Google Calendar / iCal。
- 未做完整字段编辑器。
- 未完成真实桌面点击截图验收，原因是当前依赖环境 build/dev 被 Rollup native optional dependency 阻塞。

## 13. 下一步建议

- Mac 端先执行 `rm -rf node_modules && pnpm install` 修复 Rollup native optional dependency。
- 运行 `pnpm typecheck && pnpm dev`，按交接卡完成三类弹窗、动态统计、周视图、详情面板和重叠块截图验收。
- 验收稳定后，再把 `TimeDebtDashboard.tsx` 拆成 Calendar / Modal / Insights 子组件。
