# CURRENT_TASK

## 本轮唯一目标

补齐 Wealth 语义记录流，并继续保持 Windows / GitHub / MacBook 协同底座。

本轮不出 APK，不处理 Android 构建，不接外部金融 API。

## 当前默认主线

当前默认主线 = PC / 桌面端 Wealth 语义记录 + 双设备 GitHub 协同优先。

优先关注：

1. Windows 本地可启动
2. Wealth 可以新增财富记录
3. 不同记录类型进入 Income / Expenses / Assets / Evaluation 统计
4. 刷新后 records 不丢
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
- 主视图接入：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航接入：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- MacBook 接力卡：`docs/handoff/MACBOOK_SETUP.md`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`

## 下一步唯一优先事项

下一轮优先让 MacBook 按 `docs/handoff/MACBOOK_SETUP.md` pull、install、dev 跑通，并验证 Wealth 语义记录是否同步。

MacBook 验证完成后，再评估是否把 Wealth records 从 renderer `localStorage` 迁移到主进程 SQLite。

## 验收标准

- `pnpm install --frozen-lockfile` 通过。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 能拉起 Electron。
- Wealth 页面能看到“新增财富记录”入口。
- 能新增现实收入、睡后收入、持续出血、体验出血、资产变化。
- 最近记录、Income、Expenses、Assets、Evaluation 能随记录变化。
- 刷新后记录仍保留。
- `docs/handoff/MACBOOK_SETUP.md` 存在，并包含可复制的 MacBook 命令。
