# 开发日志｜Integration｜Wealth 投资/行情 + Time Debt 浮窗 A/B/C｜2026-05-14

## 1. 本轮目标

本轮只做 integration 验收和文件归属清理，不开发新功能。

验收范围：

- Time Debt 浮窗 A/B/C。
- Wealth 投资模块。
- Wealth 行情模块。
- Wealth market IPC / preload / contracts 与 Time Debt C 线 IPC 共存。

本轮不做 Settings 页面、不进入 Time Debt D 线、不做桌面悬浮球、不做新行情 API。

## 2. 开工门禁

- 仓库：`/Users/ice/Developer/growth-tree-os`
- 分支：`feature/integration-time-debt-wealth`
- 本地起始 HEAD：`9e9c9e3`
- 远程 HEAD：`origin/feature/integration-time-debt-wealth @ 9e9c9e3`
- 任务类型：`integration`
- 是否执行 `git fetch origin`：是
- 是否执行 `git pull`：否，本地有未提交现场
- 是否修改 project-state / MAP_STATUS：否
- 是否进入 Settings：否

Skill 选择：

- 已搜索本机已有 skill。
- 未命中专门覆盖本项目 integration 验收的 skill。
- UI 验收使用 Computer Use 读取和操作真实 Electron App。
- 本轮流程适合沉淀为候选 SOP：`Time Debt + Wealth integration smoke`，暂不生成正式 skill。

## 3. 文件归属清点

| 文件 | 归属 | 结论 |
| --- | --- | --- |
| `app/main/finnhub.ts` | Wealth / 行情 | 接入 env fallback 与 Yahoo candle 获取 |
| `app/main/env.ts` | Wealth / 行情 | 新增 main process 读取 `.env` 的工具，不含密钥 |
| `app/main/ipc.ts` | Integration shared | 仅新增 `market:fetchYahooCandles` handler |
| `app/preload/index.ts` | Integration shared | 保留 `timeDebt.onOpenQuickFloat`，新增 `market.fetchYahooCandles` |
| `app/shared/contracts.ts` | Integration shared | 保留 Time Debt contract，新增 market contract |
| `app/renderer/src/features/wealth/MarketQuotesPanel.tsx` | Wealth / 行情 | 新增 candle source badge 与 chart key |
| `app/renderer/src/features/wealth/marketDataService.ts` | Wealth / 行情 | Finnhub-source 标的优先走 Yahoo candle，失败 fallback mock |
| `app/renderer/src/features/wealth/marketDataTypes.ts` | Wealth / 行情 | 新增 `MarketCandleResult` |
| `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-b-smoke.md` | Time Debt docs | B 线 smoke 文档，应单独提交 |

## 4. Shared 文件冲突检查

- `app/main/ipc.ts`：未覆盖 Time Debt C 线；只新增 Wealth market handler。
- `app/preload/index.ts`：`timeDebt.onOpenQuickFloat` 仍存在；只新增 `market.fetchYahooCandles`。
- `app/shared/contracts.ts`：`timeDebt.onOpenQuickFloat(callback): () => void` 仍存在；只新增 market 方法。
- `app/main/index.ts`：`globalShortcut`、`CommandOrControl+Shift+Space`、`time-debt:open-quick-float` 仍存在。

结论：未发现 shared 文件覆盖 Time Debt C 线快捷键 / IPC 链路。

## 5. 命令验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- 注册日志：`[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 终端行情日志：
  - `[finnhub] api key configured: true length: 40`
  - `[yahoo] candle BTC-USD → 31 bars`
  - `[yahoo] candle ETH-USD → 31 bars`
  - `[yahoo] candle NVDA → 22 bars`
  - `[yahoo] candle TSLA → 22 bars`

## 6. Time Debt A/B/C 验收

测试任务名：`integration-time-debt-float-test`

- 右下角浮窗入口存在。
- B 线小控制台可展开。
- 空任务名点击开始显示 `先写一下这次在做什么`。
- 输入测试任务名后可开始计时。
- 收起态显示 `计时中 · HH:MM:SS`。
- 切换到 Wealth 页面后计时状态不丢失。
- 刷新后 active timer 恢复，任务名与开始时间保持。
- 在 Wealth 页面触发 `Cmd+Shift+Space` 后，App 被聚焦，Time Debt 浮窗展开。
- 快捷键唤起后仍停留 Wealth 页面，不强制切页。
- 结束计时后写入 Time Debt，今日记录从 2 条变为 3 条，总记录时间从 2 min 变为 6 min。
- 最近任务出现 `integration-time-debt-float-test`。
- 测试记录已保留。

## 7. Wealth 投资 / 行情验收

投资：

- Wealth 页面不白屏。
- 投资页可打开。
- 投资约束提醒区域可见。
- 投资记录区域可见。
- 空态显示正常。
- 已开发的投资 A/B/C 基础结构仍在。

行情：

- 行情页可打开。
- 固定 watchlist 可见。
- 国内标的显示 `AKShare · Mock`。
- 海外和加密标的 quote 显示 `Finnhub · Live`。
- BTC / ETH / NVDA / TSLA 点击后 K 线标题分别显示正确标的。
- BTC / ETH / NVDA / TSLA candle badge 均显示 `Candle · Yahoo Live`。
- 未发现错误显示 Live 的 mock candle。
- TradingView Lightweight Charts 容器可见。
- 未发现明显阻塞终端错误。

## 8. 本轮结论

Integration smoke 通过。

可进入精确提交：

1. Time Debt B 线 smoke 文档单独提交。
2. Wealth 行情 + shared market IPC 一组提交。
3. Integration / Mac 交接文档单独提交。

下一步唯一建议：进入 Settings Foundation。若 Mac 端复验失败，则先修复 integration 冲突，不进入 Settings。
