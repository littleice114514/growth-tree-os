# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-13

## 2. 本轮已完成

- 完成 Time Debt 浮窗 A 线：App 内右下角快速记录入口。
- 新增 `记录` 浮窗按钮，支持展开/收起。
- 展开面板支持任务名称输入、空任务名提示、开始计时、计时中状态展示、已用时长展示、结束计时。
- 复用现有 Time Debt active timer 与 logs 存储，不新增第二套长期记录系统。
- 结束计时后写入 Time Debt 现有记录列表，并通知 Time Debt 页面刷新。
- 固化 `TIME_DEBT_FLOATING_WINDOW_MODE.md`，记录 A → B → C → D 浮窗路线。
- 未修改 Wealth 投资模块、project-state 三件套、`MAP_STATUS.md`、依赖文件、Electron IPC 或数据库结构。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `app/renderer/src/features/time-debt/timeDebtQuickTimer.ts`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-13/codex-time-debt-floating-window.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- 边界检查：本轮 staged 范围不包含 Wealth、project-state 三件套、`MAP_STATUS.md`、`package.json`、`pnpm-lock.yaml`。

### 未验证 / 风险

- 真实 Electron UI 点击 smoke 待 Mac 端复验。
- 当前工作区存在另一个分支/代理留下的 Wealth 未提交改动；本轮未提交这些 Wealth 文件。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/integration-time-debt-wealth
git pull origin feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报中的 commit 一致。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- App 打开后右下角能看到 `记录` 浮窗按钮。
- 点击 `记录` 后展开 `快速记录时间` 面板。
- 不输入任务名点击 `开始计时` 时提示 `先写一下这次在做什么`。
- 输入任务名后可以开始计时。
- 浮窗显示当前任务名和已用时长。
- 切换到 `财富` 页面后计时状态不丢失，Wealth 不白屏。
- 切回 `时间负债` 页面后计时状态仍在。
- 刷新页面后未结束计时能恢复。
- 点击 `结束计时` 后，Time Debt 中能看到新生成的记录。
- 不要验收 C/D 线，不要测试全局快捷键或桌面置顶小窗。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

只做 Time Debt 浮窗 A 线真实 Electron UI smoke：验证右下角浮窗入口、开始计时、页面切换保持、刷新恢复、结束写入 Time Debt 记录、Wealth 不受影响。不要开发 B/C/D，不要修改 Wealth，不要修改 project-state 三件套。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- 默认首页截图；
- 右下角浮窗按钮截图；
- 浮窗展开态截图；
- 计时中状态截图；
- Time Debt 记录列表截图；
- Wealth 页面异常截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要修改 Wealth 投资模块。
- 不要修改 project-state 三件套或 `MAP_STATUS.md`。
- 不要推进全局快捷键、Electron 主进程、IPC、数据库或桌面级置顶窗口。
