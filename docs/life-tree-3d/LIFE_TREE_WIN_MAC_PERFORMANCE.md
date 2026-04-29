# Life Tree Win / Mac Performance

本文件定义 Life Vitality Tree 3D 的跨平台性能边界。Windows 可承担 high profile 和重资源实验，Mac 需要稳定 medium / low profile 和 fallback。

## 1. 性能分层目标

同一份 `TreeSnapshot` 必须能在不同设备上用不同质量显示：

- Windows high profile：用于 3D 实验、写实资产验证、重资源测试。
- Mac medium profile：用于日常体验、轻量交互和稳定验收。
- Mac low profile：用于无独显、低功耗或 WebGL 不稳定环境。
- fallback 2D：用于 WebGL 初始化失败或性能不足时展示状态。

## 2. Quality Profile 草案

| Profile | Renderer | 叶子上限 | 枝干上限 | 果实上限 | 动画对象上限 | 贴图上限 | 阴影 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Windows high | realistic / semi-realistic | 1200 | 180 | 80 | 300 | 2048 | soft |
| Desktop medium | low-poly / procedural | 500 | 100 | 40 | 120 | 1024 | blob |
| Mac low | procedural | 180 | 60 | 24 | 40 | 512 | off |
| Fallback 2D | static 2d | 80 visual tokens | 30 visual tokens | 12 visual tokens | 0 | none | off |

以上数值是 M3D-0 草案。M3D-3 POC 后必须根据真实 FPS 和内存占用调整。

## 3. Windows High Profile

Windows high profile 用于：

- 程序化 3D POC；
- 模块化 glb / glTF 资产验证；
- Blender 导出和模型压缩实验；
- 高叶片数量和复杂阴影测试；
- 写实材质、树皮、裂痕、根系资源测试。

Windows high profile 允许视觉更复杂，但不能成为唯一可运行模式。

## 4. Mac Medium / Low Profile

Mac 默认不承担重资源压力。

Mac medium profile：

- 低模或程序化树；
- 少量动画；
- 贴图最大 1024；
- 使用 blob shadow 或简化阴影；
- 优先保证交互稳定。

Mac low profile：

- 程序化低复杂度；
- 限制叶片数量；
- 关闭实时阴影和后处理；
- 只保留必要 hover / click；
- 必须能稳定展示树状态。

## 5. 降级策略

降级顺序：

```text
realistic -> semi_realistic -> low_poly -> procedural -> static_2d
```

触发条件：

- WebGL 初始化失败；
- 首屏超过可接受时间；
- FPS 长时间过低；
- 模型加载失败；
- 内存占用过高；
- Mac 端用户手动选择低画质。

降级不能改变业务数据，只改变渲染质量。

## 6. 动画策略

动画必须受限：

- 不对每片叶子都做独立复杂动画；
- 低档位只保留树冠整体轻微摆动；
- 裂痕、果实、年轮默认静态；
- 生长动画应由 snapshot diff 触发，而不是持续计算业务逻辑；
- Mac low profile 可以关闭所有持续动画。

## 7. 贴图与模型策略

- M3D-0 / M3D-1 不新增贴图和模型；
- M3D-3 仍优先程序化；
- M3D-5 才开始定义模型资产接口；
- 所有写实资产必须可替换、可降级、可跳过；
- 不允许单个大模型阻塞整棵树渲染。

## 8. WebGL 失败兜底

WebGL 初始化失败时：

1. 记录失败原因；
2. 切到 `fallback_2d`；
3. 展示当前 `TreeSnapshot` 的核心摘要；
4. 提示当前使用低负载模式；
5. 不要求用户理解 3D 技术细节；
6. 不影响后续快照生成和数据记录。

## 9. 验收指标草案

M3D-3 之后建议记录：

- 首屏渲染耗时；
- 稳定 FPS；
- 内存峰值；
- 模型加载耗时；
- 降级触发次数；
- Mac low profile 是否能持续运行；
- fallback 2D 是否仍能表达树状态。
