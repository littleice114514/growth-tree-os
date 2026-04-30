# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-30 CST

## 2. 本轮已完成

- Time Debt 新增轻量字段配置层，集中描述 text / number / percent / select / multi_select / status / datetime / checkbox，并预留 relation / rollup / formula。
- 开始计时、补记时间、规划任务弹窗统一恢复一级分类 / 二级项目，并移除新 UI 中的分类项目、工作量、工作量单位、分类字典。
- AI 赋能比例按 0-100 输入和显示，输入 30 显示为 30%。
- 日志新增标签和干扰源，计划任务新增标签；新增分类、项目、标签、干扰源继续保存在 renderer localStorage options 中。
- 今日统计继续按当天 Completed 日志的动态一级分类聚合，新分类有时长会自动显示。
- 时间轴 tab 升级为周视图：7 天日期列、小时刻度、当前时间线、周切换、时间块定位、重叠并排、右侧详情面板。
- Planned 未到点不能开始；到点可开始；Missed 可现在开始、转为补记或忽略；Active 可在详情面板结束计时。

## 3. 本轮修改文件

- `app/shared/timeDebt.ts`
- `app/renderer/src/features/time-debt/timeDebtFieldConfig.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtOptionsStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-fields-weekly-calendar.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json` 通过。
- `./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json` 通过。
- 代码搜索确认新 Time Debt 表单 UI 中没有 `分类项目`、`工作量`、`工作量单位`、`分类字典` 旧文案。
- 未修改 3D、skills、`.codex`、`.claude`、脚本工具链、协议文件、财富、成长树或周回看业务逻辑。

### 未验证 / 风险

- `./node_modules/.bin/electron-vite build` 失败，原因是当前本机 Rollup native optional dependency `@rollup/rollup-darwin-arm64` 动态库签名 / optional dependency 加载异常。
- 当前 shell 中 `pnpm`、`npm` 不在 PATH，未完成真实 Electron 桌面点击截图验收。
- `workload/workloadUnit` 仍作为历史兼容字段保留在共享类型里，但新 UI 不再写入用户输入。

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

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm typecheck
pnpm dev
```

如果遇到 Rollup native optional dependency 签名或缺失问题：

```bash
rm -rf node_modules
pnpm install
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，无页面报错。
- 开始计时弹窗包含：任务名、一级分类、二级项目、开始时间、AI 赋能比例（%）、标签、备注。
- 补记时间弹窗包含：任务名、一级分类、二级项目、开始时间、结束时间、状态分、AI 赋能比例（%）、标签、干扰源、备注。
- 规划任务弹窗包含：任务名、一级分类、二级项目、计划开始、计划结束、标签、备注。
- 三类弹窗都不显示：分类项目、工作量、工作量单位、分类字典。
- 输入 AI 赋能比例 `30`，确认显示为 `30%`。
- 补记一个新一级分类，例如 `公众号`，进入洞察 / 今日时间统计，确认 `公众号` 自动成为统计条。
- 进入周视图，确认显示当前周范围、上一周 / 下一周 / 今天按钮、7 天日期列、小时刻度和当前时间线。
- 创建 Completed / Planned / Active 时间块，确认按日期和时间定位。
- 点击时间块，确认右侧详情面板出现。
- Planned 未到时间时开始按钮禁用，到点后允许开始。
- Active 详情中可以结束计时。
- 两个重叠时间块并排显示，不互相完全遮挡。
- 切换上一周 / 下一周后只显示对应周数据。
- 回到今日台、洞察、提醒页面，确认无明显回归。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

修复依赖环境后运行真实 Electron smoke，并截图记录三类弹窗、AI 30% 显示、新增一级分类统计、周视图完整界面、当前时间线、Completed / Planned / Active 时间块、右侧详情面板、重叠时间块和周切换过滤。验收稳定后，再拆分 `TimeDebtDashboard.tsx` 到独立 Calendar / Modal / Insights 子组件。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Time Debt 页面异常截图
- Reminder 页面异常截图
- 开发者控制台首个关键错误
- 具体失败入口：开始计时弹窗 / 补记弹窗 / 规划弹窗 / 周视图 / 详情面板 / 动态统计 / 重叠时间块

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- 本轮不接系统通知、Notion Calendar、Google Calendar、iCal、月视图或数据库迁移。
