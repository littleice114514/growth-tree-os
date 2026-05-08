# Next Action｜下一步唯一任务

## 1. 下一步唯一任务

M13 P1｜Time Debt 跨天计时拆分。

## 2. 本轮不做

1. 不继续改 3D 模型。
2. 不继续改触控板视角控制。
3. 不改 Wealth 业务功能。
4. 不改 Tree / Graph 业务功能。
5. 不改数据库结构。
6. 不做页面大重构。
7. 不做标题选项复用。
8. 不做全局状态管理重构。

## 3. 后续开工默认读取顺序

1. `AGENTS.md`
2. `docs/project-state/CURRENT_STATUS.md`
3. `docs/project-state/NEXT_ACTION.md`
4. `docs/project-state/LOG_INDEX.md` 最近 5 条
5. 与本轮任务直接相关的协议文件
6. 与本轮任务直接相关的代码文件

## 4. 当前允许修改范围

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- 必要时可修改 `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `docs/project-state/**`
- `docs/handoff/MAC_NEXT_ACTION.md`
- 必要 dev-log

## 5. 当前禁止修改范围

- 3D 相关文件
- Wealth 相关文件
- Tree / Graph 相关文件
- `public/assets/**`
- 3D 模型、材质、贴图、渲染实现
- 数据库业务逻辑
- 全局状态管理架构
- 无关 UI 大改

## 6. 验收标准

下一轮开工前先确认：

- `AGENTS.md` 存在。
- `docs/project-state/CURRENT_STATUS.md` 存在。
- `docs/project-state/NEXT_ACTION.md` 存在。
- `docs/project-state/LOG_INDEX.md` 存在。
- M13 P0 计时状态持久化修复已在当前分支。
- 已声明 P1 跨天拆分的允许修改范围和禁止修改范围。
- 跨天拆分完成后，跨 00:00 的计时记录应按日期拆分为多条日志。

## 7. 可检验信号

```bash
git branch --show-current
git status --short
git rev-parse --short HEAD
test -f AGENTS.md
test -f docs/project-state/CURRENT_STATUS.md
test -f docs/project-state/NEXT_ACTION.md
test -f docs/project-state/LOG_INDEX.md
```
