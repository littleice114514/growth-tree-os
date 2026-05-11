# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/win-ai-map-console-mvp
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-11

## 2. 本轮已完成

- Win 端新增只读型 `tools/ai-map-console` MVP。
- 支持 `status` 输出当前分支、commit、工作区状态、已读取/缺失底座文件、地图位置、主线、下一步入口和风险提示。
- 支持生成 Codex / Claude 短任务卡。
- 缺失 `AGENTS.md`、`MAP_STATUS.md`、Time Debt / Wealth handoff 时正常显示“缺失”，不会崩溃。
- 本轮未修改 Time Debt、Wealth、Electron 页面、3D 资源或 `app/renderer/**`。

## 3. 本轮修改文件

- `tools/ai-map-console/README.md`
- `tools/ai-map-console/package.json`
- `tools/ai-map-console/src/index.js`
- `tools/ai-map-console/src/paths.js`
- `tools/ai-map-console/src/readProjectState.js`
- `tools/ai-map-console/src/generateTaskCard.js`
- `docs/handoff/WIN_AI_MAP_CONSOLE_NEXT_ACTION.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-11/win-ai-map-console-mvp.md`

## 4. 当前验证结果

### 已验证

- `node tools/ai-map-console/src/index.js status`
- `node tools/ai-map-console/src/index.js task-card --agent codex --module time-debt`
- `node tools/ai-map-console/src/index.js task-card --agent claude --module wealth`
- `pnpm typecheck`
- `pnpm build`

### 未验证 / 风险

- `AGENTS.md` 当前缺失。
- `docs/project-map/MAP_STATUS.md` 当前缺失。
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md` 当前缺失。
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md` 当前缺失。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/win-ai-map-console-mvp
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/win-ai-map-console-mvp
git pull origin feature/win-ai-map-console-mvp
git rev-parse --short HEAD
```

确认输出的 commit 应为 Windows 最终汇报中的 commit。

## 6. Mac 端环境准备

```bash
pnpm install
```

如需运行应用：

```bash
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端运行：

```bash
node tools/ai-map-console/src/index.js status
node tools/ai-map-console/src/index.js task-card --agent codex --module time-debt
node tools/ai-map-console/src/index.js task-card --agent claude --module wealth
pnpm typecheck
pnpm build
```

预期结果：

- 三条 map-console 命令均正常输出中文内容。
- 缺失文件显示为“缺失”，命令不崩溃。
- `pnpm typecheck` 和 `pnpm build` 通过。

## 8. Mac 端下一轮任务

Mac 端继续推进业务进度时，只做 Time Debt / Wealth / UI / Electron smoke 相关工作，不修改 `tools/ai-map-console/**`、`docs/handoff/WIN_AI_MAP_CONSOLE_NEXT_ACTION.md` 或本轮 Win dev-log。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git branch --show-current` 输出；
- `git rev-parse --short HEAD` 输出；
- 三条 map-console 命令的完整报错；
- `pnpm typecheck` 或 `pnpm build` 的首个关键错误；
- 页面异常截图，如果失败发生在 UI 验收阶段。

## 10. 注意事项

- 不要直接覆盖 Mac 本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- Win 端 map-console 文件与 Mac 端业务文件保持隔离。
