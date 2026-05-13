# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:Littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-13

## 2. 本轮已完成

- 完成 MVP 使用版收口。
- 主界面只暴露 `时间负债` 和 `财富` 两个入口。
- 隐藏 SystemX、成长树、Review、提醒、人生总览、人生生长树、人生曲线、周回看等未作为本轮使用版开放的入口。
- 默认进入 `Time Debt / 时间负债`。
- 对旧 view 状态增加兜底：非 `timeDebt` / `wealth` 会回落到 `timeDebt`。
- 未删除旧模块源码，未修改 Time Debt / Wealth 业务逻辑。

## 3. 本轮修改文件

- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/app/store.ts`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/dev-log/2026-05/2026-05-13/mvp-surface-freeze.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 可启动，renderer 地址为 `http://localhost:5173/`。
- 浏览器 smoke 已确认：默认可见 `时间负债`，主导航只显示 `时间负债` / `财富`，点击两者均不白屏。

### 未验证 / 风险

- 旧模块源码仍保留，只是从主界面入口隐藏。
- 当前分支仍有本轮之前遗留的未提交 project-state / SystemX 文档改动，Mac 端接手时不要覆盖本地未提交内容。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:Littleice114514/growth-tree-os.git
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

确认输出的 commit 应为本轮最终汇报中的 commit。

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

- App 默认进入 `时间负债 / Time Debt`。
- 主导航只看到 `时间负债` 和 `财富`。
- 点击 `时间负债` 后页面正常显示，不白屏。
- 点击 `财富` 后页面正常显示，不白屏。
- 主界面看不到 `SystemX`、成长树、Review、提醒、人生总览、人生生长树、人生曲线、周回看、AI OS、3D、Obsidian 等入口。
- 如果通过旧状态进入隐藏 view，应自动回到 `timeDebt`。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

只做真实 Electron UI smoke：验证默认进入 Time Debt、主导航只剩 Time Debt / Wealth、两个模块都不白屏，并记录截图或控制台首个错误；不要开发新功能。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- 默认首页截图；
- 导航栏截图；
- Time Debt / Wealth 页面异常截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要重新开放 SystemX、成长树、Review、提醒、Life Dashboard、3D 或 Obsidian 入口。
- 不要修改 Time Debt / Wealth 业务逻辑。
