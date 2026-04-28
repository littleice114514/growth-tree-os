import type { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info'

const toneClasses: Record<Tone, string> = {
  neutral: 'border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] text-[color:var(--text-primary)]',
  good: 'border-emerald-400/25 bg-emerald-400/10 text-accent-green',
  warn: 'border-amber-400/25 bg-amber-400/10 text-accent-amber',
  bad: 'border-rose-400/25 bg-rose-500/10 text-accent-rose',
  info: 'border-cyan-400/25 bg-cyan-400/10 text-accent-cyan'
}

export function PreviewShell({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[22px] border border-[color:var(--panel-border)] bg-[linear-gradient(135deg,var(--panel-bg-strong),var(--panel-bg))] p-4 shadow-panel">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{eyebrow}</div>
          <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">{description}</p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-accent-cyan">Preview V0.1</span>
      </div>
      {children}
    </section>
  )
}

export function StatusCard({
  title,
  status,
  diagnosis,
  suggestion,
  tone = 'warn'
}: {
  title: string
  status: string
  diagnosis: string
  suggestion: string
  tone?: Tone
}) {
  return (
    <article className={clsx('rounded-[18px] border p-4', toneClasses[tone])}>
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-75">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{status}</div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{diagnosis}</p>
      <p className="mt-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-sm font-medium text-[color:var(--text-primary)]">{suggestion}</p>
    </article>
  )
}

export function MetricCard({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail?: string; tone?: Tone }) {
  return (
    <article className={clsx('rounded-[18px] border p-4', toneClasses[tone])}>
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      {detail ? <div className="mt-2 text-xs leading-5 text-[color:var(--text-secondary)]">{detail}</div> : null}
    </article>
  )
}

export function CapsuleProgressBar({ label, value, max, tone = 'info' }: { label: string; value: number; max: number; tone?: Tone }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const barClass = {
    neutral: 'bg-slate-300',
    good: 'bg-emerald-300',
    warn: 'bg-amber-300',
    bad: 'bg-rose-300',
    info: 'bg-cyan-300'
  }[tone]
  return (
    <div>
      <div className="flex justify-between gap-3 text-xs text-[color:var(--text-secondary)]">
        <span>{label}</span>
        <span>{Math.round(value)} / {Math.round(max)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={clsx('h-full rounded-full', barClass)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function StackedRatioBar({ items }: { items: Array<{ label: string; value: number; color: string }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
        {items.map((item) => (
          <div key={item.label} className={item.color} style={{ width: `${(item.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-xs text-[color:var(--text-secondary)]">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TugOfWarBar({ leftLabel, leftValue, rightLabel, rightValue }: { leftLabel: string; leftValue: number; rightLabel: string; rightValue: number }) {
  const total = Math.max(1, leftValue + rightValue)
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 text-xs text-[color:var(--text-secondary)]">
        <span>{leftLabel}: {leftValue}</span>
        <span className="text-right">{rightLabel}: {rightValue}</span>
      </div>
      <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-white/10">
        <div className="bg-rose-300/75" style={{ width: `${(leftValue / total) * 100}%` }} />
        <div className="bg-emerald-300/75" style={{ width: `${(rightValue / total) * 100}%` }} />
      </div>
    </div>
  )
}

export function MiniTrendStrip({ values }: { values: number[] }) {
  const maxAbs = Math.max(1, ...values.map((value) => Math.abs(value)))
  return (
    <div className="flex h-24 items-end gap-2 rounded-2xl border border-white/10 bg-black/10 p-3">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div
            className={clsx('w-full rounded-t-lg', value >= 0 ? 'bg-emerald-300/75' : 'bg-rose-300/70')}
            style={{ height: `${18 + (Math.abs(value) / maxAbs) * 54}px` }}
          />
          <span className="text-[10px] text-[color:var(--text-muted)]">{index + 1}</span>
        </div>
      ))}
    </div>
  )
}

export function ActionSuggestionCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-accent-cyan">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{body}</p>
    </article>
  )
}
