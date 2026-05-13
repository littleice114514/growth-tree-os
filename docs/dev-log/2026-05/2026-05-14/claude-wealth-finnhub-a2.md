# A2｜Finnhub 真实数据接入

## 完成时间
2026-05-14

## 目标
将 Wealth → 行情 tab 中的海外标的（SPY/QQQ/NVDA/TSLA/BTC/ETH）接入 Finnhub 真实行情 API，国内标的保持 mock。

## 架构设计

```
Renderer (marketDataService.ts)
  → window.growthTree.market.fetchQuotes(symbols)
  → Preload (ipcRenderer.invoke)
  → Main Process (ipc.ts handlers)
  → finnhub.ts (fetch Finnhub HTTP API)
  → process.env.FINNHUB_API_KEY (仅 main process 可读)
```

API key 不暴露到 renderer 前端，通过 Electron IPC 安全传递。

## 实现内容

### 1. 新建文件
- `app/main/finnhub.ts` — Finnhub API 服务（quote + candle fetch），内置 crypto symbol 映射（BTC-USD → BINANCE:BTCUSDT）

### 2. 修改文件
- `app/main/ipc.ts` — 新增 4 个 market: IPC handler
- `app/preload/index.ts` — 新增 market bridge（hasApiKey/fetchQuote/fetchQuotes/fetchCandles）
- `app/shared/contracts.ts` — 新增 FinnhubQuoteResult/FinnhubCandle/FinnhubCandlesResult 类型，GrowthTreeApi 新增 market 字段
- `app/renderer/src/features/wealth/marketDataTypes.ts` — MarketQuote 新增 isMock 字段
- `app/renderer/src/features/wealth/marketDataService.ts` — 全面重构为 async，finnhub 标的走 IPC 真实数据，失败/无 key 时 fallback mock
- `app/renderer/src/features/wealth/MarketQuotesPanel.tsx` — 适配 async API，新增 loading 状态，source badge 区分 Live/Mock
- `.env.example` — 新增 FINNHUB_API_KEY 说明
- `docs/project-map/WEALTH_MARKET_DATA_MODE.md` — 更新进度和文件边界

### 3. 数据流
- 海外/加密标的：优先从 Finnhub 拉取真实数据，失败时 fallback mock
- 国内标的：始终使用 mock，标记为 AKShare · Mock
- K 线数据：finnhub 标的走 `GET /stock/candle?resolution=D` 获取日线

### 4. UI 变化
- 行情卡片 source badge 区分：
  - `Finnhub · Live`（绿色高亮边框）— 真实数据
  - `Finnhub · Mock` — 未配置 key 或请求失败
  - `AKShare · Mock` — 国内标的
- 页头提示语根据状态显示：
  - "海外行情来自 Finnhub"（有 key 且成功）
  - "未配置 Finnhub API Key，当前显示 mock 数据"（无 key）

### 5. 错误处理
- 无 API key：页面不白屏，显示 mock 数据 + 提示
- API 请求失败：自动 fallback mock，不中断页面
- IPC 不可用：fallback mock

### 6. Crypto symbol 映射
- BTC-USD → BINANCE:BTCUSDT
- ETH-USD → BINANCE:ETHUSDT

## 验收
- `pnpm typecheck` — 通过
- `pnpm build` — 通过

## 手动验收步骤
1. `export FINNHUB_API_KEY=your_key`（从 finnhub.io 注册获取）
2. `pnpm dev` 启动 App
3. 进入 Wealth → 行情
4. 检查海外标的卡片显示 `Finnhub · Live` 绿色标记
5. 点击 SPY，K 线图应显示真实市场数据
6. 取消 API key，重启 App，确认显示 mock + 提示
7. 国内标的始终显示 `AKShare · Mock`
8. 投资 tab / Time Debt 不受影响

## 下一步
A3｜AKShare 国内数据接入（如需要），或进入 B 阶段投资记录绑定行情代码。
