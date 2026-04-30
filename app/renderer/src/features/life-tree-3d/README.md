# Life Tree 3D Growth Engine

当前模块处于 M3D-2：无 3D 纯数据生长模拟器。

## 当前做了什么

- 保留 M3D-1 的 `TreeSnapshot`、`GrowthEvent`、`GrowthRule`、时间线、渲染模式和质量档位类型。
- 新增 `growth-engine/`，用纯函数模拟 `previous TreeSnapshot + GrowthEvent[] + GrowthRule[] = next TreeSnapshot`。
- 新增 `GrowthTransition` 和 `GrowthDeltaSummary`，为后续动画和调试摘要准备结构化变化描述。
- 新增 `mockGrowthSimulationResult`，使用 `mockTreeSnapshot`、`mockGrowthEvents` 和 `defaultGrowthRules` 生成一次可检查的模拟结果。

## 当前没有做什么

- 不安装 `three`、`@react-three/fiber`、`@react-three/drei`。
- 不实现 3D renderer、Canvas、模型加载、WebGL 初始化或动画系统。
- 不导入 glb / glTF / 图片贴图等重资源。
- 不接真实数据库，不修改主页面 UI。

## GrowthEngine 输入输出

```text
baseSnapshot
+ growthEvents
+ growthRules
+ options
= nextSnapshot + transition + deltaSummary + warnings
```

- `createNextTreeSnapshot` 是当前核心入口。
- `applyGrowthEvents` 负责事件排序、规则匹配、忽略事件和 warning 收集。
- `applyGrowthRule` 负责单条规则对快照的局部影响。
- `calculateTreeVitality` 和 `calculateBranchHealth` 负责可替换的 M3D-2 评分逻辑。
- `createGrowthTransition` 输出后续动画层可读取的变化清单。
- `summarizeGrowthDelta` 输出调试用变化摘要，不是最终 UI 文案。

## Renderer 边界

后续 M3D-3 的 3D POC 只能读取 `TreeSnapshot`、`GrowthTransition` 或调试摘要，不允许把生长判断写进 renderer。

Renderer 不应直接读取：

- `GrowthEvent`
- `GrowthRule`
- 真实复盘、时间负债、财富或数据库模块

Renderer 只负责把已经生成的 `TreeSnapshot` 展示出来。

## 后续阶段

- M3D-3：基于 `TreeSnapshot` 做程序化 3D POC。
- M3D-3 仍需保持业务生长逻辑与 renderer 分离。
- Mac low profile 后续可使用 `suggestedAnimationLevel` 的 `none` / `subtle` 降级动画。

## Win / Mac 分工

- Windows 本轮负责纯数据模拟器、mock 输出、文档同步和 dev-log。
- Mac 本轮不参与实现，不修改 UI 页面；后续可只读验收输出可读性和 M3D-3 接入边界。
