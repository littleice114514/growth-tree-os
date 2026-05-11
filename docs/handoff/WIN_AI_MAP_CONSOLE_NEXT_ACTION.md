# Win AI Map Console 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/win-ai-map-console-mvp
- 当前设备：Windows
- 当前任务：AI 活点地图总控台 MVP

## 2. 本轮目标

新增只读型 `tools/ai-map-console`，用于读取 project-state 底座并生成 Codex / Claude 短任务卡。

## 3. 本轮边界

- 只新增工具、Win handoff 和 Win dev-log。
- 不修改 Time Debt / Wealth 业务代码。
- 不修改 Electron 页面。
- 不修改 `docs/project-state/CURRENT_STATUS.md`、`NEXT_ACTION.md`、`LOG_INDEX.md`。

## 4. 验收命令

```bash
node tools/ai-map-console/src/index.js status
node tools/ai-map-console/src/index.js task-card --agent codex --module time-debt
node tools/ai-map-console/src/index.js task-card --agent claude --module wealth
pnpm typecheck
pnpm build
```

## 5. 下一轮唯一入口

在 Mac 或下一轮 Windows 中，先拉取 `feature/win-ai-map-console-mvp`，运行三条 CLI 命令确认输出稳定，再决定是否把 map-console 输出接入更正式的项目开工 SOP。

## 6. 注意事项

- `AGENTS.md` 当前缺失，CLI 应显示缺失但不能崩溃。
- `docs/project-map/MAP_STATUS.md` 当前缺失，CLI 应回退到 project-state 三件套。
- 业务端继续推进时不要修改 `tools/ai-map-console/**`。
