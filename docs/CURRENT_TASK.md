# CURRENT_TASK

## 本轮唯一目标

打通 Windows / GitHub / MacBook 协同底座，并交付 Wealth Dashboard V1 可运行结构。

本轮不出 APK，不处理 Android 构建，不接外部金融 API。

## 当前默认主线

当前默认主线 = PC / 桌面端 Wealth Dashboard + 双设备 GitHub 协同优先。

优先关注：

1. Windows 本地可启动
2. Wealth Dashboard V1 可进入、可查看核心卡片
3. GitHub main 分支可同步
4. MacBook 能 clone / install / dev 接力
5. 后续再回到真实数据持久化和 Home / Review / Plan 深接入

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
- 主视图接入：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航接入：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- MacBook 接力卡：`docs/handoff/MACBOOK_SETUP.md`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`

## 下一步唯一优先事项

下一轮优先让 MacBook 按 `docs/handoff/MACBOOK_SETUP.md` clone、install、dev 跑通，并从 MacBook 推送 `mac/first-run-check` 验证分支。

MacBook 验证完成后，再推进 Wealth 真实数据录入和持久化。

## 验收标准

- `pnpm install --frozen-lockfile` 通过。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 能拉起 Electron。
- Wealth 页面能看到 Wealth Dashboard、今日状态、账户变化、未来钱消耗、可投资结余、节省池、双轨标准。
- `docs/handoff/MACBOOK_SETUP.md` 存在，并包含可复制的 MacBook 命令。
