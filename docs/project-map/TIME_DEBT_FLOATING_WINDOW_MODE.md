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

当前优先推进：C 线全局快捷键 / 系统级唤起。

A 线 App 内右下角快速记录入口已完成，真实 Electron UI smoke 已通过，可信封存点为 `75911c0`。

B 线 App 内小控制台已完成，真实 Electron UI smoke 已通过，可信封存点为 `22b555d`。

- 收起态显示当前计时状态，无计时时显示 `记录`，计时中显示 `计时中 · HH:MM:SS`。
- 展开态提供时间控制台，包括当前状态、任务名称输入、开始计时、收起操作。
- 计时中显示当前计时卡片，包括任务名、开始时间、已用时和结束计时。
- 结束计时后显示最近一次记录反馈。
- 从已有 Time Debt logs 中提取最多 3 个最近任务名，支持快捷填入。

C 线本轮只推进全局快捷键唤起 App 内浮窗控制台：

- 首选快捷键：`CommandOrControl+Alt+T`。
- fallback 快捷键：`CommandOrControl+Shift+L`，与主快捷键同时注册，避免主快捷键被当前前台应用或系统菜单捕获时没有备用入口。
- 快捷键触发后由 Electron main 进程聚焦/显示主窗口，并通过 IPC 通知 renderer 展开 Time Debt 浮窗控制台。
- 不强制切换到 Time Debt 页面；在 Wealth 页面触发后仍停留 Wealth，只展开右下角 Time Debt 浮窗。
- 不使用 `Command+X`，因为它是 macOS 系统剪切快捷键，会干扰输入框编辑行为。
- 不再默认使用 `CommandOrControl+Shift+Space`，因为它更容易与输入法、系统快捷键或空间切换类操作冲突。

D 线桌面级悬浮球 / always-on-top 小窗仍暂不开始。

## 4. 文件边界

允许：

- `app/renderer/src/features/time-debt/**/*`
- C 线快捷键所需的 Electron main / preload / shared contracts 最小改动
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
- 最近记录反馈可见
- 最近任务快捷填入在有历史 logs 时可用

C/D 线：

C 线：

- `CommandOrControl+Alt+T` 可注册时优先使用。
- fallback `CommandOrControl+Shift+L` 与首选快捷键同时注册，作为真实备用入口。
- 快捷键触发后 App 被聚焦，Time Debt 浮窗展开为 `时间控制台`。
- 在 Wealth 页面触发后不切页，Wealth 不白屏，浮窗仍展开。
- 计时中触发快捷键后计时状态保持，已用时继续递增。
- 退出 App 时快捷键清理无明显报错。

D 线：

- 后续单独开任务，不在当前阶段直接做
