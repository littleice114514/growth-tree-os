# P2_VISUAL_UPGRADE_LOG

## 2026-04-24｜P2 视觉升级第一轮

本轮目标：在不改 `db / store / ipc / schema` 的前提下，把真实成长树主工作区推进为 Obsidian inspired 暗色图谱工作台。

## 改动范围

- 主工作区三栏仍保留，列宽调整为左侧轻导航、中间主画布、右侧 inspector。
- 顶部工具栏改为更紧凑的桌面导航，保留成长树、提醒、周回看、图谱 V1、搜索和新建今日复盘入口。
- 搜索结果改为左上角浮层，继续复用现有真实搜索结果和节点跳转链路。
- 成长树画布弱化卡片边框，节点改为小型图谱节点，连线默认低噪声可见。
- 选中 / 聚焦 / hover 节点最亮，一阶邻居增强，远端节点和连线弱化。
- 左侧栏从卡片堆叠调整为轻导航列表。
- 右侧节点详情从后台信息面板调整为 inspector 风格属性面板。

## 验证口径

- 自动验证：`pnpm smoke`。
- 手动验证：启动 `pnpm dev`，检查三栏结构、搜索浮层、节点跳转、详情展示、提醒、周回看链路。

## 下一轮候选

- 更细腻的 hover 状态与键盘导航。
- 图谱节点层级、缩放比例和 mini map 细节再调。
- 如果恢复 Obsidian 图谱支线，先做真实数据映射，再做高保真交互。

## 2026-04-24｜P2 交互收口第一轮

本轮目标：基于暗色图谱工作台版本，补齐 theme toggle、Esc 退出查看态、左侧最近复盘滚动和主画布滚轮/拖拽交互。

## 改动范围

- 新增 renderer-only 深浅色主题，默认 dark，使用 `localStorage` 持久化到 `growth-tree-os.theme`。
- 主题通过 `data-theme` 和 CSS token 驱动，不改 `db / ipc / schema`。
- 新增 Esc 行为：搜索浮层打开时优先关闭搜索；否则退出节点/复盘查看态并回到成长树观察态。
- 左侧最近复盘改为独立滚动区，一级主线与 Data Root 不再挤压复盘列表。
- 成长树主画布改为普通滚轮缩放、鼠标拖拽平移，保留节点点击、hover、搜索聚焦和 minimap/controls。

## 验证口径

- 自动验证：`pnpm smoke`。
- 手动验证：切换 dark/light，检查搜索 Esc、详情 Esc、复盘列表滚动、画布滚轮缩放与拖拽平移。

## 下一轮候选

- 为 theme token 继续覆盖 Obsidian mock 支线的非主线组件。
- 进一步打磨 light 主题下的图谱节点状态色和面板分隔线。

## 2026-04-24｜Light 主题真实生效修复

本轮目标：修复 theme toggle 切到 Light 后界面仍基本发黑的问题，只收口主题系统，不新增功能、不改 `db / ipc / schema`。

## 根因判断

- `ThemeProvider` 已经把 `data-theme="dark|light"` 挂到 `document.documentElement`，按钮状态和持久化链路本身可用。
- 问题主要来自组件仍大量使用暗色结构写法，例如透明白叠层、`base-950` 暗底、硬编码 `rgba` 和 TreeCanvas 内部 JS palette。
- Tailwind 基础色变量化不足以接管整套界面；需要 app、panel、input、graph、node、edge、inspector 等语义 token。

## 改动范围

- 在全局样式中补齐 dark/light 语义 token：背景、面板、文字、输入、按钮、图谱背景、节点、连线、inspector、overlay、minimap、controls。
- `ShellCard`、顶部工具栏、搜索浮层、左侧复盘栏、节点详情、复盘详情改用语义 token。
- TreeCanvas 节点、连线、hover card、画布标题浮层、MiniMap、Background 全部改为读取 CSS variable token。
- `TreeCanvas` 保留 `themeMode` 依赖，主题切换时会触发节点/边配置重算；CSS variables 也会让 React Flow 附属 UI 立即换色。

## 验证口径

- 自动验证：`pnpm smoke`。
- 手动验证：切换 Light/Dark 后检查顶部、左栏、右侧、搜索框/浮层、主画布、节点/连线、小地图、缩放控件是否真实换色。

## 下一轮候选

- 继续覆盖非主工作区的旧暗色类，例如抽取抽屉、提醒、周回看、暂停中的 Obsidian mock 支线。
- 在真实 Light 使用反馈后微调节点状态色、连线弱化比例和远端节点 opacity。
