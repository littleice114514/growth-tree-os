# 2026-05-13｜Mac｜Wealth Market Data A｜行情 K 线观察看板 MVP

## 1. 目标

在 Wealth 投资模块中新增行情观察看板 MVP，使用 mock 数据 + ECharts K 线图。

## 2. 新增文件

- `app/renderer/src/features/wealth/marketDataTypes.ts` — 统一数据模型（MarketQuote, MarketCandle, MarketSource, MarketType）
- `app/renderer/src/features/wealth/marketDataService.ts` — mock watchlist + mock K 线数据生成 + AKShare/Finnhub 未来接入点注释
- `app/renderer/src/features/wealth/MarketKlineChart.tsx` — ECharts candlestick K 线图组件（30 日）
- `app/renderer/src/features/wealth/MarketQuotesPanel.tsx` — 行情看板面板（标的列表 + 点击展开 K 线）
- `docs/project-map/WEALTH_MARKET_DATA_MODE.md` — 行情观察开发模式文档
- `docs/dev-log/2026-05/2026-05-13/claude-wealth-market-data-a.md` — 本日志

## 3. 修改文件

- `app/renderer/src/features/wealth/WealthDashboard.tsx` — WealthTab 增加 'market' 行情 tab，tabLabels 增加 '行情'，渲染 MarketQuotesPanel

## 4. 固定标的

国内：上证指数、沪深300、贵州茅台、易方达蓝筹精选
海外：SPY、QQQ、NVDA、TSLA
加密：BTC-USD、ETH-USD

## 5. 验证

- `pnpm typecheck` — 通过
- `pnpm build` — 通过（882 modules, 2.8MB）

## 6. 状态

- 未接入真实 AKShare
- 未接入真实 Finnhub
- 使用 mock 数据
- 未新增依赖（复用已有 echarts + echarts-for-react）
- 未修改 Time Debt
- 未修改 MainWorkspacePage
- 未修改 project-state 三件套
- 未修改 MAP_STATUS
