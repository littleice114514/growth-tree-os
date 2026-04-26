# CURRENT_TASK

## 本轮唯一目标

接入 Time Debt 时间负债模块，并继续保持 Windows / GitHub / MacBook 协同底座。

本轮不出 APK，不处理 Android 构建，不接外部金融 API。

## 当前默认主线

当前默认主线 = PC / 桌面端 Time Debt V1 + 双设备 GitHub 协同优先。

优先关注：

1. Windows 本地可启动
2. Time Debt 可以进入并新增时间日志
3. 日志进入 Daily Stats / Overview / Dashboard 统计和诊断
4. 刷新后 Time Debt logs 不丢
5. GitHub main 分支可同步，MacBook 可 pull 验证

## 本轮不做

- 不出 APK。
- 不处理 Android 构建。
- 不接支付宝、微信、银行卡自动同步。
- 不接 BTC、股票实时价格 API。
- 不做复杂投资组合分析。
- 不重构数据库或状态架构。

## 涉及文件

- Wealth 算法：`app/shared/wealth.ts`
- Wealth 页面：`app/renderer/src/features/wealth/WealthDashboard.tsx`
- Wealth 本地存储：`app/renderer/src/features/wealth/wealthStorage.ts`
- Time Debt 计算层：`app/shared/timeDebt.ts`
- Time Debt 页面：`app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- Time Debt 本地存储：`app/renderer/src/features/time-debt/timeDebtStorage.ts`
- 主视图接入：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航接入：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- MacBook 接力卡：`docs/handoff/MACBOOK_SETUP.md`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`

## 下一步唯一优先事项

下一轮优先让 MacBook 按 `docs/handoff/MACBOOK_SETUP.md` pull、install、dev 跑通，并验证 Time Debt 模块是否同步。

MacBook 验证完成后，再评估是否把 Wealth / Time Debt 的 renderer `localStorage` 迁移到主进程 SQLite。

## 2026-04-26 Windows 验收结果

- `git pull --ff-only`：已是最新。
- `pnpm install`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：可启动 Electron，renderer dev server 为 `http://localhost:5173/`。
- 浏览器 renderer smoke：可进入 `时间负债`，固定测试日志新增成功，刷新后保留，日度统计和仪表盘诊断显示预期数据。
- Mac 接力文件：已新增 `docs/handoff/MAC_NEXT_ACTION.md`，并更新 `docs/handoff/MACBOOK_SETUP.md` 的 Time Debt 同步说明。

## 验收标准

- `pnpm install --frozen-lockfile` 通过。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 能拉起 Electron。
- Time Debt 页面能看到总览、时间日志、日度统计、负债参数、工作时间标准、仪表盘诊断。
- 能新增固定测试日志，持续时长为 70 min，效率约 0.24 min / 个。
- Logs、Daily Stats、Overview、Dashboard / Diagnosis 能随日志变化。
- 刷新后日志仍保留。
- `docs/handoff/MACBOOK_SETUP.md` 存在，并包含可复制的 MacBook 命令。
