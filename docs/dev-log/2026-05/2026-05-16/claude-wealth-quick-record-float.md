# Wealth App 内快捷记录浮窗｜B 路线开发记录

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：5daa4a7 feat(wealth): add income source breakdown pie chart

## 本轮目标

在 App 内新增 Wealth 快捷记录浮窗，用于快速记录财富事件。

## 实现

### 浮窗组件

`WealthQuickRecordFloat.tsx` 新增：

- 固定定位在页面右下角，按钮文案「记一笔」
- 展开后显示：类型选择器 + 动态表单
- 支持三种事件类型：收入 / 支出 / 持续出血
- UI 状态持久化到 localStorage（开合状态）

### 类型 → 数据映射

#### 收入
- 类型选择：现实收入 / 睡后收入 / 系统收入 / 稳定理财 / 其他收入
- 写入 `WealthRecord.type`：对应类型（其他收入映射为 `real_income`）
- `source` 字段：其他收入时写「其他收入」

#### 支出
- 分类选择：生活 / 学习 / 工具 / 交通 / 饮食 / 娱乐 / 其他
- 写入 `WealthRecord.type = 'real_expense'`
- `category` 字段：对应分类

#### 持续出血
- 周期选择：每天 / 每周 / 每月 / 每年
- 写入 `WealthRecord.type = 'ongoing_cost'`
- `meta.cycle` 字段：对应周期值

### 数据写入

- 完全复用现有 `appendWealthRecord`（来自 `wealthStorage.ts`）
- 不新建记录系统
- 记录结构与完整 Wealth 页面创建的记录完全一致

### 集成

- 在 `WealthDashboard.tsx` 中挂载 `<WealthQuickRecordFloat />`
- 在 RecordDialog 之后渲染
- 不影响现有「新增财富记录」按钮

### 校验

- 名称不能为空
- 金额必须大于 0
- 持续出血必须选择周期
- 保存成功后显示轻量成功反馈

## 文件变更

- `app/renderer/src/features/wealth/WealthQuickRecordFloat.tsx`（新增：浮窗组件）
- `app/renderer/src/features/wealth/WealthDashboard.tsx`（修改：挂载浮窗）

## 不做的事

- 不做全局快捷键（路线 C）
- 不做投资/理财记录
- 不做资产变化记录
- 不改 Time Debt
- 不改 MainWorkspacePage
- 不做移动端消费监听

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- 未修改 Time Debt
- 未修改 MainWorkspacePage
