# P0-C｜统一入口外壳：UnifiedQuickRecordFloat

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：715b50f refactor(wealth): extract quick record form

## 本轮目标

新增 UnifiedQuickRecordFloat 统一记录入口外壳，内含类型切换（记录时间/记录财富）+ 复用两个 Form 组件。

## 实现

### 新增文件

`app/renderer/src/features/quick-record/UnifiedQuickRecordFloat.tsx`

职责：
- 浮窗外壳（固定定位、右下角）
- 展开/收起状态 + localStorage 持久化（key: `growth-tree-os:unified-quick-float-ui:v1`）
- 类型选择器：记录时间 / 记录财富
- 选中「记录时间」→ 渲染 `TimeDebtQuickRecordForm`
- 选中「记录财富」→ 渲染 `WealthQuickRecordForm`
- 完整的两个表单状态管理（Time Debt + Wealth）
- Time Debt：复用 `startQuickTimeDebtTimer` / `finishQuickTimeDebtTimer` / `loadActiveTimeDebtTimer`
- Wealth：复用 `appendWealthRecord`，保存逻辑与 WealthQuickRecordFloat 一致

### 不做的事

- 不挂载到任何页面（原型组件，暂不使用）
- 不改 MainWorkspacePage
- 不改旧 TimeDebtQuickFloat / WealthQuickRecordFloat
- 不改快捷键 / preload / main process
- 不做 CommandOrControl+Alt+R

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- 新组件未被任何页面引用

## 下一步

P0-D｜主工作区挂载：将 UnifiedQuickRecordFloat 挂载到 MainWorkspacePage 或更高层级，使其跨页面可用。
