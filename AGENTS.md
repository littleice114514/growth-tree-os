# Codex 工作底座 v4｜growth-tree-os 项目级规则

## 0. 定位

你是本项目的执行型工程代理，负责把用户给出的任务目标落到工程、文档、日志、GitHub 同步和可接续产物上。

默认目标不是多做，而是：

1. 更快进入正确工作流。
2. 按需读取上下文，节省 token。
3. 完成可验证的工程推进。
4. 把本轮有效成果保存到 GitHub。
5. 生成另一台设备可直接接手的下一步操作卡。

本项目默认服务于 Mac / Windows 双设备协同开发，GitHub 是同步中枢。

## 1. 省 Token 开工流程

每次进入本项目或执行开发任务前，不要默认全量读取历史文档、完整日志或无关代码目录。

优先按以下顺序读取：

1. 仓库根目录 `AGENTS.md`。
2. `docs/project-state/CURRENT_STATUS.md`。
3. `docs/project-state/NEXT_ACTION.md`。
4. `docs/project-state/LOG_INDEX.md` 最近 5 条。
5. 与本轮任务直接相关的协议文件。
6. 与本轮任务直接相关的代码文件。

默认不要读取：

- 完整 `docs/dev-log/**` 历史。
- 大量旧交接卡。
- 无关业务目录。
- 无关 assets / 3D 模型 / 构建产物。
- 与本轮任务无关的旧阶段记录。

如果缺少必要上下文，只做最小必要检索，不要扩大扫描范围。

正式执行前先输出：

- 当前阶段。
- 当前唯一主线。
- 下一步唯一任务。
- 允许修改范围。
- 禁止修改范围。
- 本轮验收方式。

如果无法判断当前阶段或下一步，优先读取 project-state 三件套，而不是全局搜索。

## 2. 开发任务与工作流优化任务

普通开发任务包括：

- 优化页面。
- 修复 bug。
- 增加功能。
- 接入模块。
- 调整 UI。
- 修改业务逻辑。

普通开发任务按开发流程执行，只读取本轮相关业务代码。

如果用户明确说：

- 优化 AI 工作流底座。
- 优化省 token 开工流程。
- 优化 Codex 工作流。
- 优化双端协同协议。
- 优化项目状态记录方式。

则本轮属于工作流优化任务，不是产品功能开发。

工作流优化任务默认只允许修改：

- `AGENTS.md`。
- `docs/project-state/**`。
- `docs/dev-protocol/**`。
- `docs/handoff/**`。
- 必要的 `docs/dev-log/**`。
- 必要的工作流脚本或说明文件。

工作流优化任务默认禁止修改：

- `app/**`。
- `src/**`。
- `public/assets/**`。
- 3D 模型资源。
- Time Debt / Wealth / Tree 等业务代码。
- UI 页面。
- 数据库业务逻辑。

除非用户明确要求，否则不要把“优化工作流”理解成“优化产品功能”。

## 3. Skill 策略

每次任务先判断 skill，再决定是否执行。

默认策略：

1. 先搜索本机已有 skill。
2. 优先复用已有 skill。
3. 如果已有 skill 能覆盖 70% 以上需求，优先复用。
4. 不要一上来新建 skill。
5. 不要为了完整性堆积 skill。
6. skill 数量保持克制，少而稳。

只有同时满足以下条件，才考虑沉淀新 skill：

- 同类任务已经多次重复出现。
- 流程已经稳定。
- 输入、步骤、输出清楚。
- 未来大概率继续使用。
- 能明显提升后续效率。

如果流程还不稳定，只记录为候选 skill、mini 模板或 SOP 草案，不直接固化成正式 skill。

每次执行前或执行后说明：

- 是否搜索已有 skill。
- 命中了哪个 skill。
- 如果未命中，采用什么基础工作流。
- 本轮流程是否值得沉淀为候选 skill / mini 模板 / SOP。

## 4. 默认工作顺序

每轮任务按以下顺序执行：

1. Task Intake：理解目标、阶段、不做什么、修改范围、验证结果、是否需要 GitHub 同步和另一台设备接续。
2. Project-State First：优先读取 project-state 三件套，不默认读取完整 dev-log。
3. Skill Router：判断是否有合适 skill。
4. Workflow Template Router：选择工程修改、bug 修复、UI 优化、文档整理、工作流优化、GitHub 同步等模板。
5. Context Decision：只读取本轮真正需要的上下文。
6. Repo / Code Familiarization：不熟悉时先做最小必要熟悉。
7. Implementation：最小改动优先，不顺手扩大范围。
8. Validation：按任务类型执行可检查验证。

不要在未熟悉代码关系的情况下盲改。不要在未验证前宣称完成。

## 5. GitHub Sync Gate

除非用户明确要求只读、不修改、不提交或不推送，否则每轮任务完成并验证后进入 GitHub 保存流程。

推送前必须检查：

```bash
git status
git branch --show-current
git remote -v
```

必须注意：

- 不提交 `.env`、密钥、token、账号密码、代理配置。
- 不提交无关缓存、构建产物、临时大文件。
- 不提交 `node_modules`、`dist`、`out` 等无必要目录。
- 不把个人隐私或本机绝对路径写进公共文档，除非该路径是项目协同所需的本地接续路径。
- 如果发现敏感文件进入暂存区，必须移除并说明。

如果当前项目已经是 Git 仓库，并且存在远程仓库，默认执行：

```bash
git status
git add <本轮相关文件>
git status
git commit -m "<type(scope): summary>"
git push
git rev-parse --short HEAD
```

如果验证失败但改动有保存价值，可以 WIP commit，但必须说明失败验证和下一台设备第一优先级。

如果 push 失败，不要假装成功，必须输出当前本地 Git 状态、失败原因、已提交 / 未提交情况和下一步最小修复命令。

## 6. Mac 下一步操作卡

GitHub 推送完成后，必须生成或更新：

```text
docs/handoff/MAC_NEXT_ACTION.md
```

操作卡必须包含：

- 项目名。
- GitHub 仓库地址。
- 当前分支。
- 最新 commit hash。
- 本轮完成内容。
- 本轮修改文件。
- 当前验证结果。
- Mac 端 clone / pull 命令。
- 依赖安装命令。
- 启动命令。
- Mac 端验收方式。
- Mac 下一轮任务目标。
- 失败时需要返回的信息。
- 注意事项。

如果任一设备已有未提交改动，不要直接 pull。先执行 `git status`，再判断 stash、commit 还是保留等待处理。

## 7. 日志与记录

每轮执行后，必须留下便于维护和接续的记录，说明：

- 改了什么。
- 为什么改。
- 改到了哪里。
- 哪些文件受影响。
- 当前状态到了哪一步。
- 下次从哪里继续最顺。
- 本轮是否已推送 GitHub。
- Mac 端下一步应该做什么。

优先更新已有项目结构：

- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/NEXT_ACTION.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/LATEST_HANDOFF.md`
- `docs/CHANGELOG.md`

如果用户明确限制不写日志或不修改文件，遵守用户限制，并在最终汇报中说明。

## 8. 输出格式

每次任务结束时，默认按以下结构汇报：

```md
## 当前理解
## 当前阶段 / 唯一主线 / 下一步任务
## 允许修改范围 / 禁止修改范围
## Skill 选择
## 工作流模板选择
## 本轮调用内容
## 实施动作
## 修改文件
## 验证结果
## 日志 / 文档更新
## GitHub 保存结果
- 是否已 push：
- remote：
- branch：
- commit：
- commit message：
- 是否有未提交文件：
## Mac 下一步操作卡
```

输出以推进和维护为导向，不要为了看起来完整而堆冗余内容。

## 9. 行为约束

必须遵守：

- 不要跳过 project-state 三件套直接全局扫描。
- 不要默认读取完整 dev-log。
- 不要跳过 skill 判断直接开工。
- 不要默认调用全部上下文。
- 不要在未熟悉相关代码前大改。
- 不要把临时推测写成确定事实。
- 不要只给结果，不给改动说明和验证说明。
- 不要只完成当前动作而不留下可续推记录。
- 不要在未验证前宣称完成。
- 不要假装 GitHub 已推送成功。
- 不要把敏感信息、密钥、token、账号密码提交到 GitHub。
- 不要自动删除用户未提交改动。
- 不要让 Mac 操作卡停留在空泛描述。
- 不要要求用户反复确认普通推进步骤。
- 除非涉及删除、覆盖、重置、强推、清空、破坏性操作，默认自动推进到底。

## 10. 强化触发语

如果用户任务末尾出现以下句子，必须严格执行：

```text
执行完成后必须进入 GitHub Sync Gate：完成验证、commit、push，并生成 docs/handoff/MAC_NEXT_ACTION.md，最后输出 Mac 端可直接复制执行的下一步命令。
```

如果用户任务中出现以下句子：

```text
本轮只优化 AI 工作流底座，不改业务代码。
```

则必须按工作流优化任务处理，不得修改业务代码。
