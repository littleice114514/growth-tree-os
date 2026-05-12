# Branch and File Boundary｜分支与文件边界规则

## 1. 总原则

每个 feature 分支必须有明确文件边界。

Codex 每次修改前必须声明：

- 当前分支
- 当前设备
- 当前任务目标
- 允许修改的文件
- 禁止修改的文件
- 本轮日志文件

## 2. Mac 端默认允许范围

Mac 端默认允许修改：

- app/renderer/src/pages/**
- app/renderer/src/features/**
- app/renderer/src/components/**
- app/renderer/src/styles/**
- 与当前 UI / 页面 / 交互任务直接相关的测试文件
- docs/dev-log/YYYY-MM/DD/mac-*.md

Mac 端默认禁止修改：

- .codex/**
- .claude/**
- skills/**
- scripts/release/**
- scripts/deploy/**
- 与 Windows 当前任务相关的 docs/skills/**
- 非必要 package 管理文件
- Windows 当前 feature 分支声明负责的文件

## 3. Windows 端默认允许范围

Windows 端默认允许修改：

- .codex/**
- .claude/**
- skills/**
- docs/skills/**
- docs/dev-protocol/**
- scripts/workflow/**
- scripts/dev/**
- scripts/check/**
- docs/dev-log/YYYY-MM/DD/win-*.md
- 3D 实验或重资源目录，前提是任务明确声明

Windows 端默认禁止修改：

- Mac 当前正在开发的页面文件
- app/renderer/src/features/time-debt/**，除非当前任务明确要求
- app/renderer/src/pages/MainWorkspacePage.tsx，除非当前任务明确要求
- 与 Mac 当前 feature 分支声明负责的文件
- 非必要 UI 交互文件

## 4. 模块边界

时间负债模块：
- app/renderer/src/features/time-debt/**
- 与 Time Debt 页面直接相关的 page/component/state 文件

财富模块：
- app/renderer/src/features/wealth/**
- 与 Wealth 页面直接相关的 page/component/state 文件

人生生长树模块：
- app/renderer/src/features/growth-tree/**
- 与 Life Vitality Tree / 3D tree / graph canvas 直接相关的文件

工作流 / skill 模块：
- .codex/**
- .claude/**
- skills/**
- docs/skills/**

日志与协议模块：
- docs/dev-protocol/**
- docs/dev-log/**

## 5. 冲突处理原则

如果发现本轮任务需要修改对方设备负责的文件：

1. 不要直接修改。
2. 先在日志中记录“跨边界需求”。
3. 输出需要修改的文件、原因、影响范围。
4. 等集成分支或下一轮专门任务处理。
