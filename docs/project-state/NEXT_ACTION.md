# Next Action

## 唯一下一步任务

M13 P1｜Time Debt 跨天计时拆分。

## 接续前检查

```bash
git fetch origin
git checkout feature/m13-time-debt-timer-stability-p0-on-latest-ui
git pull origin feature/m13-time-debt-timer-stability-p0-on-latest-ui
pnpm typecheck
pnpm build
```

## P1 边界

- 只处理 Time Debt 跨天计时拆分。
- 不回退新版 UI。
- 不覆盖 `app/renderer/src/features/time-debt/calendar/*`。
- 不删除 `timeDebtActiveTimerStorage.ts` 或 `timeDebtPlansStorage.ts`。
- 不修改 3D / Wealth / Tree 相关文件。
- 不做全局状态重构。
- 不改数据库结构。

## P1 建议入口

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `@shared/timeDebt` 中的日志创建与 duration 计算逻辑

## P1 验收重点

- 23:xx 开始、次日结束时可以拆成多条日期正确的日志。
- 拆分后每日 duration 合计等于原始计时时长。
- active timer storage 在全部日志保存成功后清理。
- 任一日志保存失败时不能静默失败，且不能丢失当前 running timer。
