# Claude Wealth 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/claude-wealth-baseconfig-persistence-latest
- 基底分支：origin/feature/mac-time-debt-plan-flow-overlap-ui
- 当前设备：Claude（协同开发）

## 2. 本轮已完成

- 已为 Wealth 模块新增 baseConfig 持久化层：`wealthConfigStorage.ts`。
- localStorage key：`growth-tree-os:wealth-base-config:v1`。
- 已将 WealthDashboard.tsx 中硬编码的 baseConfig 改为从 storage 读取的 state。
- 已在 Overview 视图中新增「基础配置」面板，含 7 个可编辑字段 + 保存/恢复默认按钮。
- `pnpm typecheck` 通过，`pnpm build` 通过。

## 3. 本轮修改文件

- `app/renderer/src/features/wealth/wealthConfigStorage.ts`（新建）
- `app/renderer/src/features/wealth/WealthDashboard.tsx`

## 4. 未做事项

- 未做日期切换。
- 未做趋势图。
- 未做记录编辑。
- 未做 emergency_cost 记录类型。
- 未做连续透支天数自动追踪。
- 未接入 WealthDashboardPreview 真实数据。

## 5. 与 Codex 的文件边界

- Claude（Wealth）：只修改 `app/renderer/src/features/wealth/**`。
- Codex（Time Debt）：只修改 `app/renderer/src/features/time-debt/**`。
- 两者不交叉修改。

## 6. 下一步任务建议

按优先级：
1. **Wealth P0-B**：将 WealthDashboardPreview 从 mock 数据切换为真实 localStorage 数据。
2. **Wealth P1**：连续透支天数自动追踪。
3. **Wealth P2**：日期切换（查看历史快照）。

## 7. 手动验收方式

- 进入 Wealth 页面 → Overview → 底部「基础配置」面板可见。
- 修改「每日安全线」为 300 → 点击「保存配置」→ 刷新页面 → 值仍为 300。
- 点击「恢复默认」→ 值回到默认（dailySafeLine = 260）→ 刷新页面 → 值保持默认。
- 清空 localStorage 中 `growth-tree-os:wealth-base-config:v1` → 刷新页面 → 使用默认配置，不崩溃。
