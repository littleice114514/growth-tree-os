# 开发日志｜Mac｜SystemX MVP｜2026-05-12

## 1. 本轮目标

在 `feature/integration-time-debt-wealth` 上完成 SystemX MVP：页面入口、手动输入、mock 分析、localStorage 保存、历史回看，并确保不影响 Time Debt / Wealth。

## 2. 当前分支

`feature/integration-time-debt-wealth`

## 3. 修改文件

本轮新增 / 修改 SystemX 模块、主导航入口、项目状态文档、Mac 接续卡和依赖声明。

## 4. 未修改区域

- 未修改 `app/renderer/src/features/time-debt/**` 业务逻辑。
- 未修改 `app/renderer/src/features/wealth/**` 业务逻辑。
- 未修改 SQLite、IPC、preload 或 main process。
- 未接真实 AI API。

## 5. 验收命令

```bash
pnpm typecheck
pnpm build
```

## 6. 验收结果

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- 首次 typecheck 暴露本地 `node_modules` 未物化 `echarts` / `echarts-for-react`；已通过 pnpm 安装流程补齐本地依赖，不改 Wealth 业务代码。

## 7. 风险与遗留问题

- SystemX 当前只使用 mock engine 和 localStorage。
- SystemX 当前不读取 Time Debt / Wealth 真实数据，也不写回这些模块。
- UI 真实点击 smoke 仍建议在 Mac 端用 Electron 窗口补验。

## 8. 下一步建议

先完成 Mac 端 UI smoke：从主导航进入 SystemX，输入“决策判断”，生成分析，刷新后确认历史仍在，再确认 Time Debt / Wealth 入口仍可访问。
