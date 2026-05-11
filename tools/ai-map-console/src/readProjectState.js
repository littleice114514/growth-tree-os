const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { projectFiles, repoRoot, resolveProjectPath } = require("./paths");

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (error) {
    return "";
  }
}

function tailText(text, lineCount) {
  const lines = text.split(/\r?\n/);
  return lines.slice(Math.max(0, lines.length - lineCount)).join("\n");
}

function readAllowedFile(fileConfig) {
  const absolutePath = resolveProjectPath(fileConfig.relativePath);

  if (!fs.existsSync(absolutePath)) {
    return {
      label: fileConfig.label,
      relativePath: fileConfig.relativePath,
      exists: false,
      content: ""
    };
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  return {
    label: fileConfig.label,
    relativePath: fileConfig.relativePath,
    exists: true,
    content: fileConfig.tailLines ? tailText(raw, fileConfig.tailLines) : raw
  };
}

function firstMatchingLine(text, patterns) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const pattern of patterns) {
    const matched = lines.find((line) => pattern.test(line));
    if (matched) {
      return matched.replace(/^[-*\d.\s]+/, "").trim();
    }
  }
  return "";
}

function sectionText(text, headingPattern) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (start === -1) {
    return "";
  }

  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^#{1,3}\s+/.test(line.trim())) {
      break;
    }
    if (line.trim()) {
      collected.push(line.trim());
    }
    if (collected.length >= 8) {
      break;
    }
  }

  return collected.join("\n");
}

function compactList(text, fallback) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^([-*]\s+|\d+\.\s+)/.test(line))
    .map((line) => line.replace(/^([-*]\s+|\d+\.\s+)/, "").trim())
    .filter(Boolean);

  return lines.length > 0 ? lines.slice(0, 6) : fallback;
}

function summarize(files) {
  const currentStatus = files.currentStatus.content;
  const nextAction = files.nextAction.content;
  const logIndex = files.logIndex.content;
  const mapStatus = files.mapStatus.content;

  return {
    currentStage:
      firstMatchingLine(currentStatus, [/^M-[A-Z]/, /当前阶段/, /阶段/]) ||
      sectionText(currentStatus, /^##\s+\d+\.\s*当前阶段/) ||
      "未从底座中识别",
    mainLine:
      sectionText(currentStatus, /^##\s+\d+\.\s*当前唯一主线/) ||
      firstMatchingLine(currentStatus, [/当前唯一主线/, /主线/]) ||
      "未从底座中识别",
    nextEntry:
      sectionText(nextAction, /^##\s+\d+\.\s*本轮唯一目标/) ||
      sectionText(currentStatus, /^##\s+\d+\.\s*下一步唯一任务/) ||
      "未从底座中识别",
    notDoing: compactList(
      sectionText(nextAction, /^##\s+\d+\.\s*本轮不做/),
      ["不修改业务代码", "不改 Time Debt / Wealth", "不改 Electron 页面"]
    ),
    allowedScope: compactList(
      sectionText(nextAction, /^##\s+\d+\.\s*允许修改范围/) ||
        sectionText(currentStatus, /^##\s+\d+\.\s*当前允许修改范围/),
      ["以任务卡声明的文件边界为准"]
    ),
    blockedScope: compactList(
      sectionText(nextAction, /^##\s+\d+\.\s*禁止修改范围/) ||
        sectionText(currentStatus, /^##\s+\d+\.\s*当前禁止修改范围/),
      ["app/renderer/**", "业务功能", "3D 资源"]
    ),
    mapLocation: mapStatus
      ? sectionText(mapStatus, /^##\s+\d*\.*\s*当前地图位置/) || "已读取 MAP_STATUS.md，未识别到位置标题"
      : "MAP_STATUS.md 缺失，暂以 project-state 三件套作为地图入口",
    recentLog:
      firstMatchingLine(logIndex, [/^##\s+\d{4}-\d{2}-\d{2}/]) ||
      "未识别最近日志索引"
  };
}

function readProjectState() {
  const files = Object.fromEntries(
    Object.entries(projectFiles).map(([key, config]) => [key, readAllowedFile(config)])
  );

  const present = Object.values(files).filter((file) => file.exists);
  const missing = Object.values(files).filter((file) => !file.exists);
  const statusShort = runGit(["status", "--short"]);

  return {
    git: {
      branch: runGit(["branch", "--show-current"]) || "未知",
      commit: runGit(["rev-parse", "--short", "HEAD"]) || "未知",
      clean: statusShort.length === 0,
      statusShort
    },
    files,
    present,
    missing,
    summary: summarize(files)
  };
}

module.exports = {
  readProjectState
};
