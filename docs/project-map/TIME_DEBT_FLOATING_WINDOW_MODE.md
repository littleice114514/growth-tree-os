# TIME_DEBT_FLOATING_WINDOW_MODE｜Time Debt 浮窗开发模式

## 1. 路线名称

Time Debt 浮窗路线：A → B → C → D

## 2. 路线拆分

### A 线：App 内浮窗按钮

- App 内右下角/合适位置出现快速记录入口
- 用于快速开始/结束 Time Debt 记录
- 不涉及系统级权限

### B 线：App 内小控制台

- 更完整的浮窗面板
- 支持收起/展开
- 显示当前计时状态
- 支持任务输入或选择
- 支持记录反馈

### C 线：全局快捷键 / 系统级唤起

- 不在 App 前台时也可唤起
- 涉及 Electron globalShortcut / 主进程能力
- 需要单独权限与稳定性验收

### D 线：桌面级悬浮球 / 置顶小窗

- always-on-top 小窗
- 桌面级悬浮球
- 最后阶段再做

## 3. 当前阶段

当前优先推进：A 线。

本轮已实现 A 线 App 内右下角快速记录入口。下一步唯一任务是对 A 线做真实 Electron UI smoke；通过后再考虑 B 线 App 内小控制台。

不要直接跳 C/D。

## 4. 文件边界

允许：

- `app/renderer/src/features/time-debt/**/*`
- 与浮窗挂载直接相关的主布局文件
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- 本轮 dev-log

禁止：

- `app/renderer/src/features/wealth/**/*`
- `docs/project-state` 三件套
- SystemX / AI Map / Tree / 3D / Obsidian
- `package.json`
- db / ipc 底层结构，除非用户确认进入 C/D 线

## 5. 验收标准

A 线：

- App 内看到浮窗入口
- 可以展开快速记录
- 可以开始计时
- 页面切换不丢失
- 可以结束计时
- Time Debt 中能看到记录
- Wealth 不受影响

B 线：

- 浮窗可收起/展开
- 当前计时状态清楚
- 小控制台不遮挡关键区域
- 任务选择/输入正常
- 结束记录后 Time Debt 可见

C/D 线：

- 后续单独开任务，不在当前阶段直接做
