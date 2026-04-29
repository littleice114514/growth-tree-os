# Life Tree 3D Contracts

当前模块处于 M3D-1：类型与规则草案。

## 当前做了什么

- 定义 `TreeSnapshot`、`GrowthEvent`、`GrowthRule`、时间线、渲染模式和质量档位类型。
- 新增 `defaultGrowthRules`，把 M3D-0 文档中的成长事件落成静态规则草案。
- 新增 `mockTreeSnapshot` 和 `mockGrowthEvents`，为 M3D-2 的无 3D 生长模拟器准备输入样例。
- 新增 `clamp` 和 `normalizeScore`，作为后续纯函数模拟器的基础工具。

## 当前没有做什么

- 不安装 `three`、`@react-three/fiber`、`@react-three/drei`。
- 不实现 3D renderer、Canvas、模型加载、WebGL 初始化或动画系统。
- 不导入 glb / glTF / 图片贴图等重资源。
- 不接真实数据库，不修改主页面 UI。

## 数据关系

```text
previous TreeSnapshot + GrowthEvent[] + GrowthRule[] = next TreeSnapshot
```

- `GrowthEvent` 描述发生了什么。
- `GrowthRule` 描述事件如何影响树。
- `TreeSnapshot` 保存某个时间点的树状态。
- 后续 renderer 只读取 `TreeSnapshot`、`QualityProfile` 和 `RendererMode`。

## 后续阶段

- M3D-2：实现无 3D 生长模拟器，用纯数据验证快照变化。
- M3D-3：才开始基于 `TreeSnapshot` 做程序化 3D POC。

## Win / Mac 分工

- Windows 本轮负责类型契约、规则草案、mock 数据和 3D 前置数据边界。
- Mac 本轮不参与实现，不修改 UI 页面；后续可只读验收类型命名和输出可读性。
