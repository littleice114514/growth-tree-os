function formatFileList(files) {
  if (files.length === 0) {
    return "- 无";
  }
  return files.map((file) => `- ${file.relativePath}`).join("\n");
}

function moduleLabel(moduleName) {
  if (moduleName === "time-debt") {
    return "Time Debt";
  }
  if (moduleName === "wealth") {
    return "Wealth";
  }
  return moduleName;
}

function agentLabel(agent) {
  if (agent === "codex") {
    return "Codex";
  }
  if (agent === "claude") {
    return "Claude";
  }
  return agent;
}

function handoffHint(state, agent, moduleName) {
  if (agent === "codex" && moduleName === "time-debt") {
    return state.files.codexTimeDebt.exists
      ? "已读取 `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`。"
      : "未找到 Time Debt 专用 handoff，先读 project-state 三件套。";
  }

  if (agent === "claude" && moduleName === "wealth") {
    return state.files.claudeWealth.exists
      ? "已读取 `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`。"
      : "未找到 Wealth 专用 handoff，先读 project-state 三件套。";
  }

  return "未找到专用 handoff，先读 project-state 三件套。";
}

function buildGoal(agent, moduleName) {
  if (agent === "codex" && moduleName === "time-debt") {
    return "继续推进 Time Debt 业务验收与必要的小步修复，保持与 Win 端 map-console 文件隔离。";
  }
  if (agent === "claude" && moduleName === "wealth") {
    return "继续推进 Wealth 业务体验与验收，保持与 Win 端 map-console 文件隔离。";
  }
  return `围绕 ${moduleLabel(moduleName)} 做本轮业务推进，先确认边界再实施。`;
}

function generateStatus(state) {
  const missingAgents = state.files.agents.exists ? "" : "\n- 注意：AGENTS.md 缺失。";

  return `# AI 活点地图状态

## Git

- 当前分支：${state.git.branch}
- 当前 commit：${state.git.commit}
- 工作区是否干净：${state.git.clean ? "是" : "否"}

## 已读取底座文件

${formatFileList(state.present)}

## 缺失底座文件

${formatFileList(state.missing)}${missingAgents}

## 当前地图位置

${state.summary.mapLocation}

## 当前项目主线

${state.summary.mainLine}

## 下一步入口

${state.summary.nextEntry}

## 风险提示

- 只读读取 project-state 和 handoff 白名单，不扫描完整 dev-log。
- 缺失文件已按“缺失”处理，未中断命令。
- Mac 端业务推进时不要修改 \`tools/ai-map-console/**\`。
- Win 端 map-console 推进时不要修改 Time Debt / Wealth 业务代码。`;
}

function generateTaskCard(state, options) {
  const agent = options.agent;
  const moduleName = options.module;
  const label = moduleLabel(moduleName);
  const owner = agentLabel(agent);
  const goal = buildGoal(agent, moduleName);

  return `# ${owner} 任务卡｜${label}

## 当前阶段

${state.summary.currentStage}

## 本轮唯一目标

${goal}

## 本轮不做

${state.summary.notDoing.map((item) => `- ${item}`).join("\n")}
- 不修改 \`tools/ai-map-console/**\`。
- 不重写 project-state 核心状态文件，除非任务明确要求。

## 默认使用的 skill / 流程

- 先做 skill 判断。
- 默认读取 project-state 三件套，不扫描完整历史日志。
- ${handoffHint(state, agent, moduleName)}

## 已读取底座

${formatFileList(state.present)}

## 允许修改范围

${state.summary.allowedScope.map((item) => `- ${item}`).join("\n")}

## 禁止修改范围

${state.summary.blockedScope.map((item) => `- ${item}`).join("\n")}
- \`tools/ai-map-console/**\`
- Win 端 handoff / dev-log 中与 map-console 相关的文件

## 实施方案

1. 先执行 \`git status --short\`、\`git branch --show-current\`、\`git rev-parse --short HEAD\`。
2. 读取 project-state 三件套和本模块 handoff；若 handoff 缺失，先按当前任务卡推进。
3. 只在 ${label} 相关业务边界内做最小改动。
4. 完成后运行对应验证，并记录结果。

## 验收标准

- 页面或业务行为符合本轮目标。
- 不产生 map-console 文件改动。
- 缺失 handoff 不导致开工中断。
- Git 状态能清楚区分本轮业务改动。

## 桌面端 / 手机端验收路径

- 桌面端：启动本项目后检查 ${label} 相关页面或预览入口。
- 手机端：如本轮涉及响应式体验，再检查窄屏视口；否则记录“本轮未涉及手机端”。

## 回归检查

- \`pnpm typecheck\`
- \`pnpm build\`
- 必要时运行 Electron / renderer smoke。

## 进度条

- [ ] 开工检查
- [ ] 读取底座
- [ ] 实施
- [ ] 验证
- [ ] 日志 / handoff
- [ ] commit / push

## 可检验信号

- 当前分支：${state.git.branch}
- 当前 commit：${state.git.commit}
- 最近日志：${state.summary.recentLog}
- 缺失底座文件数：${state.missing.length}`;
}

module.exports = {
  generateStatus,
  generateTaskCard
};
