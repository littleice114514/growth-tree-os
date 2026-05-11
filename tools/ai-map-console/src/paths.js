const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..");

const LOG_INDEX_TAIL_LINES = 80;

const projectFiles = {
  agents: {
    label: "AGENTS.md",
    relativePath: "AGENTS.md"
  },
  currentStatus: {
    label: "CURRENT_STATUS.md",
    relativePath: "docs/project-state/CURRENT_STATUS.md"
  },
  nextAction: {
    label: "NEXT_ACTION.md",
    relativePath: "docs/project-state/NEXT_ACTION.md"
  },
  logIndex: {
    label: "LOG_INDEX.md 最近片段",
    relativePath: "docs/project-state/LOG_INDEX.md",
    tailLines: LOG_INDEX_TAIL_LINES
  },
  mapStatus: {
    label: "MAP_STATUS.md",
    relativePath: "docs/project-map/MAP_STATUS.md"
  },
  codexTimeDebt: {
    label: "CODEX_TIME_DEBT_NEXT_ACTION.md",
    relativePath: "docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md"
  },
  claudeWealth: {
    label: "CLAUDE_WEALTH_NEXT_ACTION.md",
    relativePath: "docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md"
  }
};

function resolveProjectPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

module.exports = {
  LOG_INDEX_TAIL_LINES,
  projectFiles,
  repoRoot,
  resolveProjectPath
};
