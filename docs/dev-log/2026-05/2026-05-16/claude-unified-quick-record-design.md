# Unified Quick Record｜统一记录入口设计沉淀

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：c5634ff fix(wealth): address validation issues

## 本轮目标

为 P0 统一记录入口重构做架构设计，不改业务代码。

## 当前问题

Time Debt 和 Wealth 各有一套快捷记录入口：
- Time Debt：全局快捷键 + 浮窗，跨页面可用
- Wealth：页面内浮窗 + 快捷键，只在 Wealth 页面组件存在时有效

两个入口互相独立，快捷键和浮窗逻辑分散，后续移动端迁移会重复设计。

## 设计方案

### 统一入口形态

用户触发后先选择「记录时间 / 记录财富」，再进入对应表单。

### 架构

- `UnifiedQuickRecordFloat`：统一外壳，负责入口和类型切换
- `TimeDebtQuickRecordForm`：从现有 Time Debt 浮窗拆出的表单
- `WealthQuickRecordForm`：从现有 Wealth 浮窗拆出的表单
- 挂载点：跨页面层级（最终目标是 MainWorkspacePage）
- 统一快捷键：`CommandOrControl+Alt+R`（Record）

### 阶段拆分

| 阶段 | 内容 | 状态 |
|---|---|---|
| P0-A | 设计沉淀 | 已完成 |
| P0-B | 组件解耦，拆出表单组件 | 下一步 |
| P0-C | 统一入口外壳 | 后续 |
| P0-D | 主工作区挂载 | 后续 |
| P0-E | 统一快捷键 | 后续 |
| P0-F | 旧入口收口 | 后续 |

## 文件变更

- `docs/project-map/UNIFIED_QUICK_RECORD_MODE.md`（新增：统一记录入口开发模式）
- `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`（更新：P0 设计完成 + 下一步 P0-B）
- `docs/dev-log/2026-05/2026-05-16/claude-unified-quick-record-design.md`（新增：本记录）

## 本轮未改

- 未改任何业务代码
- 未改 Time Debt 浮窗
- 未改 Wealth 浮窗
- 未改 MainWorkspacePage
- 未改 globalShortcut
- 未改 IPC / preload
