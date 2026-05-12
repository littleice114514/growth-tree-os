# SYSTEMX_ROUTE_MAP｜SystemX 系统感知模块路线

更新时间：2026-05-12

## 1. 当前状态

SystemX 已进入 MVP 搭建阶段，当前定位是 growth-tree-os 的“系统感知 / 决策判断 / 反思沉淀”中间加工层。

本轮已完成最小闭环：

- 页面入口：主导航新增 `SystemX`。
- 输入方式：支持手动输入标题、正文和输入类型。
- 分析方式：使用 renderer 内 mock sense engine。
- 保存方式：使用 localStorage。
- 回看方式：支持最近历史记录点击回看。

## 2. 当前实现边界

- 当前不接真实 AI API。
- 当前不接 Mimo / Claude / OpenAI。
- 当前不读取 Time Debt / Wealth 真实数据。
- 当前不写回 Time Debt / Wealth。
- 当前不改 SQLite、IPC、preload 或 main process。
- 当前不做浮窗、阅读模块、3D、知识图谱或 RAG。

## 3. 当前本地存储

- localStorage key：`growth-tree-os:systemx-records:v1`
- 最多保留最近 100 条记录。
- JSON 损坏或非浏览器环境返回空数组，避免页面白屏。

## 4. 后续路线

1. 接入 Floating Capture，把零散输入送入 SystemX 手动确认队列。
2. 设计 Time Debt / Wealth 数据桥，只读提取事实，不直接写回。
3. 评估真实 AI API 接入位置，保持 mock engine 可回退。
4. 将原则候选和行动候选接入更长期的复盘 / 成长树沉淀流程。
