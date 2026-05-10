# NEXT_ACTION｜下一步唯一入口

更新时间：2026-05-10

## 1. 当前唯一建议主线

先使用 project-state 新底座作为后续开工入口，再进入业务开发。下一轮业务开发不要同时开 Time Debt 和 Wealth。

## 2. Codex 下一轮入口

目标：推进 Time Debt / 时间负债、数据记录链路或项目地图状态接续。

先读：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/NEXT_ACTION.md`
3. `docs/project-map/MAP_STATUS.md`
4. `docs/handoff/TIME_DEBT_MODULE_INDEX.md`

允许范围：

- `app/renderer/src/features/time-debt/**`
- 与 Time Debt 直接相关的最小文档
- `docs/project-map/MAP_STATUS.md`
- `docs/project-state/**`

## 3. Claude 下一轮入口

目标：完成 WealthDashboardPreview 接真实 localStorage 数据。

先读：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/NEXT_ACTION.md`
3. `docs/project-map/MAP_STATUS.md`
4. `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`

允许范围：

- `app/renderer/src/features/wealth/**`
- 与 Wealth 直接相关的最小文档
- `docs/project-map/MAP_STATUS.md`
- `docs/project-state/**`

## 4. 本轮不做事项

- 不开发新功能。
- 不改 Time Debt / Wealth 业务代码。
- 不改 UI。
- 不改数据库、IPC、Zustand store、主页面布局。
- 不推进 AI/RAG、云同步、商业化、真实登录或 3D。
- 不读取重资源。

## 5. 推荐读取文件

最小开工读取：

1. `AGENTS.md`
2. `docs/project-state/CURRENT_STATUS.md`
3. `docs/project-state/NEXT_ACTION.md`
4. `docs/project-state/LOG_INDEX.md`
5. `docs/project-map/MAP_STATUS.md`

全局路线按需读取：

- `docs/project-map/PROJECT_MAP.md`

模块索引按需读取：

- Time Debt：`docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- Wealth：`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`

## 6. 禁止修改范围

- 未经明确任务，不改 `app/main/db.ts`。
- 未经明确任务，不改 `app/main/ipc.ts`。
- 未经明确任务，不改 `app/renderer/src/app/store.ts`。
- 未经明确任务，不改 `app/renderer/src/pages/MainWorkspacePage.tsx`。
- Codex 不改 `app/renderer/src/features/wealth/**`。
- Claude 不改 `app/renderer/src/features/time-debt/**`。
- 不重写 `docs/project-map/PROJECT_MAP.md`。

## 7. 最小验收标准

文档/流程任务：

```bash
pnpm typecheck
pnpm build
git diff --stat
```

业务任务：

- 先执行 `pnpm typecheck` 和 `pnpm build`。
- 如涉及页面交互，再启动 `pnpm dev` 做最小 smoke。
- 输出是否修改业务代码、是否越界、下一轮唯一入口。
