# P0-D｜主工作区挂载统一入口

日期：2026-05-16
分支：feature/integration-time-debt-wealth
基底：30f251d feat(app): add unified quick record shell

## 本轮目标

将 UnifiedQuickRecordFloat 挂载到主工作区，让统一记录入口在所有基础模块页面可见。

## 实现

### 修改文件

`app/renderer/src/pages/MainWorkspacePage.tsx`
- 移除 `TimeDebtQuickFloat` 导入和挂载
- 替换为 `UnifiedQuickRecordFloat`
- 统一入口现在全局可见（Time Debt / Wealth / Review / Reminders / Settings 等所有页面）

`app/renderer/src/features/wealth/WealthDashboard.tsx`
- 移除 `WealthQuickRecordFloat` 导入和挂载
- 避免 Wealth 页面出现两个记录浮窗

### 旧入口状态

| 旧组件 | 源码保留 | 页面挂载 |
|---|---|---|
| TimeDebtQuickFloat | 是 | 已移除 |
| WealthQuickRecordFloat | 是 | 已移除 |

### 已知副作用

- Time Debt 全局快捷键（旧 `CommandOrControl+Alt+Z` 对应 Time Debt 的）将无法打开浮窗，因为 TimeDebtQuickFloat 已不在页面中。记录为 P0-E 处理。
- Wealth 全局快捷键同理，记录为 P0-E 处理。
- Settings 页面仍有 Time Debt 快捷键设置项，功能暂时无效，P0-E 收口。

## 验证

- pnpm typecheck 通过
- pnpm build 通过

## 手动验收路径

1. `pnpm dev`
2. 进入 Time Debt → 可见统一「记录」入口
3. 进入 Wealth → 可见统一「记录」入口，无重复旧浮窗
4. 进入 Review / Reminders / Settings → 仍可见统一入口
5. 点击「记录」→ 可选择「记录时间 / 记录财富」
6. 选择后进入对应表单

## 不做的事

- 不做统一快捷键（P0-E）
- 不改 app/main
- 不改 preload
- 不改 shared/contracts
- 不删除旧组件源码
