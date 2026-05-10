# NEXT_ACTION｜下一步唯一入口

更新时间：2026-05-10

## 1. 当前唯一优先事项

在 Mac Electron 中补验 Time Debt commit `0c35ad9`。

## 2. 验收重点

- 日历 UI 是否正常。
- 顶部裁切的 `12 AM` 是否不再出现。
- 空状态是否不遮挡日历网格。
- 时区入口是否不影响 day / week / month / custom days 切换。
- 开始 / 结束计时是否仍能生成日志。

## 3. 暂不启动 Wealth P1 的原因

Time Debt M13 仍需完成真实 Mac Electron UI smoke。先封住 M13，再决定是否启动 Wealth P1，避免双模块同时扩散。

## 4. 通过后的下一步选择

- 可封板 M13 Time Debt。
- 再决定启动 Wealth P1，或先做 develop 集成。

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
git diff --stat
git diff --check
```

业务任务：

- 先执行 `pnpm typecheck` 和 `pnpm build`。
- 如涉及页面交互，再启动 `pnpm dev` 做最小 smoke。
- 输出是否修改业务代码、是否越界、下一轮唯一入口。
