# 开发日志｜Mac｜M13 Time Debt Timer Stability P0｜2026-05-08

## 1. 本轮目标

修复 Time Debt 计时器基础稳定性：runningTimer 持久化、刷新恢复、beforeunload 提醒、结束成功清理、保存失败错误提示与安全清理入口。

## 2. 当前分支

`main`

## 3. 修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-08/mac-time-debt-timer-stability-p0.md`

## 4. 核心改动

- 新增 runningTimer localStorage key：`growth-tree-os:time-debt-running-timer:v1`。
- 组件初始化时安全读取并恢复 runningTimer，损坏数据会被清理。
- runningTimer 变化时同步写入或清理 localStorage。
- runningTimer 存在时注册 beforeunload 提醒。
- 结束计时成功后清理 React state 和 localStorage。
- persistLog 失败或抛错时显示错误提示，保留计时器用于重试，并提供安全清理入口。

## 5. 未修改区域

- 未修改 3D 相关文件。
- 未修改 Wealth 相关文件。
- 未修改 Tree / Graph 相关文件。
- 未修改 `public/assets/**`。
- 未修改数据库结构。
- 未重构全局状态管理。
- 未做跨天拆分和标题选项复用。

## 6. 验收命令

```bash
pnpm typecheck
git diff --name-only
git diff --name-only | grep -E '^(app/|src/|public/assets/|assets/|models/|3d/)' || true
```

## 7. 验收结果

- `pnpm typecheck` 通过。
- diff 只包含允许范围内的 Time Debt 计时器文件和文档。
- 业务禁止路径排除检查通过。
- 未完成真实浏览器手动验收；需后续进入 Time Debt 页面验证刷新恢复、beforeunload 与 localStorage 清理。

## 8. 风险与遗留问题

- localStorage 写入失败时当前只在控制台记录错误；计时器仍可继续使用，但刷新恢复可能不可用。
- P1 跨天计时拆分未做。
- P2 标题选项复用未做。

## 9. 下一步建议

M13 P1｜Time Debt 跨天计时拆分。
