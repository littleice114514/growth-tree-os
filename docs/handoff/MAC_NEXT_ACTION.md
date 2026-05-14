# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-14 18:29 CST

## 2. 本轮已完成

- 完成 Wealth 投资/行情 + Time Debt 浮窗 A/B/C integration 验收。
- 清点并归属并行未提交文件。
- 确认 shared 文件未覆盖 Time Debt C 线快捷键链路。
- 确认 `market:fetchYahooCandles`、preload bridge、shared contract 与 Time Debt IPC 共存。
- 确认 `pnpm typecheck`、`pnpm build` 通过。
- 使用真实 Electron App 完成 Time Debt smoke。
- 创建并保留测试记录：`integration-time-debt-float-test`。
- 在 Wealth 页面验证 `Cmd+Shift+Space` 可唤起 Time Debt 浮窗，且不切页。
- 验证 Wealth 投资页可见、不白屏。
- 验证 Wealth 行情页可见，BTC / ETH / NVDA / TSLA K 线与 quote 不串绑。
- 验证 Yahoo candle 成功时显示 `Candle · Yahoo Live`。

## 3. 本轮修改文件

- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-b-smoke.md`
- `app/main/env.ts`
- `app/main/finnhub.ts`
- `app/main/ipc.ts`
- `app/preload/index.ts`
- `app/shared/contracts.ts`
- `app/renderer/src/features/wealth/MarketQuotesPanel.tsx`
- `app/renderer/src/features/wealth/marketDataService.ts`
- `app/renderer/src/features/wealth/marketDataTypes.ts`
- `docs/dev-log/2026-05/2026-05-14/integration-time-debt-wealth-smoke.md`
- `docs/handoff/INTEGRATION_TIME_DEBT_WEALTH_NEXT_ACTION.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `git fetch origin` 后，本地与远程起始点均为 `9e9c9e3`。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- Time Debt 全局快捷键注册成功：`CommandOrControl+Shift+Space`。
- Time Debt A/B/C：通过。
- Wealth 投资：通过。
- Wealth 行情：通过。
- Shared 文件冲突：未发现。

### 未验证 / 风险

- 本轮没有进入 Settings Foundation。
- 本轮没有进入 Time Debt D 线。
- 本轮没有测试 fallback 快捷键；主快捷键已注册并生效。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/integration-time-debt-wealth
git pull origin feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报中的 commit 一致。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 必须打开真实 Electron App，不要只打开浏览器里的 localhost。
- Time Debt：右下角浮窗入口可见，小控制台可展开，空任务提示正常。
- Time Debt：可开始并结束测试计时，记录能写入今日统计。
- Time Debt：在 Wealth 页面按 `Cmd+Shift+Space`，App 聚焦，浮窗展开，不切页。
- Wealth 投资：投资页、投资约束提醒、投资记录区域可见。
- Wealth 行情：行情页可见，quote 加载完成。
- Wealth 行情：国内标的显示 `AKShare · Mock`。
- Wealth 行情：海外/加密 quote 显示 `Finnhub · Live`。
- Wealth 行情：BTC / ETH / NVDA / TSLA 切换后 K 线标题和价格不串绑。
- Wealth 行情：Yahoo candle 成功时显示 `Candle · Yahoo Live`，失败时只能显示 `Candle · Mock`，不得错误显示 Live。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

进入 Settings Foundation。目标是先设计并实现设置中心底座，不进入 Time Debt D 线，不新增 Wealth 行情 API。Settings 开始前必须以当前 integration commit 为基线。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- `pnpm dev` 终端中与 `globalShortcut`、`time-debt`、`finnhub`、`yahoo`、`market` 相关的日志；
- Time Debt 浮窗截图；
- Wealth 投资页截图；
- Wealth 行情页截图；
- BTC / ETH / NVDA / TSLA 任一异常截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要进入 Time Debt D 线。
- 不要做桌面悬浮球、系统托盘或 always-on-top 小窗。
- 不要新增行情 API。
