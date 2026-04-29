# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-today-ui
- 最新 commit：以最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-29

## 2. 本轮已完成

- 将 Time Debt 主 tab 精简为 `今日台 / 时间轴 / 洞察`。
- 将工作时间标准、时间负债参数和分类配置移入右上角 `时间标准设置`。
- 将 Today 页面重构为今日时间操作中心：今日状态、当前焦点、待开始任务、诊断微摘要、今日时间日志表。
- 实现三种入口：开始计时、补记时间、规划任务。
- 新增 Planned 计划任务本地存储，开始后可转 Active，结束后生成 Completed 日志。
- Insights 增加 CSS 分类时间分布条形图，并将诊断改为结论卡、原因卡、行动建议卡。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-today-ui.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- TypeScript 检查通过。
- 使用 bundled Node runtime 执行 `electron-vite build` 通过。
- 未修改 3D、skills、`.codex`、`.claude`、脚本工具链和 `docs/dev-protocol/**`。

### 未验证 / 风险

- 当前 shell 没有全局 `pnpm`，需要 Mac 端确认 `pnpm install/typecheck/build/dev`。
- 真实 Electron 页面点击流尚需 Mac 端运行后验收。
- 计划任务暂存于 `growth-tree-os:time-debt-plans:v1`，不参与跨设备同步。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/Littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/mac-time-debt-today-ui
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/mac-time-debt-today-ui
git pull origin feature/mac-time-debt-today-ui
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报一致。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

如果 `pnpm` 不存在：

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，主 tab 只显示 `今日台 / 时间轴 / 洞察`。
- 点击 `时间标准设置`，确认工作时间标准、时间负债参数、分类配置仍可访问。
- 在 Today 点击 `补记时间`，创建一条日志，确认右侧时间轴出现 Completed 时间块。
- 点击 `规划任务`，创建一条计划，确认右侧时间轴出现 Planned 时间块，左侧待开始任务出现该任务。
- 点击计划任务的 `开始`，确认当前焦点进入计时中，右侧出现 Active 时间块。
- 点击 `结束计时并生成日志`，确认生成 Completed 日志块。
- 进入 `时间轴`，确认按日期筛选和日志列表正常。
- 进入 `洞察`，确认分类条形图、标准/实际工时对比、结论/原因/行动建议卡片正常显示。
- 快速检查成长树、财富、提醒、周回看页面无明显报错或布局崩坏。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

运行真实 Electron smoke，按上述验收路径截图检查 Time Debt Today、今日时间日志表、开始计时入口、补记时间弹窗、规划任务弹窗、Insights 图表统计、诊断卡片和时间标准设置入口。如验收通过，下一轮再拆分 Time Debt 子组件；如失败，优先修复页面点击流和横向溢出问题。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Time Debt 页面异常截图
- 开发者控制台首个关键错误
- 发生问题前点击了哪个入口：开始计时 / 补记时间 / 规划任务 / 设置 / Insights

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude` 或协议文件。
- Planned 计划任务是 V1 前端本地能力，不代表已实现跨设备同步或外部日历接入。
