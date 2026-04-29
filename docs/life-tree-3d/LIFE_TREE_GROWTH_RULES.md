# Life Tree Growth Rules

本文件定义 Life Vitality Tree 3D 的生长规则草案。当前只做规则设计，不接代码、不接数据库、不引入 3D 依赖。

## 1. 规则计算原则

每条规则都遵循同一个结构：

- 输入：`GrowthEvent`
- 规则：`GrowthRule`
- 输出：对 `TreeSnapshot` 中某个树部位的状态增减
- 限制：权重、衰减、上限、目标树部位

规则不直接驱动渲染。渲染层只读取已经计算好的 `TreeSnapshot`。

## 2. 生长规则表

负面事件只作为修复提醒，不作为惩罚系统。裂痕、枯叶和低生命力状态应提示用户需要恢复、复盘或调整，而不是简单地让树死亡。

| 事件 | 目标树部位 | 基础权重 | 衰减 | 单周期上限 | 规则效果 |
| --- | --- | ---: | ---: | ---: | --- |
| 深度工作 30 分钟以上 | 项目枝 / 学习枝 / AI 协作枝 | 0.8 | 每天 8% | 每日 3.0 | 增加枝干 activityLevel，生成或刷新叶子 |
| 深度工作 90 分钟以上 | 项目枝 / 主干 | 1.4 | 每天 6% | 每日 4.0 | 增加枝长和主干稳定度 |
| 健康行动 | 根系 / 主干 | 0.7 | 每天 10% | 每日 2.5 | 增加 root stability，降低 burning 风险 |
| 睡眠或恢复记录良好 | 根系 / 季节 | 0.9 | 每天 12% | 每日 2.0 | 增加 recoveryBias，推动冬季修复转春季 |
| 时间负债增加 | 主干裂痕 / 相关枝干裂痕 | -1.0 | 每天 5% | 每日 -3.0 | 生成或加重 ScarState |
| 高强度注意力泄漏 | 叶片 / 主干生命力 | -0.8 | 每天 15% | 每日 -2.5 | 叶片变暗，vitality 下降 |
| 财富安全线改善 | 财富枝 / 根系 | 1.0 | 每周 5% | 每周 4.0 | 增强财富枝 radius 和 root nutrient |
| 财富压力上升 | 财富枝 / 主干压力 | -0.9 | 每周 4% | 每周 -3.0 | 增加 trunk pressure 或财富枝裂痕 |
| 连续复盘 3 天 | 根系 / 土壤 / 主干 | 1.1 | 每周 8% | 每周 3.5 | 增加 root density 和 trunk stability |
| 有效失败复盘 | 土壤 / 根系 / 旧伤修复 | 0.9 | 每周 10% | 每周 3.0 | scar healingProgress 增加，落叶转土壤 |
| 阶段成果 | 果实 / 年轮候选 | 1.5 | 每月 3% | 每月 6.0 | 生成 FruitState，进入 AnnualRing 候选 |
| 可复用流程沉淀 | 果实 / 根系养分 | 1.3 | 每月 4% | 每月 5.0 | 生成 reusable fruit 和 root nutrient |

## 3. M3D-0 EventType 规则表

| eventType | sourceModule | targetTreePart | targetBranch | effectType | intensity | weight | decay | maxImpact | visualHint | note |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| deep_work_completed | 项目 / 学习 / AI 协作 | branch / leaf | project / study / ai_workflow | grow_leaf_and_branch | 0.6-1.0 | 1.0 | 0.08/day | 3.0/day | 新叶、枝端轻微延展 | 深度工作优先生成叶片，连续发生才推动枝干明显生长。 |
| health_action_completed | 健康 | root / trunk / season | health | strengthen_root | 0.4-0.9 | 0.8 | 0.10/day | 2.5/day | 根系变亮、主干更稳 | 健康行动是底层供给，不直接变成果实。 |
| time_debt_increased | 时间负债 | scar / leaf / trunk | time_debt | add_repair_signal | 0.4-1.0 | -0.8 | 0.05/day | -3.0/day | 浅裂痕、叶片变暗 | 这是修复提醒，不是失败惩罚；可通过偿还和复盘修复。 |
| time_debt_repaid | 时间负债 | scar / root / season | time_debt | heal_scar | 0.4-1.0 | 0.9 | 0.08/day | 3.0/day | 裂痕变浅、根系恢复 | 偿还时间负债提高 healingProgress，不抹除历史痕迹。 |
| wealth_state_improved | 财富 | branch / root | wealth | strengthen_security_line | 0.3-1.0 | 1.0 | 0.05/week | 4.0/week | 财富枝变粗、根系稳定 | 财富改善优先增强安全线和长期供给。 |
| reflection_completed | 复盘 | soil / root / scar | review | convert_leaf_to_soil | 0.3-0.8 | 0.7 | 0.10/week | 2.5/week | 土壤加深、旧叶入土 | 普通复盘提供土壤材料。 |
| reflection_streak_gained | 复盘 | root / trunk | review | strengthen_continuity | 0.6-1.0 | 1.1 | 0.08/week | 3.5/week | 根系密度提升、主干纹理稳定 | 连续复盘强化底层结构。 |
| project_milestone_completed | 项目 | fruit / branch / annual_ring | project | create_fruit | 0.7-1.0 | 1.5 | 0.03/month | 6.0/month | 果实出现、枝条成熟 | 阶段成果可成为果实和年轮候选。 |
| study_action_completed | 学习 | leaf / branch | study | grow_study_leaf | 0.3-0.8 | 0.8 | 0.08/day | 2.5/day | 学习枝新叶 | 学习行动重在持续，不用一次行动夸大枝干。 |
| attention_leak_detected | 注意力 | leaf / season / scar | general | dim_leaf | 0.3-0.8 | -0.6 | 0.15/day | -2.0/day | 叶片透明度下降 | 用于提醒注意力泄漏，不做强惩罚。 |
| destructive_entertainment_overused | 娱乐 / 时间负债 | leaf / scar / season | time_debt | add_repair_signal | 0.5-1.0 | -0.9 | 0.12/day | -2.8/day | 枯叶、轻裂痕、冬季倾向 | 短视频或游戏失控应导向复盘和恢复。 |
| relationship_event_recorded | 关系 | root / season | relationship | adjust_support | 0.2-0.8 | 0.6 | 0.10/week | 2.0/week | 根系侧向连接、季节柔和 | 关系事件可正可负，默认先作为支持或波动信号。 |

## 4. 深度工作规则

深度工作主要影响项目枝、学习枝和 AI 协作枝。

```ts
rule: {
  eventSourceType: 'deep_work',
  targetPart: 'branch',
  weight: 0.8,
  decayPerDay: 0.08,
  capPerSnapshot: 3.0
}
```

规则解释：

- 30 分钟以上生成或刷新叶子；
- 90 分钟以上才允许明显拉长枝干；
- 连续深度工作提高枝干粗细，但每日有上限；
- 深度工作中断不会立即删除叶子，只让叶片随时间衰减。

## 5. 健康行动规则

健康行动优先增强根系，而不是直接生成果实。

- 运动、睡眠、身体恢复、稳定饮食都进入 root nutrients；
- 健康行动连续出现时，提高主干稳定度；
- 健康低迷时，主干不一定变细，但季节更容易进入 winter / repairing。

## 6. 时间负债与裂痕规则

时间负债不会直接判定失败，而是作为结构压力记录。

- 短期时间负债：影响叶片鲜活度；
- 中期时间负债：在相关枝干生成裂痕；
- 长期时间负债：在主干生成压力纹理；
- 有效复盘和恢复行动可以提高 `healingProgress`。

裂痕不会被直接删除。修复后的裂痕仍可保留为年轮和树皮纹理的一部分。

## 7. 财富状态规则

财富状态主要影响财富枝和根系安全线。

- 收入、储蓄、安全线改善：增加财富枝活跃度和根系稳定度；
- 固定支出压力、现金流紧张：增加主干压力和财富枝裂痕；
- 投资或收入类果实必须有明确证据，不通过想象生成。

## 8. 连续复盘规则

连续复盘影响根系和主干。

- 普通复盘：增加土壤材料；
- 连续 3 天复盘：增加 root density；
- 连续 7 天复盘：增加 trunk stability；
- 复盘含明确防复发动作时，可以修复旧伤；
- 空泛复盘只记为弱信号，不生成果实。

## 9. 阶段成果与果实规则

果实必须来自可验证成果：

- 发布版本；
- 完成验收；
- 获得收入；
- 形成可复用流程；
- 完成年度或阶段复盘；
- 拿到外部结果或内部可沉淀资产。

果实可以成熟、腐烂、归档到年轮。写实模型阶段中，果实应是可独立替换的模块化资产。

## 10. 注意力泄漏规则

注意力泄漏主要造成生命力下降和叶片枯化。

- 轻度泄漏：减少当天 leaf vitality；
- 重度泄漏：生成 withered leaf；
- 反复泄漏：增加 trunk scar 或 branch scar；
- 有效复盘后，落叶可以进入土壤候选。

## 11. 上限与衰减

所有正向规则都必须有上限，避免一天的大量事件让树过度膨胀。所有负向规则都必须可恢复，避免用户被一次失败永久惩罚。

默认建议：

- daily snapshot：限制叶子和当日活跃度变化；
- weekly snapshot：限制枝干粗细和根系变化；
- monthly snapshot：允许果实、裂痕和季节趋势稳定下来；
- phase snapshot：归档年轮、成熟果实和长期伤痕。
