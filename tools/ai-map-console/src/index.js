#!/usr/bin/env node

const { generateStatus, generateTaskCard } = require("./generateTaskCard");
const { readProjectState } = require("./readProjectState");

const VALID_AGENTS = new Set(["codex", "claude"]);
const VALID_MODULES = new Set(["time-debt", "wealth"]);

function usage() {
  return `用法：
  node tools/ai-map-console/src/index.js status
  node tools/ai-map-console/src/index.js task-card --agent codex --module time-debt
  node tools/ai-map-console/src/index.js task-card --agent claude --module wealth`;
}

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const item = args[index];
    if (item === "--agent") {
      options.agent = args[index + 1];
      index += 1;
    } else if (item === "--module") {
      options.module = args[index + 1];
      index += 1;
    } else {
      options.unknown = item;
    }
  }
  return options;
}

function main(argv) {
  const [command, ...args] = argv;

  if (command === "status") {
    console.log(generateStatus(readProjectState()));
    return 0;
  }

  if (command === "task-card") {
    const options = parseOptions(args);
    if (
      options.unknown ||
      !VALID_AGENTS.has(options.agent) ||
      !VALID_MODULES.has(options.module)
    ) {
      console.error("参数无效。\n\n" + usage());
      return 1;
    }

    console.log(generateTaskCard(readProjectState(), options));
    return 0;
  }

  console.error("未知命令。\n\n" + usage());
  return 1;
}

process.exitCode = main(process.argv.slice(2));
