# NEXT_ACTION｜下一步唯一入口

更新时间：2026-05-12

## 1. 当前唯一优先事项

完成 `feature/integration-time-debt-wealth` 的 Time Debt + Wealth 双模块集成。

## 2. 下一步执行顺序

1. 完成 Time Debt merge 文档冲突解决。
2. 提交 Time Debt merge commit。
3. 继续 merge Wealth 分支 `origin/feature/claude-wealth-baseconfig-persistence-latest @ edd4a1a`。
4. 执行 `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm smoke`。
5. 启动 `pnpm dev`，完成 Wealth + Time Debt 轻量 UI smoke。
6. 如验证通过，新增 `docs/handoff/INTEGRATION_TIME_DEBT_WEALTH_NEXT_ACTION.md`。
7. push `feature/integration-time-debt-wealth`。

## 3. 当前不做事项

- 不开发新功能。
- 不改 Time Debt / Wealth 业务代码。
- 不改 UI。
- 不改数据库、IPC、Zustand store、主页面布局。
- 不推进 AI/RAG、云同步、商业化、真实登录或 3D。
- 不读取重资源。
- 不 push `main`。
- 不把 integration 合回 `develop`。
- 不 rebase，不强推。

## 4. 推荐读取文件

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

## 5. 禁止修改范围

- 未经明确任务，不改 `app/main/db.ts`。
- 未经明确任务，不改 `app/main/ipc.ts`。
- 未经明确任务，不改 `app/renderer/src/app/store.ts`。
- 未经明确任务，不改 `app/renderer/src/pages/MainWorkspacePage.tsx`。
- Codex 不改 `app/renderer/src/features/wealth/**`。
- Claude 不改 `app/renderer/src/features/time-debt/**`。
- 不重写 `docs/project-map/PROJECT_MAP.md`。

## 6. 最小验收标准

冲突解决后：

```bash
git diff --check
git diff --name-only --diff-filter=U
git status --short
```

双模块合并后：

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm smoke
pnpm dev
```

UI smoke 需要覆盖 Wealth 页面、ECharts 现金流图、记录搜索/分组/饼图、新增记录弹窗、分类 chip、参数页，以及 Time Debt 页面、日历 day/week/month、计时入口、日志详情、短任务和跨天分段只读逻辑。
