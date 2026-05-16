# Wealth 收入结构 + 快捷记录浮窗｜路线设计

> 最后更新：2026-05-16
> 状态：规划中，未进入开发
> 依赖：行情 K 线绑定 bug 修完后才可启动

---

## 当前优先级

1. 先修复行情 K 线绑定 bug
2. 再做收入来源结构图（路线 A）
3. 再做 Wealth App 内快捷浮窗（路线 B）
4. 最后做系统快捷键 Option + Command + Z（路线 C）

---

## 禁止事项

- 不把财富记录和投资记录强行吞并
- 不把持续出血当成普通一次性支出
- 不做银行 API
- 不做投资建议
- 不影响 Time Debt 浮窗

---

## 路线 A｜收入来源结构图

### 目标

让 Wealth 不只体现节流，也能体现开源，展示收入主要来自哪里。

### 数据来源

只统计收入类 WealthRecord：

| WealthRecordType | 分类 |
|---|---|
| `real_income` | 现实收入（劳动型） |
| `passive_income` | 睡后收入（非劳动型） |
| `system_income` | 系统收入（自动化/内容/软件） |
| `stable_finance` | 稳定理财收入 |
| `asset_change` | 仅统计 direction=increase 的正向流入 |

### 第一版范围

- 统计收入类财富事件
- 展示收入总额
- 展示收入来源占比
- 展示最大收入来源
- 展示稳定收入 / 一次性收入 / 睡后收入占比
- 使用饼图或环形图展示

### 不做

- 不接银行 API
- 不自动识别收入
- 不做复杂预测

### 展示位置

放在 Wealth 总览（Overview）中，现有结构：

```
财富总览
├─ 财务生命体征
├─ 现金流状态
├─ 支出结构 / 出血结构
├─ 收入来源结构 ← 新增
└─ 安全线 / 可投资结余
```

### 可复用的现有代码

- `WealthRecord` 已有 `type` 字段，可直接筛选收入类
- `WealthRecord.source` 字段可用于收入来源标签
- `ExpenseBreakdownPie.tsx` 可作为饼图组件参考
- `wealthRecordInsights.ts` 已有 search/grouping 逻辑可复用

---

## 路线 B｜Wealth App 内快捷记录浮窗

### 目标

让用户可以快速记录财富事件，不进入完整 Wealth 页面。

### 快捷入口

第一版只做 App 内入口，不做系统快捷键。

### 支持事件类型

| 优先级 | 事件类型 | 说明 |
|---|---|---|
| P0 | 收入 | 一次性收入记录 |
| P0 | 支出 | 一次性支出记录 |
| P0 | 持续出血 | 持续性开销，有周期 |
| P1 | 投资/理财 | 投入事件记录 |
| P1 | 资产变化 | 资产余额调整 |

### 浮窗结构

两步式设计：

```
Wealth Quick Float
├─ 第一步：选择事件类型
│  ├─ 收入
│  ├─ 支出
│  ├─ 持续出血
│  ├─ 投资/理财
│  └─ 资产变化
├─ 第二步：动态表单（按类型变化）
│  ├─ 名称
│  ├─ 金额
│  ├─ 周期/日期等按类型变化
└─ 保存
```

### 各类型的最小字段

#### 收入

| 字段 | 必填 | 默认值 |
|---|---|---|
| 名称 | 是 | - |
| 金额 | 是 | - |
| 日期 | 自动 | 今天 |
| 来源分类 | 否 | - |

来源分类选项：`real_income` / `passive_income` / `system_income` / `stable_finance` / `other`

保存后映射到 `WealthRecord.type`。

#### 支出

| 字段 | 必填 | 默认值 |
|---|---|---|
| 名称 | 是 | - |
| 金额 | 是 | - |
| 日期 | 自动 | 今天 |
| 支出分类 | 否 | - |

支出分类选项：`real_expense` / `experience_cost`

#### 持续出血

| 字段 | 必填 | 默认值 |
|---|---|---|
| 名称 | 是 | - |
| 金额 | 是 | - |
| 周期 | 是 | - |
| 开始日期 | 自动 | 今天 |

周期选项：每天 / 每周 / 每月 / 每年

保存后自动换算：

- 日均出血 = 金额 / 周期天数
- 月均出血 = 日均 × 30
- 年化出血 = 日均 × 365

映射到 `WealthRecord.type = ongoing_cost`，`meta.cycle` 为对应值。

#### 投资/理财

| 字段 | 必填 | 默认值 |
|---|---|---|
| 名称 | 是 | - |
| 金额 | 是 | - |
| 日期 | 自动 | 今天 |

暂不关联投资记录模块，后续路线 D 再做。

#### 资产变化

| 字段 | 必填 | 默认值 |
|---|---|---|
| 名称 | 是 | - |
| 金额变化 | 是 | - |
| 日期 | 自动 | 今天 |

映射到 `WealthRecord.type = asset_change`。

### 数据映射

浮窗保存后直接写入 `WealthRecord`，通过现有 `wealthStorage.ts` 的 CRUD 操作。

```
浮窗表单 ──→ WealthRecord
- 名称   → title
- 金额   → amount
- 日期   → date
- 类型   → type (收入→real_income, 支出→real_expense, 持续出血→ongoing_cost...)
- 来源   → source (收入时)
- 分类   → category (支出时)
- 周期   → meta.cycle (持续出血时)
```

### 可复用的现有代码

- `WealthRecord` 类型定义已有全部所需字段
- `wealthStorage.ts` 已有 add/edit/delete 方法
- `wealthCategoryOptions.ts` 已有各类型的预设分类
- `ongoing_cost` 类型的 `meta.cycle` 字段已支持周期

---

## 路线 C｜系统级 Wealth 快捷键

### 目标

使用快捷键全局唤出 Wealth 快捷记录浮窗。

### 快捷键

| 平台 | 快捷键 |
|---|---|
| Mac | Option + Command + Z |
| Windows | Alt + Ctrl + Z |

### 技术方案

Electron `globalShortcut` 注册，触发后通过 IPC 通知渲染进程显示浮窗。

### 前置条件

必须在 App 内浮窗（路线 B）稳定后再做。

---

## 路线 D｜投资记录关联

### 目标

投资/理财类财富事件可以选择同步到投资记录模块。

### 范围

- Wealth 浮窗记录"投资/理财"类型时，可选择关联 `InvestmentRecord`
- 同步方向：浮窗 → 投资记录（单向）
- 不吞并 `InvestmentRecord`，两个数据模型保持独立

### 当前状态

规划中，不做。

---

## 架构约束

Wealth 保持三层结构，不互相吞并：

```
财富记录（WealthRecord） = 财富事件账（收支、持续出血、资产变化）
投资记录（InvestmentRecord） = 投资资产账（持仓、本金、收益）
行情看板（MarketQuote/Candle） = 市场观察窗（行情、K线）
```

Wealth 快捷浮窗服务的是第一层：快速记录财富事件。
