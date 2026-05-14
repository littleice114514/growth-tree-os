import type {
  AppLanguage,
  AppSettings,
  AppearanceMode,
  DefaultCurrency,
  DefaultModule,
  FloatingDefaultState,
  MinimumRecordMinutes,
  RoundingMode,
  SafetyLineMonths
} from './settingsTypes'

export const appSettingsStorageKey = 'growth-tree-os:settings:v1'

export const defaultAppSettings: AppSettings = {
  general: {
    defaultModule: 'time-debt',
    appearance: 'system',
    language: 'zh-CN'
  },
  shortcuts: {
    timeDebtQuickFloatEnabled: true,
    timeDebtQuickFloatShortcut: 'CommandOrControl+Shift+Space',
    timeDebtQuickFloatFallback: 'CommandOrControl+Shift+L'
  },
  timeDebt: {
    minimumRecordMinutes: 15,
    roundingMode: 'ceil-to-minimum',
    floatingDefaultState: 'collapsed'
  },
  wealth: {
    defaultCurrency: 'CNY',
    safetyLineMonths: 6
  },
  modules: {
    enabledModules: ['time-debt', 'wealth', 'review', 'reminders', 'daily-review', 'settings'],
    showExperimentalModules: false
  }
}

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return cloneDefaultSettings()
  }

  try {
    const raw = window.localStorage.getItem(appSettingsStorageKey)
    if (!raw) {
      return cloneDefaultSettings()
    }

    const parsed = JSON.parse(raw)
    return normalizeSettings(parsed)
  } catch {
    return cloneDefaultSettings()
  }
}

export function saveAppSettings(settings: AppSettings): void {
  window.localStorage.setItem(appSettingsStorageKey, JSON.stringify(normalizeSettings(settings)))
}

export function resetAppSettings(): AppSettings {
  const defaults = cloneDefaultSettings()
  saveAppSettings(defaults)
  return defaults
}

function cloneDefaultSettings(): AppSettings {
  return {
    ...defaultAppSettings,
    general: { ...defaultAppSettings.general },
    shortcuts: { ...defaultAppSettings.shortcuts },
    timeDebt: { ...defaultAppSettings.timeDebt },
    wealth: { ...defaultAppSettings.wealth },
    modules: {
      ...defaultAppSettings.modules,
      enabledModules: [...defaultAppSettings.modules.enabledModules]
    }
  }
}

function normalizeSettings(value: unknown): AppSettings {
  const defaults = cloneDefaultSettings()
  if (!isRecord(value)) {
    return defaults
  }

  const general = isRecord(value.general) ? value.general : {}
  const shortcuts = isRecord(value.shortcuts) ? value.shortcuts : {}
  const timeDebt = isRecord(value.timeDebt) ? value.timeDebt : {}
  const wealth = isRecord(value.wealth) ? value.wealth : {}
  const modules = isRecord(value.modules) ? value.modules : {}

  return {
    general: {
      defaultModule: pickDefaultModule(general.defaultModule, defaults.general.defaultModule),
      appearance: pickAppearance(general.appearance, defaults.general.appearance),
      language: pickLanguage(general.language, defaults.general.language)
    },
    shortcuts: {
      timeDebtQuickFloatEnabled: typeof shortcuts.timeDebtQuickFloatEnabled === 'boolean' ? shortcuts.timeDebtQuickFloatEnabled : defaults.shortcuts.timeDebtQuickFloatEnabled,
      timeDebtQuickFloatShortcut: typeof shortcuts.timeDebtQuickFloatShortcut === 'string' && shortcuts.timeDebtQuickFloatShortcut.trim() ? shortcuts.timeDebtQuickFloatShortcut : defaults.shortcuts.timeDebtQuickFloatShortcut,
      timeDebtQuickFloatFallback: typeof shortcuts.timeDebtQuickFloatFallback === 'string' && shortcuts.timeDebtQuickFloatFallback.trim() ? shortcuts.timeDebtQuickFloatFallback : defaults.shortcuts.timeDebtQuickFloatFallback
    },
    timeDebt: {
      minimumRecordMinutes: pickMinimumRecordMinutes(timeDebt.minimumRecordMinutes, defaults.timeDebt.minimumRecordMinutes),
      roundingMode: pickRoundingMode(timeDebt.roundingMode, defaults.timeDebt.roundingMode),
      floatingDefaultState: pickFloatingDefaultState(timeDebt.floatingDefaultState, defaults.timeDebt.floatingDefaultState)
    },
    wealth: {
      defaultCurrency: pickDefaultCurrency(wealth.defaultCurrency, defaults.wealth.defaultCurrency),
      safetyLineMonths: pickSafetyLineMonths(wealth.safetyLineMonths, defaults.wealth.safetyLineMonths)
    },
    modules: {
      enabledModules: Array.isArray(modules.enabledModules) && modules.enabledModules.every((item) => typeof item === 'string') ? modules.enabledModules : defaults.modules.enabledModules,
      showExperimentalModules: typeof modules.showExperimentalModules === 'boolean' ? modules.showExperimentalModules : defaults.modules.showExperimentalModules
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pickDefaultModule(value: unknown, fallback: DefaultModule): DefaultModule {
  return value === 'time-debt' || value === 'wealth' || value === 'review' || value === 'reminders' || value === 'daily-review' ? value : fallback
}

function pickAppearance(value: unknown, fallback: AppearanceMode): AppearanceMode {
  return value === 'system' || value === 'light' || value === 'dark' ? value : fallback
}

function pickLanguage(value: unknown, fallback: AppLanguage): AppLanguage {
  return value === 'zh-CN' || value === 'en-US' ? value : fallback
}

function pickMinimumRecordMinutes(value: unknown, fallback: MinimumRecordMinutes): MinimumRecordMinutes {
  return value === 5 || value === 15 || value === 30 ? value : fallback
}

function pickRoundingMode(value: unknown, fallback: RoundingMode): RoundingMode {
  return value === 'none' || value === 'ceil-to-minimum' || value === 'nearest' ? value : fallback
}

function pickFloatingDefaultState(value: unknown, fallback: FloatingDefaultState): FloatingDefaultState {
  return value === 'collapsed' || value === 'expanded' ? value : fallback
}

function pickDefaultCurrency(value: unknown, fallback: DefaultCurrency): DefaultCurrency {
  return value === 'CNY' || value === 'USD' || value === 'HKD' ? value : fallback
}

function pickSafetyLineMonths(value: unknown, fallback: SafetyLineMonths): SafetyLineMonths {
  return value === 3 || value === 6 || value === 12 ? value : fallback
}
