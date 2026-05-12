# 开发日志｜Mac｜Time Debt 表单计划统计日历修复｜2026-04-29

## 1. 本轮目标

回滚 Time Debt 日常表单中错误合并的分类字段，删除工作量输入，统一 AI 赋能比例为百分比输入；同时禁止规划任务提前开始，支持今日统计按一级分类动态聚合，并继续把 Today 时间日志表优化为更接近日历日视图的事件块结构。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `app/renderer/src/features/reminders/ReminderPanel.tsx`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-form-plan-stats-calendar-fix.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

- 未触碰 3D 模块、重资源、Windows skills、`.codex/`、`.claude/`。
- 未修改脚本、工具链、协议文件和数据库 / IPC。
- 未修改财富、成长树、周回看业务逻辑。
- 本轮属于 Mac 默认 UI / 页面体验 / 前端交互范围，无跨边界修改声明需求。

## 5. 验收命令

```bash
git status --short
git branch --show-current
git remote -v
./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json
./node_modules/.bin/electron-vite build
```

## 6. 验收结果

- TypeScript node 配置检查通过。
- TypeScript renderer 配置检查通过。
- 代码搜索确认 Time Debt / Reminder 相关前端代码中不再出现 `分类项目`、`工作量`、`工作量单位`、`分类配置` 等旧 UI 文案。
- `electron-vite build` 未通过，阻塞原因为本机 Rollup native optional dependency `@rollup/rollup-darwin-arm64` 动态库签名加载失败，错误为 mapped file 与 process Team ID 不一致；不是本轮 TypeScript 代码错误。
- 尚未完成真实 Electron 点击截图验收，需后续在依赖环境恢复后运行 `pnpm dev` 检查。

## 7. 核心改动

- 分类字段回滚：开始计时、补记时间、规划任务弹窗改回独立 `一级分类` / `二级项目`，继续保存到 `primaryCategory` / `secondaryProject`。
- 工作量字段删除：日常表单不再显示或保存 `工作量` / `工作量单位`；历史日志中的旧字段保持兼容，不做批量迁移。
- AI 赋能比例：表单统一显示 `AI 赋能比例（%）`，输入自动限制在 0-100，保存后继续由共享统计层归一化显示为百分比。
- 备注恢复：开始计时弹窗恢复 `备注`，active timer 本地缓存增加可选 `resultNote` / `aiEnableRatio`，结束计时时带入 Completed 日志。
- 计划开始限制：新增统一 `canStartPlan` 判断，未来计划在 Today、Calendar、Reminder 和 navigation intent 路径中都不能提前开始；到点允许开始，错过后允许现在开始、转补记或忽略。
- 动态分类统计：今日统计按当天日志的 `primaryCategory` 聚合，新一级分类会自动追加展示。
- 日历表优化：Today 日历压缩为可滚动日视图，拆出 `TimeGrid`、`TimeBlock`、`TimeBlockPopover` 和时间定位 helper，默认滚到当前时间附近，保留重叠时间块并排显示。
- 顶部结构：保留 `今日时间操作中心` 标题、说明、状态卡、时间标准入口和内部 tab。

## 8. 风险与遗留问题

- `electron-vite build` 需要修复本机 Rollup optional dependency 签名 / 安装状态后再跑。
- 真实点击验收未完成，尤其需要截图检查三类弹窗、未来计划禁用、到点计划可开始、动态分类统计和重叠时间块。
- 日历视图已拆成同文件子组件，后续如继续扩展拖拽，可再拆到独立文件。

## 9. 下一步建议

先在 Mac 端恢复依赖环境并运行 `pnpm dev`，按 `docs/handoff/MAC_NEXT_ACTION.md` 完成真实桌面验收。若通过，下一轮优先做拖拽创建 / 调整时间块前的组件文件拆分和轻量测试补齐。

## 10. 断点续跑记录

### 10.1 断点检查结果

- 当前分支：`feature/mac-time-debt-plan-flow-overlap-ui`。
- 当前未提交改动集中在 Time Debt、Reminder time-plan 入口、本日志和 Mac handoff。
- `git diff --stat` 显示主要变更为 `TimeDebtDashboard.tsx` 的表单、计划守卫、统计与日历视图调整，以及 active timer / plan storage 的兼容字段。
- 代码搜索确认没有残留 `分类项目`、`工作量`、`工作量单位`、`分类配置`、`CategorySelect` 等旧入口。
- 未发现未引用旧组件导致的 TypeScript 报错；`tsc` 检查通过。

### 10.2 已完成项

- A 分类字段恢复：三类弹窗恢复 `一级分类` / `二级项目`。
- B 工作量字段删除：日常表单不再展示或写入工作量。
- C AI 百分比：`AI 赋能比例（%）` 限制 0-100。
- D 开始计时备注：备注保存进 active timer，并在结束计时时进入日志。
- E 计划开始限制：Today、Calendar、Reminder、navigation intent 均禁止未来计划提前开始。
- F 动态分类统计：今日统计按 `primaryCategory` 动态聚合。
- G 日历优化：时间轴更紧凑，默认靠近当前时间，可点击详情，重叠时间块并排。

### 10.3 本次续做项

- 重新执行协议读取、git 状态和 diff 断点检查。
- 复跑 TypeScript 检查与旧文案搜索。
- 更新 `docs/handoff/MAC_NEXT_ACTION.md`，把上一轮旧的 `分类项目` 验收口径改为本轮真实字段。
- 补充本断点续跑记录。

### 10.4 未完成项

- 真实 Electron 点击截图验收未完成。
- `electron-vite build` 仍被本机 Rollup native optional dependency 签名问题阻塞，需要重装依赖后复跑。

### 10.5 双端边界

- 未触及跨边界区域。
- 未修改 Windows 端 3D、skills、脚本、工具链、协议文件。
