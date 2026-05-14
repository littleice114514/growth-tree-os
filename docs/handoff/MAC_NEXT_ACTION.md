# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-14 17:59 CST

## 2. 本轮已完成

- 完成 Time Debt C 线全局快捷键回归排查。
- 确认快捷键链路仍在：main `globalShortcut` -> preload `onOpenQuickFloat` -> renderer `TimeDebtQuickFloat`。
- 确认当前实际主快捷键仍为 `CommandOrControl+Shift+Space`。
- 确认 fallback 仍为 `CommandOrControl+Shift+L`。
- 确认真实 Electron App 启动时注册成功，终端输出 `[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 确认 App 聚焦时 `Cmd+Shift+Space` 可展开右下角 Time Debt `时间控制台`。
- 确认 App 不聚焦时，先切到 Finder 后触发 `Cmd+Shift+Space`，Electron App 可被重新聚焦并展开浮窗。
- 确认 Wealth 页面未白屏，且快捷键触发后不强制切页。
- 因主快捷键可用，本轮未改为 `CommandOrControl+Alt+T`。
- 本轮未修改 Wealth、未修改依赖文件、未修改 project-state / project-map 禁止文件。

## 3. 本轮修改文件

- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-hotkey-regression-check.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `git branch --show-current`：`feature/integration-time-debt-wealth`。
- 起始 `git rev-parse --short HEAD`：`9d89025`。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 可启动。
- 主进程注册日志：`[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- App 聚焦时主快捷键生效。
- App 不聚焦时主快捷键生效。
- Wealth 页面不白屏。

### 未验证 / 风险

- fallback `CommandOrControl+Shift+L` 未触发；原因是主快捷键已注册并生效，本轮无须切到 fallback。
- 当前工作区仍存在并行 Wealth 未提交现场；本轮未提交这些文件。

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

- 必须打开真实 Electron App，不要只打开浏览器里的 localhost。
- 终端应出现 `[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 打开 App 后右下角能看到 Time Debt 浮窗入口。
- 在 Wealth 页面收起浮窗。
- App 聚焦时按 `Cmd+Shift+Space`，预期右下角展开 `时间控制台` 并显示 `已通过快捷键打开`。
- 再次收起浮窗，切到 Finder / 浏览器 / 终端。
- App 不聚焦时按 `Cmd+Shift+Space`，预期 Electron App 被聚焦，右下角展开 `时间控制台`。
- 如果主快捷键没有反应，再测试 `Cmd+Shift+L`。
- Wealth 页面不白屏，快捷键唤起时不强制切到 Time Debt 页面。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

等待 Wealth/行情线程收口后做 integration 验收：确认 Time Debt C 线全局快捷键、Wealth 行情改动、preload/contracts IPC 增量可以共存。不要进入 D 线，不要做 Settings 页面，不要做快捷键自定义，不要做桌面悬浮球。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- `pnpm dev` 终端中与 `globalShortcut` 或 `time-debt` 相关的日志；
- 默认首页截图；
- Wealth 页面截图；
- 快捷键触发前后的右下角浮窗截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要修改 Wealth 投资模块，除非下一轮任务明确进入 Wealth integration 验收。
- 不要修改 project-state 三件套或 `MAP_STATUS.md`。
- 不要推进 D 线、Settings 页面、快捷键自定义、系统托盘或桌面级置顶窗口。
