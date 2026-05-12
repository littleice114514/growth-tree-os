# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:Littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-12

## 2. 本轮已完成

- 新增 SystemX / 系统感知 MVP 页面入口。
- 支持手动选择输入类型、填写标题和正文。
- 使用 mock sense engine 生成结构化分析，不接真实 AI。
- 使用 localStorage 保存最近 100 条 SystemX 历史记录。
- 支持点击历史记录回看分析结果，支持清空历史确认。
- 保留 Time Debt 和 Wealth 入口，不改其业务逻辑。
- 确认集成分支所需 `echarts` / `echarts-for-react` 依赖可被本地安装物化。

## 3. 本轮修改文件

- `app/renderer/src/features/systemx/**`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `app/renderer/src/types/ui.ts`
- `docs/project-map/SYSTEMX_ROUTE_MAP.md`
- `docs/project-map/MAP_STATUS.md`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/dev-log/2026-05/2026-05-12/mac-systemx-mvp.md`
- `docs/handoff/DEVELOPMENT_LOG.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- SystemX 未接真实 AI。
- SystemX 未改 SQLite / IPC / preload / main process。

### 未验证 / 风险

- 真实 Electron UI 点击 smoke 待 Mac 端补验。
- SystemX 当前只使用 mock engine 和 localStorage。
- SystemX 当前不读取 Time Debt / Wealth 真实数据。

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

- 主导航中能看到 `SystemX`。
- 点击 `SystemX` 能进入 `SystemX｜系统感知台`。
- 选择“决策判断”，输入标题和正文。
- 点击“开始系统感知分析”后能看到摘要、事实、模式、原则、行动、风险、验证方式和系统标签。
- 刷新或切换页面后历史记录仍然存在。
- 点击历史记录后能重新查看对应分析结果。
- Time Debt 入口仍可访问。
- Wealth 入口仍可访问。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

用真实 Electron UI 对 SystemX MVP 做轻量 smoke：验证输入、mock 分析、历史保存、刷新回看、清空历史确认，并确认 Time Debt / Wealth 入口仍正常；只记录验收结果，不扩大到真实 AI、数据库、浮窗或数据桥。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- SystemX 页面异常截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要把 SystemX 扩展到真实 AI、SQLite、IPC、preload、main process、浮窗、阅读或 3D。
