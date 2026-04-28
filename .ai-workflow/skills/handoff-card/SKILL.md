---
name: handoff-card
description: Use this skill when the task clearly asks for a handoff card, phase index card, implementation transfer summary, or next-step execution card. Do not use it for normal prose answers, direct code changes, or user-facing product copy. Inputs are the task goal, completed work, blockers, next step, and verification status. Outputs must use a fixed handoff structure with goal, completed, blockers, next step, and acceptance method. This skill is low-risk and may trigger implicitly.
---

# Handoff Card

用于生成任务交接卡或阶段索引卡。

## 什么时候触发

- 用户要任务交接卡
- 用户要阶段索引卡
- 需要把当前实现状态交给下一轮
- 需要明确下一步唯一优先事项

## 什么时候不要触发

- 普通散文式回答
- 直接代码实现
- 正式对外文案

## 输入是什么

- 目标
- 已完成
- 当前卡点
- 下一步
- 验收状态

## 输出是什么

输出必须固定包含：

1. 目标
2. 已完成
3. 卡点
4. 下一步
5. 验收方式

如果信息足够，也可补充：

- 风险点
- 回归检查

## 执行规则

1. 只写已经确认的事实，不写猜测。
2. 每个栏目尽量短，但不能漏关键状态。
3. `下一步` 默认只保留一个最直接动作。
4. 输出结构要明显像交接卡，而不是普通段落。

## 隐式触发

允许。该 skill 低风险，且交接场景可通过提示语高匹配识别。
