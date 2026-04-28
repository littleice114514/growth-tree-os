---
name: concise-dev
description: Use this skill when the task needs compressed internal engineering output such as bug analysis, diff summaries, scan reports, or handoff summaries. Do not use it for user-visible copy, formal explanations, help text, or polished product writing. Inputs are the current goal, key facts, scope, risks, and acceptance signals. Outputs should be short, direct, executable internal summaries. This skill is low-risk and may trigger implicitly.
---

# Concise Dev

用于压缩内部工程输出。

## 什么时候触发

- 需要输出 bug 分析摘要
- 需要输出 diff 总结
- 需要输出扫描报告摘要
- 需要输出任务交接摘要

## 什么时候不要触发

- 用户可见文案
- 正式说明文字
- 帮助信息
- 多语言 UI 文案

## 输入是什么

- 当前目标
- 当前判断
- 关键事实
- 修改范围
- 风险点
- 验收信号

## 输出是什么

输出应满足：

- 短
- 直接
- 可执行
- 不写无信息量过渡句

默认优先采用短栏目：

- 目标
- 判断
- 范围
- 风险
- 验收

## 执行规则

1. 只保留推进任务所需的事实。
2. 先写结论，再写必要证据。
3. 不把内部压缩风格带到用户可见输出。
4. 如果信息不足，宁可标注缺口，不补空话。

## 隐式触发

允许。该 skill 低风险且高复用，适合在内部工程输出场景自动命中。
