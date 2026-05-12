# NEXT_ACTION｜下一步唯一入口

更新时间：2026-05-12

## 1. 当前唯一优先事项

完成 `feature/integration-time-debt-wealth` 上 SystemX MVP 合入后的统一验收与接续。

## 2. 下一步执行顺序

1. 拉取 `feature/integration-time-debt-wealth` 最新 commit。
2. 执行 `pnpm install`、`pnpm typecheck`、`pnpm build`。
3. 启动 `pnpm dev`。
4. 验收主导航中 `SystemX`、`时间负债`、`财富` 三个入口都可进入。
5. 在 SystemX 输入一条“决策判断”，确认能生成 mock 分析、保存历史、刷新后回看。
6. 后续再决定是否设计 Floating Capture / Time Debt / Wealth 的只读数据桥。

## 3. 当前不做事项

- 不继续扩大 SystemX 范围。
- 不改 Time Debt / Wealth 业务逻辑，除非是 merge 冲突解决所必须。
- 不改数据库、IPC、Zustand store、主页面布局。
- 不推进真实 AI、RAG、云同步、商业化、真实登录或 3D。
- 不读取重资源。
- 不 push `main`。
- 不把 integration 合回 `develop`。
- 不 rebase，不 reset，不强推。

## 4. 推荐读取文件

最小开工读取：

1. `AGENTS.md`
2. `docs/project-state/CURRENT_STATUS.md`
3. `docs/project-state/NEXT_ACTION.md`
4. `docs/project-state/LOG_INDEX.md`
5. `docs/project-map/MAP_STATUS.md`

模块索引按需读取：

- Time Debt：`docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- Wealth：`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`

## 5. 最小验收标准

SystemX MVP 验收：

```bash
grep -n "echarts" package.json || true
grep -n "echarts-for-react" package.json || true
ls app/renderer/src/features/wealth
pnpm typecheck
pnpm build
pnpm dev
```

UI smoke 需要覆盖 SystemX 输入 / 分析 / 历史回看；Time Debt 入口仍可访问；Wealth 入口仍可访问。
