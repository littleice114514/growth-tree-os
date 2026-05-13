# 开发日志｜MVP 使用版入口修正｜2026-05-13

## 1. 本轮目标

修正上一轮“只暴露 Time Debt + Wealth”过窄的问题，将基础成长闭环入口恢复为：`时间负债`、`财富`、`复盘记录`、`提醒`、`Review`。继续隐藏 SystemX、Tree / Nodes / Graph、Life Dashboard、Life Vitality Tree、Life Curve、AI / 3D / Obsidian 等实验或半成品入口。

## 2. 当前分支

`feature/integration-time-debt-wealth`

## 3. 修改文件

- `app/renderer/src/types/ui.ts`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/app/store.ts`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-13/mvp-surface-scope-correction.md`

## 4. 核心改动

- 主导航恢复基础闭环入口：`timeDebt`、`wealth`、`reviews`、`reminders`、`weeklyReview`。
- 新增轻量 view key `reviews`，复用已有 `features/reviews` 组件展示复盘记录，不打开 TreeCanvas / Nodes。
- 默认模块仍为 `timeDebt`。
- 旧状态兜底保留基础闭环模块；隐藏模块如 `tree`、`systemx`、`lifeDashboard`、`lifeVitalityTree`、`lifeCurve` 会回落到 `timeDebt`。
- `reminders` / `weeklyReview` / `reviews` 切换时按需加载对应数据。

## 5. 未修改区域

- 未修改 Time Debt / Wealth / Review / Reminders 业务逻辑。
- 未修改 SQLite、IPC、preload、main process 或依赖配置。
- 未删除 SystemX、Tree、Nodes、Graph、Life Dashboard、Obsidian 等隐藏模块源码。
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
- 浏览器 smoke：导航按钮只暴露 `时间负债`、`财富`、`复盘记录`、`提醒`、`Review`。
- 点击 `时间负债`、`财富`、`复盘记录`、`提醒`、`Review` 均出现对应标题，不白屏。
- 精确按钮检查确认未暴露 `SystemX`、`成长树`、`人生总览`、`人生生长树`、`人生曲线`、`周回看`。

## 8. 下一步建议

下一轮唯一建议：用真实 Electron UI 做基础闭环 smoke，重点检查 `复盘记录`、`提醒`、`Review` 三个恢复入口是否符合日常使用，不重新开放实验模块。
