# Unified Quick Record｜统一快捷记录入口开发模式

> 最后更新：2026-05-16
> 状态：设计沉淀，未进入开发
> 依赖：Time Debt 快捷记录 + Wealth 快捷记录浮窗均已独立可用

---

## 1. 目标

把 Time Debt 快捷记录和 Wealth 快捷记录合并为一个统一入口。

用户触发记录入口后，先选择记录类型：

- 记录时间
- 记录财富

再进入对应表单。

---

## 2. 当前问题

### Time Debt

- 已有全局快捷记录能力
- 适合记录「开始—结束」的计时型事件
- 当前记录入口相对完整

### Wealth

- 已有 Wealth 页面内快捷记录浮窗
- 已有 `CommandOrControl+Alt+Z` 快捷键
- 但浮窗组件挂载在 Wealth 页面内
- 如果当前不在 Wealth 页面，组件不存在，无法真正全局唤起

### 冲突

- Time Debt 和 Wealth 各有一套记录入口
- 快捷键和浮窗逻辑分散
- 后续移动端迁移时会造成重复设计

---

## 3. 统一入口目标形态

```
Quick Record
├─ 记录时间
│  ├─ 任务名称
│  ├─ 一级分类
│  ├─ 开始计时
│  └─ 结束计时
└─ 记录财富
   ├─ 收入
   ├─ 支出
   └─ 持续出血
```

---

## 4. 推荐架构

### A｜统一入口外壳

新增一个跨模块组件：

`UnifiedQuickRecordFloat`

职责：

- 统一显示入口
- 选择记录类型：时间 / 财富
- 不直接承载所有业务逻辑
- 只负责外壳、切换和挂载

### B｜复用现有业务表单

不要重写 Time Debt 和 Wealth 逻辑。

应复用：

- `TimeDebtQuickRecordForm` — 从 TimeDebtQuickFloat 拆出的表单组件
- `WealthQuickRecordForm` — 从 WealthQuickRecordFloat 拆出的表单组件

如果现有组件耦合太重，应先拆出内部表单，再由统一入口调用。

### C｜全局挂载点

统一入口不能只挂在 Wealth 页面或 Time Debt 页面。

推荐挂载在 App 主工作区级别：

`MainWorkspacePage` 或 App shell

但实施时必须谨慎，避免破坏现有入口隐藏逻辑。

### D｜快捷键

最终统一快捷键建议：

`CommandOrControl+Alt+R`

含义：Record。

原快捷键保留策略：

- Time Debt 旧快捷键：短期保留，后续可转为打开统一入口并默认选中「记录时间」
- Wealth 旧快捷键：短期保留，后续可转为打开统一入口并默认选中「记录财富」

---

## 5. 阶段拆分

### P0-A｜设计沉淀

当前阶段。
只写设计文件，不改代码。
**已完成。**

### P0-B｜组件解耦

目标：从现有 Time Debt / Wealth 浮窗中拆出可复用表单组件。

- 拆出 `TimeDebtQuickRecordForm`：只含表单 UI + 业务逻辑，不含浮窗外壳
- 拆出 `WealthQuickRecordForm`：只含表单 UI + 业务逻辑，不含浮窗外壳
- 原浮窗组件改为调用拆出的表单组件
- 不改变 UI 行为
- 不改 MainWorkspacePage
- 不改 globalShortcut

### P0-C｜统一入口外壳

目标：新增 `UnifiedQuickRecordFloat`，并在内部切换 Time / Wealth。

- 先只做 App 内入口（如挂在 WealthDashboard 或 Time Debt 页面），不做全局快捷键
- 入口打开后显示：「记录时间」/「记录财富」选择
- 选择后渲染对应 `QuickRecordForm`

### P0-D｜主工作区挂载

目标：把统一入口挂载到跨页面层级，使其在 Time Debt / Wealth / Review / Reminders 页面都可用。

- 挂载点建议：`MainWorkspacePage` 或更高层级
- 必须确认不影响现有页面渲染
- 必须确认 Time Debt / Wealth 独立页面仍可正常访问

### P0-E｜统一快捷键

目标：新增统一快捷键 `CommandOrControl+Alt+R`。

- main process 注册新快捷键
- preload 暴露新事件
- renderer 监听后打开统一入口
- 旧快捷键兼容：
  - Time Debt 快捷键 → 打开统一入口并默认选择时间
  - Wealth 快捷键 → 打开统一入口并默认选择财富

### P0-F｜旧入口收口

目标：确认统一入口稳定后，再决定是否隐藏原 Time Debt / Wealth 独立浮窗入口。

- 不急于删除旧代码
- 先并行运行一段时间
- 用户验收后再决定

---

## 6. 文件边界建议

### 未来允许修改

- `app/renderer/src/components/UnifiedQuickRecordFloat.tsx`（新增）
- `app/renderer/src/features/time-debt/**/*`（拆出表单组件）
- `app/renderer/src/features/wealth/**/*`（拆出表单组件）
- `app/main/**/*`（统一快捷键注册）
- `app/preload/**/*`（统一事件暴露）
- `app/shared/contracts.ts`（统一事件类型）
- `MainWorkspacePage.tsx`（仅在 P0-D 阶段允许最小挂载）

### 未来禁止

- 不改投资模块
- 不改行情模块
- 不改 Review / Reminders 业务逻辑
- 不改 project-state 三件套，除非集成阶段明确需要

---

## 7. 验收标准

最终验收：

1. 在任意基础模块页面都能打开统一记录入口
2. 可以选择记录时间
3. 可以选择记录财富
4. 时间记录仍能开始 / 结束计时
5. 财富记录仍支持收入 / 支出 / 持续出血
6. 旧数据不丢
7. Time Debt 不白屏
8. Wealth 不白屏
9. Review / Reminders / Daily Review 不白屏
10. 快捷键不冲突
