# 开发日志｜MVP 使用版收口｜2026-05-13

## 1. 本轮目标

将 `growth-tree-os` 临时收口为可日常使用的双模块工具：只暴露 `时间负债 / Time Debt` 和 `财富 / Wealth`，隐藏 SystemX、成长树、Review、提醒、人生总览等实验或半成品入口。

## 2. 当前分支

`feature/integration-time-debt-wealth`

## 3. 修改文件

- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/app/store.ts`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-13/mvp-surface-freeze.md`

## 4. 核心改动

- 主导航只保留 `时间负债` 和 `财富` 两个入口。
- 默认打开模块从成长树改为 `timeDebt`。
- `setCurrentView` 增加 MVP allowlist，非 `timeDebt` / `wealth` 的 view 自动兜底到 `timeDebt`。
- `selectNode`、`exitInspectMode` 不再把用户带回成长树，而是回到 `timeDebt`。
- 顶部搜索、节点统计、新建今日复盘等通向隐藏模块的入口从主界面隐藏。

## 5. 未修改区域

- 未修改 `app/renderer/src/features/time-debt/**` 业务逻辑。
- 未修改 `app/renderer/src/features/wealth/**` 业务逻辑。
- 未删除 SystemX、成长树、Review、提醒、Life Dashboard 等旧模块源码。
- 未修改 SQLite、IPC、preload、main process 或依赖配置。
- 未修改 `docs/project-state/**` 或 `docs/project-map/MAP_STATUS.md`。

## 6. 验收命令

```bash
pnpm typecheck
pnpm build
```

## 7. 验收结果

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：通过，renderer 地址为 `http://localhost:5173/`。
- 浏览器 smoke：默认可见 `时间负债`，主导航只显示 `时间负债` 和 `财富`。
- 点击 `财富`：页面正常显示，未发现 SystemX / 成长树入口。
- 点击 `时间负债`：页面正常显示，未发现 SystemX / 成长树入口。

## 8. 下一步建议

下一轮唯一建议：继续保持双模块使用版冻结，只做 Time Debt / Wealth 的真实使用验收和必要修复，不重新开放 SystemX、成长树、Review、提醒或其他实验入口。
