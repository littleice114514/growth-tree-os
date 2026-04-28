---
name: repo-map
description: Use this skill when the task is about understanding an unfamiliar repository, locating entry points, mapping module relationships, or identifying the main execution path before making changes. Do not use it for user-facing copy, deployment actions, or destructive bulk edits. Inputs are the repo path, likely entry files, important directories, and the current task context. Outputs are a concise repository map covering entry points, module boundaries, and the main flow. This skill is low-risk and may trigger implicitly.
---

# Repo Map

用于快速梳理仓库入口、模块关系和主链路。

## 什么时候触发

- 面对陌生仓库
- 需要先理解入口文件
- 需要定位模块边界
- 需要判断主执行链路

## 什么时候不要触发

- 用户可见文案编写
- 发布/部署动作
- 破坏性批量修改

## 输入是什么

- 仓库路径
- 关键目录
- 入口文件
- 当前任务上下文

## 输出是什么

输出应尽量包含：

- 仓库入口
- 核心模块
- 模块关系
- 主链路
- 建议优先查看的文件

## 执行规则

1. 先找入口，再找模块，再找主链路。
2. 优先输出与当前任务相关的地图，不做全仓流水账。
3. 不重复罗列无关目录。
4. 如果链路不清楚，明确标注未确认点。

## 隐式触发

允许。该 skill 低风险，适合在陌生仓库理解场景自动命中。
