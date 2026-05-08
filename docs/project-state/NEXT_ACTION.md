# Next Action｜下一步唯一任务

## 1. 下一步唯一任务

开始选择一个业务模块推进。

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

下一轮需要先选定业务模块，再按该模块边界声明允许修改范围。

## 5. 当前禁止修改范围

- `app/**`
- `src/**`
- `public/assets/**`
- 3D 模型、材质、贴图、渲染实现
- Time Debt / Wealth / Tree 等业务代码
- UI 页面
- 数据库业务逻辑

## 6. 验收标准

下一轮开工前先确认：

- `AGENTS.md` 存在。
- `docs/project-state/CURRENT_STATUS.md` 存在。
- `docs/project-state/NEXT_ACTION.md` 存在。
- `docs/project-state/LOG_INDEX.md` 存在。
- 已明确选择一个业务模块。
- 已声明该业务模块的允许修改范围和禁止修改范围。

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
