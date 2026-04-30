# Life Tree 3D

当前模块处于 M3D-3：程序化 3D POC。

## 当前做了什么

- 保留 M3D-1 的 `TreeSnapshot`、`GrowthEvent`、`GrowthRule`、时间线、渲染模式和质量档位类型。
- 保留 M3D-2 的 `growth-engine/`，用纯函数模拟 `previous TreeSnapshot + GrowthEvent[] + GrowthRule[] = next TreeSnapshot`。
- 新增 `layout/`，将 `TreeSnapshot` 转成可复用的程序化 3D 布局数据。
- 新增 `renderers/` 和 `components/`，用 Three.js / React Three Fiber / Drei 渲染低风险程序化树。
- 新增 `demo/LifeTree3DPreview.tsx`，使用 `mockGrowthSimulationResult.nextSnapshot` 进入 3D 预览。
- 支持 OrbitControls 旋转 / 缩放、节点点击调试、ESC 取消选中和 low / medium / high 画质档位。

## 当前没有做什么

- 不制作 Blender 模型。
- 不导入 glb / glTF / 图片贴图等重资源。
- 不实现写实模型 renderer。
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

M3D-3 的 3D POC 只能读取 `TreeSnapshot`、`GrowthTransition` 或调试摘要，不允许把生长判断写进 renderer。

Renderer 不应直接读取：

- `GrowthEvent`
- `GrowthRule`
- 真实复盘、时间负债、财富或数据库模块

Renderer 只负责把已经生成的 `TreeSnapshot` 展示出来。

## Procedural Renderer

当前 procedural renderer 的主链路：

```text
TreeSnapshot
-> createProceduralTreeLayout
-> ProceduralTreeRenderer
-> LifeTreeCanvas
-> TreeDebugPanel
```

- `createProceduralTreeLayout` 不依赖 React 或 Canvas，后续写实 renderer 可以复用布局概念。
- `ProceduralTreeRenderer` 只负责渲染树干、8 个主枝、叶子、果实、裂痕占位和少量标签。
- `TreeQualityPanel` 控制 low / medium / high 档位，默认不会进入 high。
- 当前没有写实模型；后续写实模型应通过 `rendererMode` 替换 renderer，而不是把模型逻辑写进 GrowthEngine。

## 后续阶段

- M3D-4：完善 3D 交互层，包括 hover、视角预设、节点定位、调试面板体验和 Mac low profile 验收。
- M3D-5：定义写实模型接口，但仍需通过 renderer mode 替换，不应改动 GrowthEngine。

## Win / Mac 分工

- Windows 本轮负责程序化 3D POC、依赖接入、渲染边界、文档同步和 dev-log。
- Mac 本轮不参与实现；后续可用 low / medium 档验收预览稳定性和交互体验。
