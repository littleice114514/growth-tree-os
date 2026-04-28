# Dashboard Future Backlog｜仪表盘未来增强池

## 1. 当前策略

当前优先实现 Dashboard Preview V0.1：先看见页面效果，再逐步接入真实数据。

暂不做但保留以下方向。

## 2. 后续增强方向

## 2026-04-28 Preview V0.1 已落地说明

- 当前已存在 `Time Debt Dashboard Preview`、`Wealth Dashboard Preview` 和 `Life Dashboard Preview` 三个前端 Preview 入口。
- 本轮策略仍是先页面原型、后真实数据；当前 Preview 使用 mock 数据确认状态卡、进度条、对抗条、趋势条和下一步动作的视觉语言。
- `财富` 和 `时间负债` 保留原有记录 / 统计功能，Preview 仅作为 Overview 首屏判断层，不替代真实数据链。
- 后续再评估接入 records/store、双轴联动、LLM 诊断和高级可视化。

### Life Operating Dashboard

- Time Debt + Wealth 双轴联动
- 系统变轻 / 持平 / 变重
- 财富轴：增长 / 平衡 / 透支 / 风险
- 时间轴：盈余 / 平衡 / 透支 / 恢复

### 四象限矩阵

- 时间好 + 钱好：自由积累
- 时间好 + 钱差：转化阻滞
- 时间差 + 钱好：出卖生命
- 时间差 + 钱差：危险区

### LLM 诊断

- 读取 TimeDebtStats + WealthStats + Review + Plan
- 生成每日一句话诊断
- 生成关键矛盾
- 生成下一步动作

### 高级可视化

- GitHub 式热力图
- 年度复盘趋势页
- 时间净值 Sparkline
- 睡后收入覆盖率趋势
- 双向对抗条增强版
- 水位图 / Gauge 图

### 移动端急救包

- 今日总状态
- 财富状态
- 时间状态
- 一个关键风险
- 一个下一步行动
- 快速记录入口

### 后续架构

- 本地 rules engine 抽成独立模块
- 后续再考虑后端 DiagnosticService
- 后续再考虑是否引入 Tremor / Recharts
