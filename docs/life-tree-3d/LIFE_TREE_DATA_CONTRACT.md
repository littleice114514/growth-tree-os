# Life Tree 3D Data Contract

本文件定义未来代码层可参考的数据契约草案。当前只写 TypeScript 风格伪类型，不接入业务代码，不创建正式类型文件，不改数据库。

## 1. 分层原则

数据流固定为：

```ts
previous TreeSnapshot + GrowthEvent[] + GrowthRule[] -> next TreeSnapshot -> TreeTimeline -> Renderer
```

- 旧 `TreeSnapshot` 表示昨天或上一阶段的树状态。
- `GrowthEvent` 记录发生了什么。
- `GrowthRule` 定义事件如何影响树。
- 新 `TreeSnapshot` 保存今天或当前阶段结算后的树状态。
- `TreeTimeline` 管理 daily / weekly / monthly / phase 快照。
- Renderer 只读取 `TreeSnapshot` 和 `QualityProfile`，不直接读业务事件。

核心公式：

```text
昨天的树状态 + 今天发生的成长事件 + 生长规则 = 今天的新树状态
```

## 2. RendererMode

```ts
type RendererMode =
  | 'none'
  | 'static_2d'
  | 'procedural'
  | 'low-poly'
  | 'semi-realistic'
  | 'realistic'
```

## 3. QualityProfile

```ts
interface QualityProfile {
  id: 'win_high' | 'desktop_medium' | 'mac_low' | 'fallback_2d'
  rendererMode: RendererMode
  maxLeaves: number
  maxBranches: number
  maxFruits: number
  maxAnimatedObjects: number
  maxTextureSize: 512 | 1024 | 2048
  shadows: 'off' | 'blob' | 'soft'
  postProcessing: boolean
  fallbackReason?: string
}
```

## 4. TreeSnapshot

```ts
interface TreeSnapshot {
  id: string
  ownerId: string
  snapshotDate: string
  snapshotType: 'daily' | 'weekly' | 'monthly' | 'semester' | 'yearly' | 'custom_phase'
  treeAgeStage: 'seedling' | 'young_tree' | 'expanding_tree' | 'mature_tree' | 'ancient_tree'
  season: SeasonState
  vitality: {
    score: number
    pattern: 'growing' | 'stable' | 'repairing' | 'burning' | 'scattered' | 'unknown'
    trend: 'up' | 'flat' | 'down'
  }
  trunk: {
    height: number
    radius: number
    stability: number
    rings: AnnualRingState[]
  }
  roots: RootState
  branches: BranchState[]
  leaves: LeafState[]
  fruits: FruitState[]
  scars: ScarState[]
  sourceEventIds: string[]
  generatedByRuleVersion: string
  createdAt: string
}
```

## 5. GrowthEvent

```ts
interface GrowthEvent {
  id: string
  occurredAt: string
  sourceType:
    | 'deep_work'
    | 'health_action'
    | 'time_debt'
    | 'wealth_update'
    | 'review'
    | 'milestone'
    | 'attention_leak'
    | 'relationship'
  sourceId?: string
  module: 'project' | 'learning' | 'health' | 'wealth' | 'relationship' | 'ai_workflow' | 'review' | 'general'
  intensity: number
  durationMinutes?: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  evidence: string
  tags: string[]
}
```

## 6. GrowthRule

```ts
interface GrowthRule {
  id: string
  version: string
  eventSourceType: GrowthEvent['sourceType']
  targetPart: 'root' | 'trunk' | 'branch' | 'leaf' | 'fruit' | 'scar' | 'season'
  targetModule?: GrowthEvent['module']
  weight: number
  decayPerDay: number
  capPerSnapshot: number
  minEvidence?: number
  effect: {
    metric: string
    operation: 'add' | 'subtract' | 'multiply' | 'set_flag'
    value: number | string | boolean
  }
}
```

## 7. TreeTimeline

```ts
interface TreeTimeline {
  ownerId: string
  currentSnapshotId: string
  dailySnapshots: TreeSnapshot[]
  weeklySnapshots: TreeSnapshot[]
  monthlySnapshots: TreeSnapshot[]
  semesterSnapshots: TreeSnapshot[]
  yearlySnapshots: TreeSnapshot[]
  phaseSnapshots: TreeSnapshot[]
  eventCursor: {
    lastEventId: string
    lastGeneratedAt: string
  }
}
```

## 8. BranchState

```ts
interface BranchState {
  id: string
  module: GrowthEvent['module']
  label: string
  parentBranchId?: string
  depth: number
  length: number
  radius: number
  vitality: number
  activityLevel: number
  directionBias: 'left' | 'right' | 'up' | 'down' | 'balanced'
  leafIds: string[]
  fruitIds: string[]
  scarIds: string[]
}
```

## 9. LeafState

```ts
interface LeafState {
  id: string
  nodeId: string
  branchId: string
  sourceEventId: string
  status: 'fresh' | 'stable' | 'withered' | 'fallen'
  vitality: number
  ageDays: number
  size: number
  colorToken: 'spring' | 'summer' | 'autumn' | 'winter' | 'dim'
}
```

## 10. FruitState

```ts
interface FruitState {
  id: string
  nodeId: string
  branchId: string
  sourceEventId: string
  resultType: 'delivery' | 'income' | 'award' | 'workflow' | 'version' | 'review'
  maturity: number
  reusable: boolean
  archivedToRing: boolean
}
```

## 11. ScarState

```ts
interface ScarState {
  id: string
  nodeId: string
  targetPart: 'trunk' | 'branch' | 'root'
  targetId: string
  sourceEventId: string
  severity: number
  healed: boolean
  healingProgress: number
  label: string
}
```

## 12. SeasonState

```ts
interface SeasonState {
  current: 'spring' | 'summer' | 'autumn' | 'winter' | 'mixed' | 'unknown'
  reason: string
  growthBias: number
  repairBias: number
  harvestBias: number
  burnoutRisk: number
}
```

## 13. RootState and AnnualRingState

```ts
interface RootState {
  depth: number
  density: number
  stability: number
  nutrients: Array<{
    sourceEventId: string
    type: 'review' | 'health' | 'wealth_safety' | 'relationship' | 'habit'
    strength: number
  }>
}

interface AnnualRingState {
  year: number
  phaseId?: string
  summary: string
  vitalityAverage: number
  fruitCount: number
  scarCount: number
  dominantModules: GrowthEvent['module'][]
}
```

## 14. Contract Boundary

这些接口是未来实现的草案，不代表数据库 schema。M3D-1 可以把其中一部分移动到正式类型文件，但必须先确认：

- 事件来源已经稳定；
- 规则版本可以追踪；
- 快照可以重新生成；
- 渲染层不依赖业务原始数据；
- Mac fallback 可以使用同一份快照。
