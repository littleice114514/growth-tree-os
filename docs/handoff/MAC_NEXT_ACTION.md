# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：feature/m13-time-debt-timer-stability-p0
- 最新 commit：以本轮最终汇报和 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-05-08

## 2. 本轮已完成

- 已完成 M13 P0｜Time Debt Timer Stability。
- 已为 Time Debt runningTimer 增加 localStorage 持久化和刷新恢复。
- 已增加计时中刷新/关闭页面的 beforeunload 离开提醒。
- 已在结束计时成功后清理 runningTimer 状态和 localStorage key。
- 已在保存失败时显示最小错误提示，并保留计时器供重试，提供安全清理入口。
- 已确认本轮未做跨天拆分、标题选项复用、全局状态重构、数据库结构修改或无关 UI 大改。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-08/mac-time-debt-timer-stability-p0.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- 已确认 diff 范围只包含 Time Debt 计时器文件和项目状态 / 交接文档。
- 已确认未修改 3D、Wealth、Tree、assets、数据库结构或全局状态管理架构。

### 未验证 / 风险

- 本轮未完成真实浏览器手动验收；另一设备需要进入 Time Debt 页面验证刷新恢复、beforeunload 提醒和 localStorage 清理。
- P1 跨天计时拆分未做。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git fetch origin
git checkout feature/m13-time-debt-timer-stability-p0
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd ~/Developer/growth-tree-os
git status --short
git fetch origin
git checkout feature/m13-time-debt-timer-stability-p0
git pull origin feature/m13-time-debt-timer-stability-p0
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报一致。

## 6. Mac 端环境准备

本轮修改 Time Debt 前端代码，需要安装依赖并启动应用验收。

```bash
pnpm install
pnpm typecheck
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- `git branch --show-current` 输出 `feature/m13-time-debt-timer-stability-p0`。
- `git status --short` 没有输出。
- 进入 Time Debt 页面，新建一个计时任务并开始计时。
- 刷新页面后，正在计时的任务仍然显示。
- 已进行时间继续增长，不归零或消失。
- 结束计时后可以生成记录。
- 结束计时后，localStorage 中 `growth-tree-os:time-debt-running-timer:v1` 被清理。
- 计时中刷新或关闭页面时有浏览器离开提醒。
- 如模拟保存失败，页面显示错误，允许重试或安全清理。

预期结果：Time Debt 计时器不会因刷新丢失状态，保存失败时不会静默卡死。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

读取 `AGENTS.md`、`docs/project-state/CURRENT_STATUS.md`、`docs/project-state/NEXT_ACTION.md`、`docs/project-state/LOG_INDEX.md` 最近 5 条，然后执行：M13 P1｜Time Debt 跨天计时拆分。不要默认扫描完整 `docs/dev-log` 历史，不要修改 3D、Wealth、Tree 或 assets。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status --short` 输出
- `git branch --show-current` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm typecheck` 完整输出
- Time Debt 页面异常截图
- 浏览器控制台首个关键错误
- localStorage 中 `growth-tree-os:time-debt-running-timer:v1` 的状态截图或文本
- pull、checkout、依赖安装或启动命令的完整报错

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status --short`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮策略是只做 Time Debt 计时器 P0 稳定性，不做跨天拆分、标题选项复用、3D 模块代码、Wealth / Tree 功能、模型文件、数据库修改或全局状态重构。
