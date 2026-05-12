# NEXT_ACTION｜下一步唯一入口

更新时间：2026-05-12

## 1. 当前唯一优先事项

完成 `feature/integration-time-debt-wealth` 的 Time Debt + Wealth 双模块集成。

## 2. 下一步执行顺序

1. 解决 Wealth merge 共享文档冲突。
2. 完成 Wealth merge commit。
3. 确认 `package.json` / `pnpm-lock.yaml` 保留 `echarts` 与 `echarts-for-react`。
4. 执行 `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm smoke`。
5. 启动 `pnpm dev`，完成 Wealth + Time Debt + 顶部导航轻量 UI smoke。
6. 如验证通过，新增 `docs/handoff/INTEGRATION_TIME_DEBT_WEALTH_NEXT_ACTION.md`。
7. push `feature/integration-time-debt-wealth`。

## 3. 当前不做事项

- 不开发新功能。
- 不改 Time Debt / Wealth 业务逻辑，除非是 merge 冲突解决所必须。
- 不改数据库、IPC、Zustand store、主页面布局。
- 不推进 AI/RAG、云同步、商业化、真实登录或 3D。
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

冲突解决后：

```bash
git diff --check
git diff --name-only --diff-filter=U
git status --short
```

双模块合并后：

```bash
grep -n "echarts" package.json || true
grep -n "echarts-for-react" package.json || true
ls app/renderer/src/features/wealth
pnpm install
pnpm typecheck
pnpm build
pnpm smoke
pnpm dev
```

UI smoke 需要覆盖 Wealth 页面、Hero、ECharts 现金流图、记录搜索/分组/饼图、新增记录弹窗、分类 chip、参数页；Time Debt 页面、日历 day/week/month、计时入口、日志详情、短任务、跨天分段只读；以及顶部导航切换。
