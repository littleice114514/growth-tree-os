# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:Littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-13

## 2. 本轮已完成

- 修正 MVP 使用版入口范围，保留基础成长闭环模块。
- 主界面开放入口调整为：`时间负债`、`财富`、`复盘记录`、`提醒`、`Review`。
- 继续隐藏 SystemX、Tree / Nodes / Graph、Life Dashboard、Life Vitality Tree、Life Curve、AI / 3D / Obsidian 等实验或半成品入口。
- 默认进入 `Time Debt / 时间负债`。
- 旧状态兜底改为：基础闭环模块允许保留，隐藏模块统一回落到 `timeDebt`。
- 未删除旧模块源码，未修改 Time Debt / Wealth / Review / Reminders 业务逻辑。

## 3. 本轮修改文件

- `app/renderer/src/types/ui.ts`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/app/store.ts`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/dev-log/2026-05/2026-05-13/mvp-surface-scope-correction.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 可启动，renderer 地址为 `http://localhost:5173/`。
- 浏览器 smoke 已确认：主导航显示 `时间负债` / `财富` / `复盘记录` / `提醒` / `Review`。
- 点击 `时间负债`、`财富`、`复盘记录`、`提醒`、`Review` 均不白屏。
- 导航中未看到 `SystemX`、`成长树`、`人生总览`、`人生生长树`、`人生曲线`、`3D`、`Obsidian`。

### 未验证 / 风险

- `reviews` 是本轮新增的轻量 view key，用于暴露已有 `features/reviews` 复盘记录组件，不是新增业务模块。
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
- 主导航能看到：`时间负债`、`财富`、`复盘记录`、`提醒`、`Review`。
- 点击 `时间负债` 后页面正常显示，不白屏。
- 点击 `财富` 后页面正常显示，不白屏。
- 点击 `复盘记录` 后能看到最近复盘与新建复盘入口，不白屏。
- 点击 `提醒` 后提醒工作台正常显示，不白屏。
- 点击 `Review` 后周回看正常显示，不白屏。
- 主界面看不到 `SystemX`、成长树、Tree / Nodes / Graph、人生总览、人生生长树、人生曲线、AI Map、AI Console、3D、Obsidian 等入口。
- 如果旧状态是隐藏模块，应自动回到 `timeDebt`。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

只做真实 Electron UI 基础闭环 smoke：验证时间负债、财富、复盘记录、提醒、Review 五个入口均可打开且实验模块不可见；不要开发新功能。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- 默认首页截图；
- 导航栏截图；
- 五个保留入口页面异常截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要重新开放 SystemX、Tree / Nodes / Graph、Life Dashboard、3D、Obsidian 或 AI 入口。
- 不要修改 Time Debt / Wealth / Review / Reminders 业务逻辑。
