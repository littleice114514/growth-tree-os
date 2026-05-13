# Wealth Market Data 行情观察开发模式

## 1. 路线来源

本文件用于保存 Wealth 行情观察模块的开发路线，避免后续换聊天框后丢失上下文。
本模块是 growth-tree-os 中 Wealth 投资模块的行情观察扩展，不替代投资记录 A+B+C。

## 2. 数据源选择

**A 方案：AKShare**
- 用于中国国内股票、基金、指数行情
- Python 生态，需要通过本地服务 / 脚本层 / 代理层接入
- 适合先做本地行情采集和 MVP 验证

**B 方案：Finnhub**
- 用于海外股票、ETF、加密货币行情
- HTTP API，适合接入海外行情与 K 线数据
- 需要通过主进程 IPC 或后端代理接入，避免 API key 暴露在前端

## 3. 阶段拆分

**A｜行情 K 线观察看板**
- 目标：先能在 Wealth 中看到少量标的的行情状态和 K 线图
- 不绑定投资记录
- 不做买入点对标
- 不做投资建议

**B｜投资记录绑定行情代码**
- 目标：让用户的投资记录可以绑定 marketSymbol、marketType、dataSource
- 可自动显示当前市场价格与涨跌幅

**C｜买入时间点 / 买入单价对标**
- 目标：把用户买入时间点和买入单价叠加到 K 线或行情区里
- 用于复盘，不用于买卖建议

## 4. 当前进度

- A｜行情 K 线观察看板：已完成 MVP
- A1｜K 线组件升级：已完成（TradingView Lightweight Charts）
- A2｜Finnhub 真实数据接入：已完成（SPY/QQQ/NVDA/TSLA/BTC/ETH）
- A3｜AKShare 国内数据接入：未开始
- B｜投资记录绑定行情代码：未开始
- C｜买入时间点 / 买入单价对标：未开始

## 5. 下一步唯一任务

A3｜AKShare 国内数据接入评估（如需要）。

## 5b. 财富记录 / 投资记录 / 行情看板关系

三层结构：

- **财富记录** = 流水账 / 财富事件账（收入、支出、稳定理财、资产变化等）
- **投资记录** = 持仓账 / 投资资产账（资产名称、本金、当前估值、定投状态等）
- **行情看板** = 市场观察窗（行情价格、K 线走势）

当前阶段三者保持分离，不互相吞并。

后续方向：
- 投资记录绑定 marketSymbol
- 财富记录中的「资产变化」可关联投资记录
- K 线图上可标记买入时间点和买入单价
- 但这些都是 B/C 阶段的事，当前不做

## 6. 文件边界

允许修改：
- `app/renderer/src/features/wealth/**/*`
- `app/main/finnhub.ts`
- `app/main/ipc.ts`（仅 market: 相关 handler）
- `app/preload/index.ts`（仅 market: 相关 bridge）
- `app/shared/contracts.ts`（仅 market 相关类型）
- `docs/project-map/WEALTH_MARKET_DATA_MODE.md`
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-13/`
- `.env.example`

禁止修改：
- `app/renderer/src/features/time-debt/**/*`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-map/MAP_STATUS.md`
- `package.json`，除非先确认项目已有图表库且必须说明理由
- `db / ipc / store` 底层结构
- 3D / SystemX / AI Map / Tree / Nodes / Obsidian 相关模块

## 7. 禁止事项

- 不做交易
- 不做投资建议
- 不做收益承诺
- 不做行情预测
- 不做全市场搜索
- 不做秒级刷新
- 不做买入点对标
- 不做买入单价对标

## 8. 统一数据模型

```typescript
type MarketSource = 'akshare' | 'finnhub'
type MarketType = 'cn-index' | 'cn-stock' | 'cn-fund' | 'us-stock' | 'us-etf' | 'crypto'
type MarketQuote = {
  symbol: string
  name: string
  marketType: MarketType
  source: MarketSource
  price: number
  changePercent: number
  updatedAt: string
}
type MarketCandle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}
```

## 9. 固定标的列表

国内：
- 上证指数 (000001) / cn-index / akshare
- 沪深300 (000300) / cn-index / akshare
- 贵州茅台 (600519) / cn-stock / akshare
- 易方达蓝筹精选 (005827) / cn-fund / akshare

海外：
- SPY / us-etf / finnhub
- QQQ / us-etf / finnhub
- NVDA / us-stock / finnhub
- TSLA / us-stock / finnhub

加密：
- BTC-USD / crypto / finnhub
- ETH-USD / crypto / finnhub

## 10. K 线图实现

第一版原型使用 ECharts candlestick（已废弃）。
第二版升级为 TradingView Lightweight Charts v5.2.0，真正的金融级 candlestick + volume。
周期只做 30 日。
组件名：MarketKlineChart。
