# Life Tree 3D Roadmap

本文件定义 Life Vitality Tree 3D 从框架设计到写实生命树的路线图。

## M3D-0 Framework Design

当前阶段。

目标：

- 定义 3D 生长树概念；
- 定义数据契约草案；
- 定义生长规则；
- 定义时间线和快照；
- 定义渲染策略；
- 定义 Win / Mac 性能分层；
- 不写真实 3D 实现。

验收：

- `docs/life-tree-3d/` 文档完整；
- 明确数据层、规则层、快照层、渲染层、性能层；
- 不引入 3D 依赖；
- 不修改 UI 页面。

## M3D-1 Types and Rule Draft

目标：

- 从文档中提取最小正式 TypeScript 类型；
- 定义 `TreeSnapshot`、`GrowthEvent`、`GrowthRule` 的最小代码草案；
- 仍不接数据库；
- 仍不做 3D Canvas。

边界：

- 类型文件必须独立；
- 不能破坏现有 Life Vitality Tree 前端 mapper；
- 规则先使用 mock events 验证。

## M3D-2 No-3D Growth Simulator

目标：

- 不使用 3D；
- 用表格、JSON 或 2D debug panel 模拟事件到快照的变化；
- 验证规则权重、衰减、上限是否合理；
- 验证 daily / weekly / monthly snapshot 关系。

边界：

- 不做视觉最终效果；
- 不导入模型；
- 不改数据库 schema。

## M3D-3 Procedural 3D POC

目标：

- 创建可关闭的 3D POC；
- 程序化生成树干、枝干、叶子、果实和裂痕占位；
- 用 mock `TreeSnapshot` 驱动；
- 验证 Windows high 和 Mac low 的性能边界。

边界：

- 只做 POC；
- 不替换现有主页面；
- 不导入写实模型。

## M3D-4 3D Interaction Layer

目标：

- 增加视角切换、hover、点击详情；
- 与现有 Life Tree 语义保持一致；
- UI 控制层与渲染层拆分；
- 为 Mac 端体验优化留下文件边界。

边界：

- Windows 负责渲染和资源；
- Mac 可负责页面容器和交互体验；
- 双端不能同时改同一文件。

## M3D-5 Realistic Model Interface

目标：

- 定义 glb / Blender 资产命名；
- 定义 tree asset slots；
- 定义模型压缩、贴图大小和 fallback；
- 验证模块化资产替换程序化部件。

边界：

- 不做整棵不可拆的死模型；
- 资产必须能按树干、枝干、叶子、果实、裂痕、根系拆分；
- 渲染层仍只读 `TreeSnapshot`。

## M3D-6 Semi-Realistic Asset Replacement

目标：

- 用半写实模块资产替换部分程序化部件；
- 保持 Mac low profile 可用；
- 建立资产加载失败的 fallback；
- 记录性能指标。

边界：

- 不追求最终写实；
- 优先验证模块化替换链路。

## M3D-7 Realistic Vitality Tree Optimization

目标：

- 在 Windows high profile 上优化写实树；
- 完善树皮、裂痕、果实、根系、季节和光照；
- 为 Mac 提供 medium / low 质量版本；
- 完成长期可维护的 3D 生命树渲染架构。

边界：

- 写实只是一种 renderer mode；
- 业务规则仍归规则层；
- 快照仍是唯一渲染输入。

## 下一阶段建议

M3D-0 完成后，下一阶段建议进入 M3D-1：

- 只提取最小 TypeScript 类型；
- 建立 mock `GrowthEvent` 与 `TreeSnapshot` 样例；
- 不引入 3D 依赖；
- 不改主页面 UI；
- 为 M3D-2 的无 3D 生长模拟器准备数据。
