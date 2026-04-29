# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-29 14:24 CST

## 2. 本轮已完成

- 修正日常弹窗文案，不再在高频记录/规划界面显示“分类字典”。
- 扩展计划任务本地状态，支持 `planned / active / completed / abandoned`。
- 区分计划时间与真实时间：保留 plannedStart/plannedEnd，点击开始后记录 actualStart，结束后记录 actualEnd/actualDuration。
- 保存规划任务后只显示 Planned，不会自动进入计时。
- 增加页面内提醒状态：计划中、即将开始、已到点、已错过。
- 已错过计划支持现在开始、转为补记、放弃。
- 今日时间日志表增加重叠时间块并排布局。
- UI 轻量精修：更稳定左右栏、待开始任务提醒样式、时间块状态样式。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtPlansStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-plan-flow-overlap-ui.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- TypeScript 检查通过。
- 使用 bundled Node runtime 执行 `electron-vite build` 通过。
- 未修改 3D、skills、`.codex`、`.claude`、脚本工具链和 `docs/dev-protocol/**`。

### 未验证 / 风险

- 真实 Electron 点击流尚需 Mac 端运行后验收。
- 当前计划任务仍为 localStorage 能力，不做跨设备同步。
- 提醒模块只预留计划任务字段，未写入 reminders 数据库。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/mac-time-debt-plan-flow-overlap-ui
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

- 打开 Time Debt，无页面报错。
- 点击 `规划任务`，确认弹窗没有“分类字典”。
- 创建一个未来计划，保存后不进入 Active，只显示 Planned。
- 创建 10 分钟内计划，确认左侧显示 `即将开始`。
- 创建当前/已到点计划，确认显示 `已到点` 并提供 `开始计时`。
- 创建已过期计划，确认显示 `已错过`，并提供 `现在开始 / 转为补记 / 放弃`。
- 点击计划任务 `开始计时`，确认才转为 Active，并显示原计划、实际开始、建议结束。
- 点击结束计时，确认生成 Completed 日志，actualDuration 按真实开始和结束计算。
- 创建两个或更多重叠时间块，确认在右侧时间轴并排显示，不互相完全覆盖。
- 打开 `时间标准设置`，确认工作时间标准、时间负债参数、分类配置仍可访问。
- 快速检查成长树、财富、提醒、周回看页面无明显报错或布局崩坏。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

运行真实 Electron smoke，并按截图建议记录 Time Debt 第二轮效果。如状态流和重叠显示通过，再拆分 `TimeDebtDashboard.tsx` 为更小组件；如失败，优先修复计划任务点击流和重叠布局。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Time Debt 页面异常截图
- 开发者控制台首个关键错误
- 具体失败入口：规划任务 / 待开始任务 / 开始计时 / 结束计时 / 重叠时间块 / 时间标准设置

## 10. 截图建议

- 创建规划任务弹窗
- 规划任务保存后的 Today 页面
- 今日待开始任务区域
- 计划任务到点提醒状态
- 点击开始后的 Active 状态
- 结束后的 Completed 状态
- 两个重叠时间块的时间轴
- 时间标准设置入口

## 11. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude` 或协议文件。
- Planned 计划任务是 V1 前端本地能力，不代表已实现跨设备同步、外部日历接入或系统通知。
