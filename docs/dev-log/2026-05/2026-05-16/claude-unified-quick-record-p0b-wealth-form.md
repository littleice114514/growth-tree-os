# P0-B｜组件解耦第二步：拆出 WealthQuickRecordForm

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：f038f11 feat(time-debt): add quick float primary category

## 本轮目标

从现有 WealthQuickRecordFloat 中拆出可复用的表单组件 WealthQuickRecordForm，不改变 UI 行为。

## 实现

### 新增文件

`app/renderer/src/features/wealth/WealthQuickRecordForm.tsx`

承担职责：
- 事件类型选择器（收入/支出/持续出血）
- 名称输入框（含动态 placeholder）
- 金额输入框
- 收入来源 chip 选择器（条件渲染）
- 支出分类 chip 选择器（条件渲染）
- 持续出血周期选择器（条件渲染）
- 保存/重置按钮
- 错误（rose）/ 成功（emerald）反馈显示
- 导出类型：QuickEventType, FormState, WealthQuickRecordFormProps
- 导出常量：defaultForm, eventTypes

### 修改文件

`app/renderer/src/features/wealth/WealthQuickRecordFloat.tsx`

保留职责：
- 浮窗外壳（固定定位、右下角）
- 展开/收起状态管理 + localStorage 持久化
- 快捷键监听（onOpenQuickFloat）
- 表单状态管理（form state + patch）
- 保存业务逻辑（校验 + WealthRecord 构造 + appendWealthRecord）
- 成功反馈状态（successFeedback）

### 数据流

```
WealthQuickRecordFloat (shell + state + logic)
  ├─ 浮窗外壳、定位、开合
  ├─ isOpen / form / message / successFeedback 状态
  ├─ patch() 字段更新
  ├─ handleSave() 保存逻辑
  ├─ resetForm() 重置
  └─ <WealthQuickRecordForm ... />
       ├─ 纯 UI：选择器、输入框、按钮
       ├─ 通过 props 接收 form/message/successFeedback
       └─ 通过 callbacks 通知父组件（onFieldChange/onSave/onReset/onMessageClear）
```

## 不做的事

- 不改 Wealth 记录写入逻辑
- 不改 Wealth 快捷键
- 不改 localStorage key
- 不碰 Time Debt
- 不改 MainWorkspacePage
- 不做统一入口外壳

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- UI 行为不变
