# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-29 16:59 CST

## 2. 本轮已完成

- Time Debt 表单回滚：开始计时、补记时间、规划任务弹窗恢复独立 `一级分类` / `二级项目`。
- 删除日常表单中的 `分类项目` 合并字段、`工作量` 和 `工作量单位`。
- `AI 赋能比例（%）` 改为 0-100 百分比输入，空值按 0 处理。
- 开始计时弹窗恢复 `备注`，备注与 AI 比例会随 active timer 保存到完成日志。
- 未来计划任务未到 `plannedStart` 前不能开始，Today / Calendar / Reminder / navigation intent 均加了开始守卫。
- 今日时间统计改为按当天日志的 `primaryCategory` 动态聚合，新一级分类会自动显示。
- Today 右侧时间日志表继续向 Notion Calendar 日视图优化：紧凑滚动时间轴、当前时间定位、事件块详情、重叠并排和同文件拖拽结构预留。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `app/renderer/src/features/reminders/ReminderPanel.tsx`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-form-plan-stats-calendar-fix.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json` 通过。
- `./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json` 通过。
- 代码搜索确认 Time Debt / Reminder 相关前端中不再出现 `分类项目`、`工作量`、`工作量单位`、`分类配置` 旧 UI 文案。
- 未修改 3D、skills、`.codex`、`.claude`、脚本工具链、协议文件、财富、成长树或周回看业务逻辑。

### 未验证 / 风险

- `./node_modules/.bin/electron-vite build` 失败，原因是本机 Rollup native optional dependency `@rollup/rollup-darwin-arm64` 动态库签名加载失败，错误为 mapped file 与 process Team ID 不一致。
- 当前环境 PATH 只暴露 Codex 内置 `node`，没有可直接调用的 `pnpm` / `npm` / `corepack`，因此未完成 `pnpm dev` 真实桌面点击验收。
- time-plan reminders、plans、active timer 仍是 renderer localStorage 能力，不代表跨设备同步。

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

优先使用项目 pnpm：

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm typecheck
pnpm dev
```

如果遇到 Rollup native optional dependency 签名或缺失问题，先重装依赖：

```bash
rm -rf node_modules
pnpm install
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，无页面报错。
- 点击 `开始计时`，确认字段只有：任务名、一级分类、二级项目、开始时间、AI 赋能比例（%）、备注。
- 点击 `补记时间`，确认字段只有：任务名、一级分类、二级项目、开始时间、结束时间、状态分、AI 赋能比例（%）、结果记录 / 备注。
- 点击 `规划任务`，确认字段只有：任务名、一级分类、二级项目、计划开始、计划结束、备注。
- 三类弹窗都不显示：分类项目、工作量、工作量单位。
- 创建未来 10 分钟后的计划任务，确认 Today 待开始列表、日历块详情和 Reminder 卡片均显示 `未到开始时间` 且不能开始。
- 创建当前已到点计划，确认可以开始计时。
- 创建已错过计划，确认显示 `已错过`，并提供现在开始、转为补记、忽略。
- 补记一个新一级分类，例如 `公众号`，进入洞察 / 今日时间统计，确认 `公众号` 自动成为统计条。
- 创建两个重叠时间块，确认日历事件块并排显示且可点击查看详情。
- 切换 Reminder、成长树、财富、周回看，确认无明显回归。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

恢复依赖环境后运行真实 Electron smoke，并截图记录：开始计时弹窗、补记时间弹窗、规划任务弹窗、未到点计划禁用按钮、到点计划允许开始、新一级分类统计、优化后的时间日志表、重叠时间块。若全部通过，再继续拆分 `TimeDebtDashboard.tsx` 到独立 Calendar / Modal / Insights 子组件并补轻量测试。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Time Debt 页面异常截图
- Reminder 页面异常截图
- 开发者控制台首个关键错误
- 具体失败入口：开始计时弹窗 / 补记弹窗 / 规划弹窗 / 未到点计划 / 到点计划 / 已错过计划 / 动态统计 / 重叠时间块

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- 本轮不接系统通知、Notion Calendar、Google Calendar、iCal、周视图、月视图或数据库迁移。
