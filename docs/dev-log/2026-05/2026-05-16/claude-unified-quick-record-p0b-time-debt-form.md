# P0-B｜组件解耦第一步：拆出 TimeDebtQuickRecordForm

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：bdd4f11 docs(app): add unified quick record mode

## 本轮目标

从现有 TimeDebtQuickFloat 中拆出可复用的表单组件 TimeDebtQuickRecordForm，不改变 UI 行为。

## 实现

### 新增文件

`app/renderer/src/features/time-debt/components/TimeDebtQuickRecordForm.tsx`

承担职责：
- 任务名称输入框
- 一级分类选择器
- 最近任务回填列表
- 开始计时按钮
- 计时中状态显示（任务名、分类、开始时间、已用时）
- 结束计时按钮
- 错误/提示消息显示
- 辅助函数：formatElapsedTime、formatMinutes、normalizePrimaryCategory

### 修改文件

`app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`

保留职责：
- 浮窗外壳（固定定位、右下角）
- 展开/收起状态管理 + localStorage 持久化
- 快捷键监听（onOpenQuickFloat）
- 活跃计时器状态管理 + 定时刷新
- 最近任务列表加载
- 记录操作（startQuickTimeDebtTimer / finishQuickTimeDebtTimer）
- 最后记录反馈显示
- 按钮文案（计时中显示已用时间）

### 数据流

```
TimeDebtQuickFloat (shell + state + logic)
  ├─ 浮窗外壳、定位、开合
  ├─ activeTimer / timerNow / recentTasks / message 状态
  ├─ handleStart / handleFinish 业务逻辑
  └─ <TimeDebtQuickRecordForm ... />
       ├─ 纯 UI：输入框、选择器、按钮
       ├─ 通过 props 接收状态
       └─ 通过 callbacks 通知父组件
```

## 不做的事

- 不改 Time Debt 计时逻辑
- 不改记录写入逻辑
- 不改 Time Debt 快捷键
- 不改 localStorage key
- 不碰 Wealth
- 不改 MainWorkspacePage
- 不做统一入口外壳

## 验证

- pnpm typecheck 通过
- pnpm build 通过
- UI 行为不变
