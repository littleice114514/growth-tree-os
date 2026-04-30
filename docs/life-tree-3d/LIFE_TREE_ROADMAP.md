# Life Tree 3D Roadmap

本文件定义 Life Vitality Tree 3D 从框架设计到写实生命树的路线图。每个阶段都必须保持数据层、生长事件层、生长规则层、快照层、渲染层和性能层分离。

## M3D-0｜框架设计

阶段目标：

- 定义 3D 生长树概念、数据契约、生长规则、时间线、渲染策略和 Win / Mac 性能分层。

主要产物：

- `docs/life-tree-3d/` 7 个框架文档。
- Windows 独立 dev-log。

不做什么：

- 不写 Three.js / R3F / Blender / glb / 真实 3D Canvas。
- 不接数据库，不改主页面，不装依赖。

验收标准：

- 文档覆盖 `TreeSnapshot + GrowthEvent + GrowthRule` 关系。
- 明确写实模型是模块化资产。
- 明确 3D 不作为系统单点故障。

Win / Mac 分工：

- Windows 负责框架设计。
- Mac 不参与，只在后续拉取验收文档完整性。

## M3D-1｜类型与规则草案

阶段目标：

- 从文档提取最小 TypeScript 类型和 mock 规则草案。

主要产物：

- `TreeSnapshot`、`GrowthEvent`、`GrowthRule` 的最小类型文件。
- mock events、mock rules、mock snapshot 样例。
- 已落地 `app/renderer/src/features/life-tree-3d/contracts/` TypeScript contracts。
- 已新增 `mockTreeSnapshot`，包含根系、主干、8 个主枝、叶子、果实、裂痕、年轮、季节和质量档位提示。
- 已新增 `defaultGrowthRules`，覆盖 M3D-1 指定的成长事件和修复型负面事件表达。
- 下一步进入 M3D-2：无 3D 生长模拟器，用纯数据计算新旧快照差异。

不做什么：

- 不安装 3D 依赖。
- 不接真实数据库。
- 不替换现有 Life Vitality Tree 页面。

验收标准：

- 类型可通过 `pnpm typecheck`。
- mock 数据能表达旧快照 + 事件 + 规则 = 新快照。

Win / Mac 分工：

- Windows 负责类型与规则草案。
- Mac 可只读验收类型命名是否影响 UI 边界。

## M3D-2｜无 3D 生长模拟器

阶段目标：

- 不使用 3D，用纯数据模拟器验证生长规则。

主要产物：

- 已新增 `app/renderer/src/features/life-tree-3d/growth-engine/`。
- 已能用 `mockTreeSnapshot`、`mockGrowthEvents` 和 `defaultGrowthRules` 生成 `nextSnapshot`。
- 已能输出 `GrowthTransition`，包含枝干变化、叶子、果实、裂痕、生命力和季节变化。
- 已能输出 `GrowthDeltaSummary`，用于调试阶段的人类可读摘要。
- 已新增 `mockGrowthSimulationResult`，方便后续 M3D-3 读取模拟结果。

不做什么：

- 不写 3D Canvas。
- 不导入模型或贴图。
- 不做最终视觉效果。
- 不把生长判断写入 renderer。

验收标准：

- 能从 mock GrowthEvents 生成新 TreeSnapshot。
- 能解释每条变化来自哪些 GrowthRule。
- TypeScript 类型检查通过。
- 仍未安装 Three.js / React Three Fiber / Drei。

Win / Mac 分工：

- Windows 负责规则计算和模拟器。
- Mac 可在不改页面的前提下验收输出可读性。

## M3D-3｜程序化 3D POC

阶段目标：

- 首次实现 procedural 3D POC，用 mock `TreeSnapshot` 生成树。

主要产物：

- 已安装 `three`、`@react-three/fiber`、`@react-three/drei`，并使用 React 18 兼容版本。
- 已新增程序化 3D POC：`LifeTree3DPreview`、`LifeTreeCanvas`、`ProceduralTreeRenderer` 和布局转换层。
- 已能从 mock `TreeSnapshot` / `mockGrowthSimulationResult.nextSnapshot` 渲染基础树。
- 已支持旋转、缩放、点击节点调试详情和 ESC 取消选中。
- 已支持 low / medium / high 画质档位，默认不使用 high。
- 已保留 WebGL fallback，避免 3D 不可用时白屏。
- 下一步 M3D-4 进入 3D 交互层完善。

不做什么：

- 不导入写实模型。
- 不替换现有主页面。
- 不把业务逻辑写进 renderer。

验收标准：

- procedural 树能读 `TreeSnapshot`。
- Mac low profile 可降级。
- WebGL 失败有 fallback。
- `pnpm typecheck` 通过。
- 原有页面仍可访问，3D Preview 不作为默认首页。

Win / Mac 分工：

- Windows 负责 3D 渲染底座和性能测试。
- Mac 负责轻量预览和体验反馈，不共改同一文件。

## M3D-4｜3D 交互层

阶段目标：

- 增加视角切换、hover、click、详情面板和 `nodeId` 绑定。

主要产物：

- 3D 对象到业务节点的交互桥。
- UI 控制层与渲染层分离。

不做什么：

- 不做写实资产替换。
- 不把 UI 状态塞进 3D 资源层。

验收标准：

- 点击对象能通过 `nodeId` 找到对应快照对象。
- Mac low profile 可关闭重动画。

Win / Mac 分工：

- Windows 负责渲染对象和交互事件输出。
- Mac 负责 UI 容器、按钮、布局和用户体验。

## M3D-5｜写实模型接口

阶段目标：

- 定义 glb / Blender 资产接口、路径、命名和质量档。

主要产物：

- `public/models/life-tree/low|medium|high` 路径约定。
- tree asset slots。
- 模型加载失败 fallback 规则。

不做什么：

- 不做整棵不可拆的死模型。
- 不默认加载 high 资源。

验收标准：

- 树干、枝干、叶簇、果实、裂痕、树皮材质、季节材质均可模块化替换。
- 资源失败不影响 TreeSnapshot 展示。

Win / Mac 分工：

- Windows 负责模型接口、压缩和资源管线。
- Mac 验证 medium / low 资源不会破坏体验。

## M3D-6｜半写实资产替换

阶段目标：

- 用半写实模块资产替换部分 procedural 部件。

主要产物：

- 半写实树干、枝干、叶簇、果实或裂痕模块。
- low / medium / high 资源加载策略。

不做什么：

- 不追求最终写实。
- 不牺牲 Mac 默认稳定档。

验收标准：

- 模块资产可按 `TreeSnapshot` 状态替换。
- Mac medium / low 能稳定运行。

Win / Mac 分工：

- Windows 负责资产替换和性能记录。
- Mac 负责稳定性、交互和视觉一致性反馈。

## M3D-7｜写实生命树优化

阶段目标：

- 在 Windows high profile 上完善写实生命树，同时保留 Mac 可用降级。

主要产物：

- 写实树皮、裂痕、叶簇、果实、季节材质和光照策略。
- high profile 演示版本。
- medium / low fallback 版本。

不做什么：

- 不让 high profile 成为默认体验。
- 不让 3D 成为系统单点故障。
- 不让 renderer 直接处理业务逻辑。

验收标准：

- high profile 写实效果可演示。
- medium / low 仍可用。
- 同一份 `TreeSnapshot` 可驱动不同 rendererMode。

Win / Mac 分工：

- Windows 负责写实优化和重资源验证。
- Mac 负责默认体验、无独显稳定性和 UI 交互验收。

## 下一阶段建议

M3D-3 完成后，下一阶段进入 M3D-4：

- 增加 hover 高亮、视角预设、节点定位和更清晰的调试面板；
- 继续保持 3D renderer 只读取 `TreeSnapshot`，不读取 `GrowthEvent` / `GrowthRule`；
- 在 Mac low / medium 档做稳定性和交互验收；
- 不进入写实模型、Blender、glb / glTF 或贴图资源阶段。
