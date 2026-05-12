# 开发日志｜Mac｜Time Debt 今日台 UI 重构｜2026-04-29

## 1. 本轮目标

将 Time Debt 从后台表单型页面重构为“今日时间操作中心”，完成今日台、时间轴、洞察三段式信息架构，并保留已有时间日志数据兼容。

## 2. 当前分支

`feature/mac-time-debt-today-ui`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-today-ui.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

- 未修改 3D 模块。
- 未修改 `.codex/`、`.claude/`、`skills/`。
- 未修改脚本、工具链和资源管线。
- 未修改 `docs/dev-protocol/**`。
- 未重构共享 `TimeDebtLog` 数据结构，计划任务仅使用 Time Debt 模块私有 localStorage。

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
- 直接执行 `pnpm typecheck` 失败，原因是当前 shell 无全局 `pnpm`。
- 直接使用 Codex App 自带 Node 执行 build 曾触发 Rollup native package macOS code signature 报错；切换到 bundled Node runtime 后构建通过。
- 本轮未完成真实 Electron 桌面点击验收；下一步建议在 Mac 端运行 `pnpm dev` 后按 handoff 卡逐项截图检查。

## 7. 核心改动

- 主 tab 精简为 `今日台 / 时间轴 / 洞察`。
- 低频配置收进右上角 `时间标准设置`，包含工作时间标准、时间负债参数和分类配置。
- Today 页面改为左右分栏：左侧显示今日状态、当前焦点、待开始任务和诊断微摘要；右侧显示 00:00-24:00 今日时间日志表。
- 新增三种入口：开始计时、补记时间、规划任务。
- 新增 `growth-tree-os:time-debt-plans:v1` 私有 localStorage，用于 Planned 任务块。
- Timeline 改为时间账本式日志列表，保留按日期筛选和新增日志入口。
- Insights 用 CSS 条形图展示分类时间分布，并将诊断拆为结论、原因、行动建议三层卡片。

## 8. 风险与遗留问题

- 计划任务当前是前端私有 localStorage，尚未进入共享数据模型或跨设备同步。
- 本轮不做复杂拖拽、周/月视图、外部日历接入和系统级通知。
- 桌面端真实点击流尚需在可运行 Electron 环境里验收。
- 仓库当前继承了 `feature/win-dual-device-protocol` 的本地 ahead 提交作为分支基线，未丢弃该提交。

## 9. 下一步建议

Mac 端优先运行 `pnpm dev`，进入 Time Debt 后按 `docs/handoff/MAC_NEXT_ACTION.md` 的验收路径检查 Today、时间块、弹窗、计时闭环和 Insights 图表。若通过，再考虑将 Time Debt 组件拆分为独立子组件，降低 `TimeDebtDashboard.tsx` 体积。
