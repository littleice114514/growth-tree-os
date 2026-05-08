# Next Action｜下一步唯一任务

## 1. 下一步唯一任务

另一台设备拉取 `feature/mac-sync-ai-workflow-only`，只读验收 Codex 工作底座 v4 是否已经固化到项目中。

## 2. 本轮不做

1. 不继续改 3D 模型。
2. 不继续改触控板视角控制。
3. 不改 Time Debt / Wealth / Tree 业务功能。
4. 不改数据库结构。
5. 不做页面大重构。
6. 不修改业务代码。

## 3. 后续开工默认读取顺序

1. `AGENTS.md`
2. `docs/project-state/CURRENT_STATUS.md`
3. `docs/project-state/NEXT_ACTION.md`
4. `docs/project-state/LOG_INDEX.md` 最近 5 条
5. 与本轮任务直接相关的协议文件
6. 与本轮任务直接相关的代码文件

## 4. 当前允许修改范围

- `AGENTS.md`
- `docs/project-state/**`
- `docs/dev-protocol/**`
- `docs/handoff/**`

## 5. 当前禁止修改范围

- `app/**`
- `src/**`
- `public/assets/**`
- 3D 模型、材质、贴图、渲染实现
- Time Debt / Wealth / Tree 等业务代码
- UI 页面
- 数据库业务逻辑

## 6. 验收标准

- `AGENTS.md` 存在，并包含省 token 开工、工作流优化边界、GitHub Sync Gate 和 Mac 下一步操作卡规则。
- `docs/project-state/CURRENT_STATUS.md` 存在。
- `docs/project-state/NEXT_ACTION.md` 存在，且只包含一个下一步唯一任务。
- `docs/project-state/LOG_INDEX.md` 存在，并以最近日志索引替代完整 dev-log 扫描。
- `docs/handoff/MAC_NEXT_ACTION.md` 存在，并包含另一台设备可直接执行的 pull 命令。
- `git diff --name-only HEAD~1 HEAD` 不包含 `app/`、`src/`、`public/assets/` 或业务资源目录。

## 7. 可检验信号

```bash
git branch --show-current
git status --short
git rev-parse --short HEAD
test -f AGENTS.md
test -f docs/project-state/CURRENT_STATUS.md
test -f docs/project-state/NEXT_ACTION.md
test -f docs/project-state/LOG_INDEX.md
test -f docs/handoff/MAC_NEXT_ACTION.md
git diff --name-only HEAD~1 HEAD
```
