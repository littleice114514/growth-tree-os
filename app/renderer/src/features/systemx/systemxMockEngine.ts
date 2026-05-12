import type { SystemXAnalysis, SystemXInput, SystemXInputType, SystemXSystemTag } from './types'

type AnalysisPreset = {
  summaryPrefix: string
  facts: string[]
  patterns: string[]
  principle: {
    title: string
    statement: string
    triggerCondition: string
    useCase: string
    counterExample: string
    verificationMethod: string
  }
  action: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    effort: '5min' | '15min' | '30min' | 'deep_work'
    evidence: string
  }
  risks: string[]
  feedbackRule: string
  systemTags: SystemXSystemTag[]
}

const presets: Record<SystemXInputType, AnalysisPreset> = {
  decision: {
    summaryPrefix: '这条决策需要先明确判断依据、预期收益、机会成本和暂停条件。',
    facts: ['已经出现一个需要选择的方向或承诺。', '当前输入包含对收益、成本或不确定性的判断线索。'],
    patterns: ['容易在信息不足时提前投入深水区。', '需要用一个短周期验证来替代长周期想象。'],
    principle: {
      title: '高成本决策先设暂停条件',
      statement: '当决策会占用连续时间、金钱或注意力时，先写出暂停条件再开始执行。',
      triggerCondition: '需要投入超过一天、超过预算或影响既有主线时。',
      useCase: '项目选择、采购、合作、职业路线判断。',
      counterExample: '低成本试错、当天可完成的小动作不需要复杂门禁。',
      verificationMethod: '在 7 天内检查收益证据和暂停条件是否被触发。'
    },
    action: {
      title: '写下 7 天验证标准',
      description: '列出预期收益、机会成本、最晚复盘时间和必须暂停的信号。',
      priority: 'high',
      effort: '15min',
      evidence: '输入中已经出现决策判断，需要转成可验证标准。'
    },
    risks: ['如果没有验证时间点，决策会变成持续消耗。'],
    feedbackRule: '下一次复盘时只问：这件事是否产生了可观察收益，是否触发暂停条件。',
    systemTags: ['project_development', 'time_debt']
  },
  daily_reflection: {
    summaryPrefix: '这条反思适合提炼今日事实、状态波动、行为模式和明日最小行动。',
    facts: ['今天已经产生可记录的状态变化。', '输入中包含情绪、行动或节奏的反馈。'],
    patterns: ['状态波动会影响任务选择质量。', '如果不收束成明日动作，反思容易停留在描述层。'],
    principle: {
      title: '反思必须落到明日一个动作',
      statement: '每日反思的价值不在完整记录，而在提炼下一次可执行的最小修正。',
      triggerCondition: '当天出现疲惫、分心、推进卡顿或明显状态波动时。',
      useCase: '日终复盘、节奏修正、习惯维护。',
      counterExample: '纯粹情绪释放时，可以先表达，不急着结构化。',
      verificationMethod: '明天结束前确认这个动作是否真的被执行。'
    },
    action: {
      title: '选一个明日最小行动',
      description: '把反思压缩成一个 15 分钟内可开始的动作。',
      priority: 'medium',
      effort: '15min',
      evidence: '反思内容需要从状态描述进入执行闭环。'
    },
    risks: ['反思过长但没有动作，会让系统记录变成情绪堆积。'],
    feedbackRule: '明天只验证一个问题：今天提炼的最小行动有没有发生。',
    systemTags: ['life_review', 'health']
  },
  project_log: {
    summaryPrefix: '这条项目日志应该被整理成当前进度、阻塞点、下一步验收和主线偏离检查。',
    facts: ['项目已经产生新的推进或阻塞信号。', '输入中包含当前状态和下一步线索。'],
    patterns: ['项目推进容易混合“已完成”和“还想做”。', '下一步如果没有验收口径，任务会继续扩散。'],
    principle: {
      title: '项目日志必须带验收点',
      statement: '每次项目记录都要留下下一步可以验证的具体结果。',
      triggerCondition: '完成一个子阶段、遇到阻塞或准备切换上下文时。',
      useCase: '功能开发、文档整理、跨设备交接。',
      counterExample: '纯灵感草稿可以先进入想法池，不必马上验收。',
      verificationMethod: '下一轮开工先检查日志里的验收点是否仍然成立。'
    },
    action: {
      title: '定义下一步验收信号',
      description: '写出下一轮打开项目后第一条要验证的命令、页面或文件。',
      priority: 'high',
      effort: '15min',
      evidence: '项目日志需要为接续降低重启成本。'
    },
    risks: ['如果继续扩展范围，项目会偏离当前主线。'],
    feedbackRule: '下次开工先核对：当前动作是否服务于日志中的唯一下一步。',
    systemTags: ['project_development', 'ai_workflow']
  },
  wealth_judgement: {
    summaryPrefix: '这条财富判断需要拆成成本、收益、冲动程度、预算匹配和复盘条件。',
    facts: ['输入涉及资源分配或消费收益判断。', '当前判断需要区分真实收益和即时冲动。'],
    patterns: ['财富判断容易被短期情绪放大。', '缺少预算边界时，小额决策会累积成固定流血。'],
    principle: {
      title: '财富动作先过预算和复盘条件',
      statement: '任何会形成持续成本的动作，都必须同时写出预算来源和复盘条件。',
      triggerCondition: '涉及订阅、设备、课程、工具或投资投入时。',
      useCase: '消费、订阅、投资、工具采购。',
      counterExample: '一次性低额且已在预算内的必要支出可以直接记录。',
      verificationMethod: '在账期结束时确认收益是否覆盖成本。'
    },
    action: {
      title: '标记预算来源',
      description: '写清楚这笔投入来自哪个预算，以及什么时候复盘是否继续。',
      priority: 'high',
      effort: '5min',
      evidence: '财富判断需要先防止冲动扩张。'
    },
    risks: ['没有暂停条件的支出会变成隐性时间负债和现金流压力。'],
    feedbackRule: '下一次只验证：实际使用频率和收益是否达到继续持有标准。',
    systemTags: ['wealth', 'time_debt']
  },
  study_log: {
    summaryPrefix: '这条学习记录适合拆出学习投入、中断原因、复习动作和最小训练任务。',
    facts: ['已经产生一段学习输入或训练记录。', '内容中可以提取复习和迁移线索。'],
    patterns: ['学习容易停在输入层，没有形成复现动作。', '中断原因如果不记录，会在下一轮重复出现。'],
    principle: {
      title: '学习记录必须产生训练动作',
      statement: '学习的最小闭环是复述、应用或练习，而不是只保存材料。',
      triggerCondition: '阅读、课程、代码学习或概念整理之后。',
      useCase: '技能学习、论文阅读、工程复盘。',
      counterExample: '快速查资料解决单点问题时，只需保存结论。',
      verificationMethod: '24 小时内完成一次不看原文的复述或应用。'
    },
    action: {
      title: '安排一次最小复述',
      description: '用 15 分钟写出这次学习最重要的 3 个可复用点。',
      priority: 'medium',
      effort: '15min',
      evidence: '学习记录需要进入复习闭环。'
    },
    risks: ['只收藏不训练，会制造掌握错觉。'],
    feedbackRule: '下一次验证：是否能不看原文说出一个可迁移原则。',
    systemTags: ['study', 'life_review']
  },
  flash_idea: {
    summaryPrefix: '这条灵感需要判断想法价值、是否进入项目池、是否值得今天做和最小验证方式。',
    facts: ['出现一个新的想法入口。', '当前想法还没有被拆成项目、任务或搁置项。'],
    patterns: ['灵感容易伪装成紧急任务。', '如果马上开工，可能打断更重要的主线。'],
    principle: {
      title: '灵感先入池再验证',
      statement: '新想法先保存价值和验证方式，除非它能在今天 15 分钟内完成验证。',
      triggerCondition: '突然想到新功能、新内容、新项目或新工具时。',
      useCase: '产品想法、内容主题、自动化点子。',
      counterExample: '修复当前任务的直接 blocker 可以立即处理。',
      verificationMethod: '48 小时后检查它是否仍然值得进入项目池。'
    },
    action: {
      title: '写一个 15 分钟验证动作',
      description: '定义这个想法最小可验证证据，不立即扩大成项目。',
      priority: 'medium',
      effort: '15min',
      evidence: '灵感需要被保护，也需要被约束。'
    },
    risks: ['立即追逐新想法会稀释当前主线注意力。'],
    feedbackRule: '下一次检查：这个想法是否仍有价值，还是只是当时的新鲜感。',
    systemTags: ['content_creation', 'project_development']
  },
  reading_note: {
    summaryPrefix: '这条阅读摘录适合提炼观点、可迁移原则、和当前系统的关系以及后续行动。',
    facts: ['输入包含外部观点或摘录。', '摘录中存在可迁移到个人系统的规则线索。'],
    patterns: ['阅读摘录如果不连接当前系统，很快会变成孤立材料。', '观点需要转成一个行为或判断规则才会被复用。'],
    principle: {
      title: '摘录必须连接一个现有系统',
      statement: '每条重要摘录至少连接到一个当前模块、一个原则或一个行动候选。',
      triggerCondition: '读到让人停顿、认同、反驳或想应用的内容时。',
      useCase: '书摘、文章笔记、课程观点。',
      counterExample: '纯资料归档可以先只存出处和关键词。',
      verificationMethod: '一周内检查这条摘录是否影响过一次判断或行动。'
    },
    action: {
      title: '绑定一个系统标签',
      description: '把摘录连接到 Time Debt、Wealth、学习或项目开发中的一个标签。',
      priority: 'low',
      effort: '5min',
      evidence: '阅读摘录需要进入系统关系网。'
    },
    risks: ['没有迁移动作的摘录会堆积成信息噪音。'],
    feedbackRule: '下次回看只问：这条摘录是否改变过一个判断。',
    systemTags: ['study', 'life_review']
  }
}

export function runSystemXMockAnalysis(input: SystemXInput): SystemXAnalysis {
  const preset = presets[input.type]
  const now = new Date().toISOString()
  const baseId = `${input.id}-${Date.now()}`

  return {
    id: `systemx-analysis-${baseId}`,
    inputId: input.id,
    summary: `${preset.summaryPrefix} 当前标题「${input.title}」可以先作为一次 MVP 级系统感知记录沉淀。`,
    facts: [...preset.facts, `原始输入长度约 ${input.content.trim().length} 个字符。`],
    patterns: preset.patterns,
    principles: [
      {
        id: `systemx-principle-${baseId}`,
        ...preset.principle,
        status: 'candidate'
      }
    ],
    actions: [
      {
        id: `systemx-action-${baseId}`,
        ...preset.action,
        status: 'todo'
      }
    ],
    risks: preset.risks,
    feedbackRule: preset.feedbackRule,
    systemTags: preset.systemTags,
    createdAt: now
  }
}
