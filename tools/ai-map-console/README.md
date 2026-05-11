# AI Map Console MVP

只读型 AI 活点地图总控台 MVP，用于从项目状态底座生成开工摘要和短任务卡。

## 命令

```bash
node tools/ai-map-console/src/index.js status
node tools/ai-map-console/src/index.js task-card --agent codex --module time-debt
node tools/ai-map-console/src/index.js task-card --agent claude --module wealth
```

## 读取边界

第一版只读取以下路径：

- `AGENTS.md`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md` 的尾部片段
- `docs/project-map/MAP_STATUS.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`

缺失文件会在输出中标记为“缺失”，不会导致命令崩溃。
