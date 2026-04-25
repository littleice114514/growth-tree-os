# PRODUCT_RULES_V0_2

## 本轮目标

P0.2 的目标不是继续扩展录入，而是让成长树具备：

- 反馈能力
- 提醒能力
- 回看能力

闭环固定为：

`节点状态自动判定 -> 提醒展示 -> 周回看汇总 -> 节点可回看操作`

## 状态规则

本轮启用的节点状态：

- `new`
- `growing`
- `stable`
- `dormant`
- `review`
- `restarted`

### 判定规则

1. `last_active_at` 距今天大于 7 天：`dormant`
2. `stable` 节点距上次活跃大于 5 天：`review`
3. `evidence_count >= 3`：`stable`
4. 原本已进入 `dormant` 的节点再次新增证据：`restarted`
5. 已被再次更新但未达到 `stable`：`growing`
6. 新建且尚未进入以上状态：`new`

### 说明

- 状态由本地规则自动推导，不提供用户手动配置。
- `needs_review` 由状态规则推导，不再只服务 `growing`。

## 提醒触发规则

### reminders 表

字段固定为：

- `id`
- `node_id`
- `reminder_type`
- `status`
- `due_at`
- `created_at`
- `updated_at`
- `last_triggered_at`

### 提醒类型

- `dormant`
- `repeat_problem`
- `review_due`

### 提醒状态

- `open`
- `done`

### 触发规则

- `dormant`
  - 节点进入沉寂状态时触发
- `review_due`
  - `stable` 节点超过 5 天未活跃时触发
- `repeat_problem`
  - `issue` 类型节点在最近 7 天内持续被更新，且证据数达到 3 时触发

### 去重与重开

- 同一节点 + 同一提醒类型，同一时间只保留一个 `open`
- 提醒被标记完成后，不会立刻重开
- 只有节点发生新变化或重新进入新一轮触发窗口，才允许重新生成提醒

## 重复问题识别规则

本轮不接 AI。

最小规则为：

- `node_type = issue`
- 标题相同，或继续绑定到同一已有问题节点
- `evidence_count >= 3`
- 最近 7 天内仍有新增证据或更新

这类节点会：

- 生成 `repeat_problem` 提醒
- 进入周回看 `TOP 问题`

## 周回看统计规则

统计窗口固定为最近 7 天。

输出项固定为：

- 本周新增节点数
- 本周更新节点数
- 本周 stable 节点数
- 本周 dormant 节点数
- 本周 restarted 节点数
- 本周重复问题 TOP 3
- 本周新增复盘数

### 统计口径

- 新增节点：`created_at` 在最近 7 天内
- 更新节点：`updated_at` 或 `last_active_at` 在最近 7 天内，且不是新建当次
- 状态类统计：以当前自动判定后的状态为准
- 重复问题 TOP 3：按最近 7 天证据增量优先，再按总证据数排序

## 节点回看动作

### 标记已回看

- 关闭该节点 `review_due` 类 `open` 提醒
- 若节点当前为 `review`，重置为 `stable`

### 标记提醒完成

- 关闭当前提醒
- 不写入新证据
- 不刷新 `last_active_at`
- 不把这次动作算作节点再次成长
