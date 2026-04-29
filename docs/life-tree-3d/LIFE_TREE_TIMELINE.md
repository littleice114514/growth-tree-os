# Life Tree Timeline

本文件定义 Life Vitality Tree 的时间系统。当前只做快照和事件流设计，不接数据库、不写生成器代码。

## 1. 时间系统目标

时间系统需要回答：

- 今天这棵树发生了什么；
- 本周哪些枝干真的在生长；
- 本月是否出现成果、裂痕或恢复；
- 当前阶段是否进入新的树龄状态；
- 旧快照和新增事件如何生成新快照。

## 2. Snapshot 类型

| Snapshot | 频率 | 作用 | 主要内容 |
| --- | --- | --- | --- |
| daily snapshot | 每天 | 记录当天叶子、注意力、健康、复盘、轻量裂痕 | 叶片状态、当天事件、季节倾向 |
| weekly snapshot | 每周 | 聚合连续行动和复盘，观察枝干活跃度 | 枝干长度、根系密度、连续性 |
| monthly snapshot | 每月 | 判断成果、财富、安全线和结构变化 | 果实、裂痕、主干稳定度 |
| semester / phase snapshot | 学期或阶段 | 记录阶段成果、方向调整和年轮候选 | 年轮条目、成熟果实、长期伤痕 |

## 3. Tree Age Stage

树龄阶段不等于用户年龄，它表示 Life Tree 数据结构成熟度。

| Stage | 条件草案 | 表现 |
| --- | --- | --- |
| seed | 快照少于 7 天，事件来源不稳定 | 小树苗，少量根和叶 |
| sapling | 有连续 daily / weekly snapshot | 主干出现，枝干较少 |
| young_tree | 模块枝干稳定，开始出现果实 | 分支明显，季节变化可见 |
| mature_tree | 有月度和阶段快照，成果与伤痕可追踪 | 年轮、果实、裂痕和根系并存 |
| old_tree | 有长期年轮和多阶段历史 | 年轮视图成为重要入口 |

## 4. 生成流程

```text
1. 读取上一份 TreeSnapshot
2. 收集上一快照之后的 GrowthEvent
3. 按 GrowthRule 计算每个事件的影响
4. 合并同类影响，应用权重、衰减和上限
5. 更新 roots / trunk / branches / leaves / fruits / scars / season
6. 写入 sourceEventIds 和 generatedByRuleVersion
7. 生成新的 TreeSnapshot
8. 按周期写入 TreeTimeline
```

## 5. Daily Snapshot

Daily snapshot 关注短周期变化：

- 今日深度工作是否生成新叶；
- 今日健康行动是否补充根系；
- 今日注意力泄漏是否让叶片变暗；
- 今日是否有落叶、枯叶或裂痕信号；
- 今日复盘是否把落叶转入土壤候选。

Daily snapshot 不应该频繁改变树干粗细，也不应该轻易生成大型果实。

## 6. Weekly Snapshot

Weekly snapshot 关注连续性：

- 某条枝是否连续获得行动供给；
- 根系是否因健康和复盘变稳定；
- 时间负债是否持续加重；
- 某些叶子是否自然衰减为枯叶；
- 是否出现阶段成果候选。

Weekly snapshot 可以调整枝干长度、活跃度和小范围裂痕。

## 7. Monthly Snapshot

Monthly snapshot 关注结构性变化：

- 果实是否成熟；
- 财富安全线是否改善或恶化；
- 主干稳定度是否变化；
- 长期未更新枝干是否进入休眠；
- 裂痕是否修复、保留或加重。

Monthly snapshot 可以改变树冠密度、主枝状态和季节趋势。

## 8. Semester / Phase Snapshot

Phase snapshot 用于阶段归档：

- 把成熟果实写入年轮候选；
- 记录重大裂痕和修复过程；
- 记录阶段主线切换；
- 生成下一阶段建议；
- 为后期年轮视图提供数据。

## 9. Snapshot 与事件的关系

`GrowthEvent` 是事实记录，`TreeSnapshot` 是某个时间点的树状态。

原则：

- 快照可以从事件重新生成；
- 事件不能从快照反推出完整事实；
- 快照必须记录参与生成的 `sourceEventIds`；
- 规则版本变化时，可以选择重算快照；
- 渲染层只读取快照，不读取原始业务表。

## 10. 回放与对比

未来无 3D 生长模拟器可以用同一套时间线做：

- 昨天 vs 今天；
- 本周 vs 上周；
- 本月 vs 上月；
- 当前阶段 vs 上一阶段；
- M3D-2 中先用表格或 2D 预览验证快照变化，再进入 3D POC。
