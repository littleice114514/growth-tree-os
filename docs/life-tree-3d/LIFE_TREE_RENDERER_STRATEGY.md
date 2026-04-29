# Life Tree Renderer Strategy

本文件定义 Life Vitality Tree 3D 的渲染策略。当前阶段只做架构设计，不安装 three / @react-three/fiber / drei，不写 3D Canvas。

## 1. 渲染层边界

渲染层只接收：

- `TreeSnapshot`
- `QualityProfile`
- `RendererMode`

渲染层不能直接读取复盘、财富、健康、时间负债或任务数据。业务数据必须先通过规则层生成快照。

## 2. Renderer 分级

M3D-0 不实现任何 renderer。本文件只定义未来分层和边界。

| Renderer | 目标 | 特征 | 使用阶段 |
| --- | --- | --- | --- |
| procedural renderer | 用程序生成树干、枝干、叶片和果实 | 无模型资产，参数驱动 | M3D-3 |
| low-poly renderer | 使用低面数模块资产替换程序形状 | 轻量、稳定、适合 Mac | M3D-4 / M3D-5 |
| semi-realistic renderer | 使用较细材质和模块化模型 | 更接近真实树，但仍可控 | M3D-6 |
| realistic renderer | 高质量树皮、叶片、果实、光照 | Windows high profile 优先 | M3D-7 |

## 3. 当前为什么只做 procedural

当前只设计 procedural renderer，原因：

- 数据契约和规则还未冻结；
- 程序化几何更适合验证树如何随数据变化；
- 不需要模型资产即可测试快照驱动；
- 可快速验证 Windows / Mac 性能边界；
- 避免写实资产过早绑定错误语义。

后续 M3D-3 才开始实现 procedural renderer。

## 4. 程序化渲染目标

M3D-3 的程序化 POC 应只回答：

- `TreeSnapshot` 是否能生成一棵可读的树；
- 枝干数量、叶子数量、果实数量是否可控；
- 裂痕和季节状态是否能通过参数表现；
- 同一份快照能否在 high / medium / low profile 下稳定显示。

## 5. 后期模型接入方式

后期 glb / Blender 资产必须模块化接入。

禁止方向：

- 只导入一整棵不可拆的写实树；
- 在模型内部写死人生模块含义；
- 让渲染层根据业务数据临时决定生长规则。

允许方向：

- 树干模块按年龄阶段和稳定度组合；
- 枝干模块按模块类型、粗细和长度组合；
- 叶片模块按状态和季节替换；
- 果实模块按成果类型和成熟度替换；
- 裂痕模块按 severity 和 healingProgress 贴附；
- 根系模块按深度和密度组合。

统一预留模型路径：

```text
public/models/life-tree/
├─ low/
├─ medium/
└─ high/
```

M3D-0 不创建上述目录，也不放入任何 glb / Blender / 贴图文件；这里只保留路径约定。

## 6. 业务数据绑定

3D 对象必须通过 `nodeId` 绑定业务数据。

原则：

- 每个可点击 3D 对象持有 `nodeId`、`snapshotId` 和可选 `sourceEventId`。
- 渲染层不能直接写业务逻辑。
- 渲染层不能直接判断复盘、财富、时间负债或健康含义。
- 点击、hover 和详情面板通过 `nodeId` 回到数据层查询解释。
- 同一个 `nodeId` 在 procedural、low-poly、semi-realistic 和 realistic 模式中应保持稳定。

## 7. Asset Slot 草案

```ts
interface TreeAssetSlots {
  trunk: 'procedural' | 'trunk_young_a.glb' | 'trunk_mature_a.glb'
  branch: 'procedural' | 'branch_low_a.glb' | 'branch_realistic_a.glb'
  leaf: 'procedural' | 'leaf_fresh_a.glb' | 'leaf_withered_a.glb'
  fruit: 'procedural' | 'fruit_default_a.glb' | 'fruit_gold_a.glb'
  scar: 'procedural' | 'scar_light_a.glb' | 'scar_healed_a.glb'
  root: 'procedural' | 'root_sparse_a.glb' | 'root_dense_a.glb'
  barkMaterial: 'procedural' | 'bark_low_a' | 'bark_medium_a' | 'bark_high_a'
  seasonMaterial: 'spring_a' | 'summer_a' | 'autumn_a' | 'winter_a'
}
```

此接口只是文档草案，不创建实际代码。

## 8. 渲染与交互关系

3D 渲染层负责画树，UI 控制层负责：

- 视角切换；
- 当前模块选择；
- 质量档位选择；
- 详情面板；
- fallback 提示。

Mac 后续可负责 UI 容器和交互体验；Windows 负责 3D 资源、渲染底座和性能验证。双方不能同时修改同一个组件文件。

## 9. 失败兜底

当 WebGL 初始化失败、设备性能不足或模型加载失败时：

1. 降级到 procedural low profile；
2. 再降级到 static 2D snapshot；
3. 显示可读的树状态摘要；
4. 保留同一份 `TreeSnapshot`，不丢失业务状态。
