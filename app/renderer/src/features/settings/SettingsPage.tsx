import { type ReactNode, useMemo, useState } from 'react'
import { appSettingsStorageKey, defaultAppSettings, loadAppSettings, resetAppSettings, saveAppSettings } from './settingsStorage'
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

const panelClass = 'rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-panel backdrop-blur-2xl'
const inputClass = 'min-h-[42px] rounded-xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--node-selected-border)]'
const readOnlyClass = 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)]'

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings())
  const [saveState, setSaveState] = useState('尚未保存本次修改')

  const savedSummary = useMemo(() => {
    return `保存位置：${appSettingsStorageKey}`
  }, [])

  const updateSettings = (next: AppSettings) => {
    setSettings(next)
    setSaveState('有未保存修改')
  }

  const handleSave = () => {
    saveAppSettings(settings)
    setSaveState(`已保存：${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`)
  }

  const handleReset = () => {
    const defaults = resetAppSettings()
    setSettings(defaults)
    setSaveState('已恢复默认值')
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto text-[color:var(--text-primary)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 pb-8">
        <section className={panelClass}>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Settings Foundation</div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">设置</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
                管理全局偏好、快捷键、时间负债、财富参数与实验功能。第一版只建立统一入口和本地配置底座。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleReset} className="rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]">
                重置默认值
              </button>
              <button type="button" onClick={handleSave} className="rounded-xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-text)] transition hover:bg-[var(--button-hover)]">
                保存设置
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--text-muted)]">
            <span className="rounded-full border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1">{saveState}</span>
            <span className="rounded-full border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1">{savedSummary}</span>
          </div>
        </section>

        <SettingsSection title="通用" eyebrow="General">
          <SettingSelect
            label="默认打开模块"
            description="第一版只保存偏好，暂不改变 App 启动路由。"
            value={settings.general.defaultModule}
            options={[
              ['time-debt', 'Time Debt'],
              ['wealth', 'Wealth'],
              ['review', 'Review'],
              ['reminders', 'Reminders'],
              ['daily-review', 'Daily Review']
            ]}
            onChange={(value) => updateSettings({ ...settings, general: { ...settings.general, defaultModule: value as DefaultModule } })}
          />
          <SettingSelect
            label="外观模式"
            description="第一版保存 system / light / dark 偏好，不重写现有主题切换器。"
            value={settings.general.appearance}
            options={[
              ['system', 'System'],
              ['light', 'Light'],
              ['dark', 'Dark']
            ]}
            onChange={(value) => updateSettings({ ...settings, general: { ...settings.general, appearance: value as AppearanceMode } })}
          />
          <SettingSelect
            label="语言"
            description="第一版只保存语言偏好，不做全站翻译。"
            value={settings.general.language}
            options={[
              ['zh-CN', '简体中文'],
              ['en-US', 'English']
            ]}
            onChange={(value) => updateSettings({ ...settings, general: { ...settings.general, language: value as AppLanguage } })}
          />
        </SettingsSection>

        <SettingsSection title="快捷键" eyebrow="Shortcuts">
          <SettingToggle
            label="启用全局快捷键"
            description="只保存开关；本轮不重写 Electron globalShortcut 注册逻辑。"
            checked={settings.shortcuts.timeDebtQuickFloatEnabled}
            onChange={(checked) => updateSettings({ ...settings, shortcuts: { ...settings.shortcuts, timeDebtQuickFloatEnabled: checked } })}
          />
          <ReadOnlySetting label="Time Debt 快速记录快捷键" description="当前由 Electron main 进程固定注册。" value={settings.shortcuts.timeDebtQuickFloatShortcut} />
          <ReadOnlySetting label="Fallback 快捷键" description="主快捷键不可注册时使用。" value={settings.shortcuts.timeDebtQuickFloatFallback} />
        </SettingsSection>

        <SettingsSection title="时间负债" eyebrow="Time Debt">
          <SettingSelect
            label="最小记录单位"
            description="第一版只保存配置，不改变现有记录取整逻辑。"
            value={String(settings.timeDebt.minimumRecordMinutes)}
            options={[
              ['5', '5 分钟'],
              ['15', '15 分钟'],
              ['30', '30 分钟']
            ]}
            onChange={(value) => updateSettings({ ...settings, timeDebt: { ...settings.timeDebt, minimumRecordMinutes: Number(value) as MinimumRecordMinutes } })}
          />
          <SettingSelect
            label="取整规则"
            description="保存未来接入 Time Debt 记录流的规则。"
            value={settings.timeDebt.roundingMode}
            options={[
              ['none', '不取整'],
              ['ceil-to-minimum', '向上到最小单位'],
              ['nearest', '就近取整']
            ]}
            onChange={(value) => updateSettings({ ...settings, timeDebt: { ...settings.timeDebt, roundingMode: value as RoundingMode } })}
          />
          <SettingSelect
            label="浮窗默认状态"
            description="第一版只保存偏好，不改变当前浮窗状态恢复逻辑。"
            value={settings.timeDebt.floatingDefaultState}
            options={[
              ['collapsed', '收起'],
              ['expanded', '展开']
            ]}
            onChange={(value) => updateSettings({ ...settings, timeDebt: { ...settings.timeDebt, floatingDefaultState: value as FloatingDefaultState } })}
          />
        </SettingsSection>

        <SettingsSection title="财富" eyebrow="Wealth">
          <SettingSelect
            label="默认货币"
            description="第一版只保存 CNY / USD / HKD 偏好，不接汇率 API。"
            value={settings.wealth.defaultCurrency}
            options={[
              ['CNY', 'CNY'],
              ['USD', 'USD'],
              ['HKD', 'HKD']
            ]}
            onChange={(value) => updateSettings({ ...settings, wealth: { ...settings.wealth, defaultCurrency: value as DefaultCurrency } })}
          />
          <SettingSelect
            label="安全线月数"
            description="保存未来财富参数接入的月份偏好。"
            value={String(settings.wealth.safetyLineMonths)}
            options={[
              ['3', '3 个月'],
              ['6', '6 个月'],
              ['12', '12 个月']
            ]}
            onChange={(value) => updateSettings({ ...settings, wealth: { ...settings.wealth, safetyLineMonths: Number(value) as SafetyLineMonths } })}
          />
          <ReadOnlySetting label="行情 candle 来源说明" description="当前行情逻辑不变；Yahoo 成功显示 Live，失败显示 Mock。" value="Yahoo Live / Mock / Finnhub Quote" />
        </SettingsSection>

        <SettingsSection title="数据与实验功能" eyebrow="Data & Labs">
          <ReadOnlySetting label="模块显示管理" description="第一版占位；当前只开放稳定模块。" value={settings.modules.enabledModules.join(', ')} />
          <SettingToggle
            label="实验模块开关"
            description="占位配置；保存后也不会恢复 SystemX / AI Map / Tree / Graph 等入口。"
            checked={settings.modules.showExperimentalModules}
            onChange={(checked) => updateSettings({ ...settings, modules: { ...settings.modules, showExperimentalModules: checked } })}
          />
          <ReadOnlySetting label="数据导出 / 备份" description="占位，不执行导出、不读写数据库。" value="待后续接入" />
        </SettingsSection>
      </div>
    </main>
  )
}

function SettingsSection({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className={panelClass}>
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{eyebrow}</div>
        <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange
}: {
  label: string
  description: string
  value: string
  options: Array<[string, string]>
  onChange: (value: string) => void
}) {
  return (
    <SettingRow label={label} description={description}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </SettingRow>
  )
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <SettingRow label={label} description={description}>
      <label className="inline-flex min-h-[42px] items-center justify-end gap-3 rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)]">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-cyan-500" />
        <span>{checked ? '启用' : '关闭'}</span>
      </label>
    </SettingRow>
  )
}

function ReadOnlySetting({ label, description, value }: { label: string; description: string; value: string }) {
  return (
    <SettingRow label={label} description={description}>
      <div className={readOnlyClass}>{value}</div>
    </SettingRow>
  )
}

function SettingRow({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-[color:var(--input-border)] py-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">{description}</div>
      </div>
      {children}
    </div>
  )
}
