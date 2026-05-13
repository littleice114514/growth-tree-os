# 2026-05-13｜Mac｜Wealth Market Data A1｜K 线组件升级

## 目标

将 Wealth 行情看板中的 ECharts 原型 K 线图升级为 TradingView Lightweight Charts，实现真正的金融级 candlestick 图。

## 变更

- 安装 `lightweight-charts` 5.2.0（新增依赖）
- 重写 `MarketKlineChart.tsx`：从 ECharts candlestick 改为 TradingView Lightweight Charts
  - 真正的 candlestick 图（up/down color, wick color）
  - 成交量 histogram 柱状图
  - 自适应容器大小
  - Magnet crosshair 模式
- 更新 `WEALTH_MARKET_DATA_MODE.md`：补充进度、三层关系说明、K 线实现版本

## 文件列表

- 修改: `app/renderer/src/features/wealth/MarketKlineChart.tsx`
- 修改: `docs/project-map/WEALTH_MARKET_DATA_MODE.md`
- 修改: `package.json`（新增 lightweight-charts）
- 修改: `pnpm-lock.yaml`

## 验证

- `pnpm typecheck` — 通过
- `pnpm build` — 通过（888 modules, 2.9MB）

## 未修改

- Time Debt: 否
- MainWorkspacePage: 否
- project-state 三件套: 否
- MAP_STATUS: 否
- Wealth 投资记录/财富记录关系: 否
