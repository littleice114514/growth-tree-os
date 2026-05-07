# AI Workflow Token Saving｜AI 工作流省 token 规则

## 1. 为什么不能每次读取完整 dev-log

`docs/dev-log/**` 是完整归档，不是每次开工的默认上下文入口。随着双端任务增多，全文扫描会带来以下问题：

- 浪费 token，把历史细节挤占到当前任务上下文之前。
- 容易误读旧阶段状态，把已经暂停或已废弃的内容当成当前目标。
- 增加跨设备冲突风险，因为代理可能依据旧日志修改错误文件。
- 降低开工速度，让每次任务都重新理解整个项目。

## 2. project-state 三件套的作用

- `CURRENT_STATUS.md`：当前状态卡，只放最新阶段、允许范围、禁止范围和下一步唯一任务。
- `LOG_INDEX.md`：日志索引，只放最近任务摘要和原始日志路径。
- `NEXT_ACTION.md`：下一步执行卡，只放本轮目标、步骤、验收标准和可检验信号。

三件套是开工入口，不替代完整日志归档。

## 3. Codex / Claude / GPT 开工读取顺序

默认顺序：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/LOG_INDEX.md` 最近 5 条
3. `docs/project-state/NEXT_ACTION.md`
4. 与本轮任务直接相关的协议文件
5. 与本轮任务直接相关的代码文件

禁止默认读取全部 `docs/dev-log/**`。

## 4. 什么时候允许读取完整日志

只有满足以下任一条件时，才允许读取原始 dev-log：

- `LOG_INDEX.md` 指向某条日志，且本轮任务必须追溯该任务的具体命令、错误或决策。
- 当前文件状态与状态卡冲突，需要核对最近 1 到 3 条原始日志。
- Git 冲突、验收失败或跨设备接续失败，需要查找直接相关的历史证据。

即使允许读取，也应按路径读取相关 1 到 3 个文件，不扫描完整目录。

## 5. 什么时候只读 LOG_INDEX

以下情况只读 `LOG_INDEX.md`：

- 判断最近完成了什么。
- 找上一轮日志路径。
- 确认下一步入口。
- 判断是否需要打开某条原始日志。
- 生成简短交接摘要。

## 6. Mac / Windows 双端同步规则

- Windows 可负责 AI 工作流、skills、协议底座、project-state 和日志索引规则。
- Mac 同步后必须做一次 pull 验收。
- Mac 验收时只检查文件存在、读取顺序和规则可用性。
- Mac 不在同一轮重写 Windows 刚建立的 project-state 和 dev-protocol 核心内容。
- Mac 验收通过后写入独立日志：`docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-ai-workflow-sync-check.md`。

## 7. 每轮结束必须更新哪些文件

每轮任务结束时，默认更新：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/LOG_INDEX.md`
3. 本轮独立 dev-log
4. 如涉及跨设备接续，更新 `docs/handoff/MAC_NEXT_ACTION.md`

如果某轮任务没有改变当前状态，也必须在 dev-log 中说明未更新状态卡的原因。

## 8. 推荐日志模板

```md
# 开发日志｜设备｜任务名｜YYYY-MM-DD

## 1. 本轮目标

## 2. 当前分支

## 3. 修改文件

## 4. 核心规则 / 核心改动

## 5. 未修改区域

## 6. 验收命令

## 7. 验收结果

## 8. 风险与遗留问题

## 9. 下一步建议
```

## 9. 常见错误

- 全文扫描 `docs/dev-log/**`。
- 每次重新总结全部历史。
- 跨设备同时修改 project-state 和 dev-protocol 核心内容。
- 忘记更新 `CURRENT_STATUS.md`。
- 只写完整日志，不更新 `LOG_INDEX.md`。
- 在业务分支里顺手推进不相关模块。
- 在未确认当前分支和工作区状态前直接 pull 或改文件。

