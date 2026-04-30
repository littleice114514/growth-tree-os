import { useEffect, useMemo, useRef, useState } from 'react'
import type { TimeDebtPlan } from '../timeDebtPlansStorage'
import type { CalendarBlock, CalendarDragPreview, CalendarDragState, CalendarViewMode } from './calendarTypes'
import { defaultCalendarTimeScale } from './calendarTypes'
import { buildCalendarRange, dateTimeOverlapsRange, formatDateKey, shiftAnchorDate } from './calendarDateUtils'
import { createDragPreview, createDragState } from './calendarDragPreviewUtils'
import { CalendarEventDetailPanel } from './CalendarEventDetailPanel'
import { CalendarViewSwitcher } from './CalendarViewSwitcher'
import { CustomDaysCalendarView } from './CustomDaysCalendarView'
import { DayCalendarView } from './DayCalendarView'
import { MonthCalendarView } from './MonthCalendarView'
import { WeekCalendarView } from './WeekCalendarView'

const buttonClass = 'rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:text-[color:var(--text-primary)]'
const primaryButtonClass = 'rounded-full border border-[color:var(--node-selected-border)] bg-[var(--node-selected-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--node-selected-border)]'

export function CalendarViewShell({
  mode,
  anchorDate,
  customDayCount,
  blocks,
  timerNow,
  onModeChange,
  onAnchorDateChange,
  onCustomDayCountChange,
  onOpenManual,
  onDelete,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer
}: {
  mode: CalendarViewMode
  anchorDate: string
  customDayCount: number
  blocks: CalendarBlock[]
  timerNow: number
  onModeChange: (mode: CalendarViewMode) => void
  onAnchorDateChange: (date: string) => void
  onCustomDayCountChange: (count: number) => void
  onOpenManual: () => void
  onDelete: (logId: string) => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: () => void
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [calendarNow, setCalendarNow] = useState(() => new Date(timerNow))
  const [dragState, setDragState] = useState<CalendarDragState>(null)
  const [dragPreview, setDragPreview] = useState<CalendarDragPreview>(null)
  const previousTodayKeyRef = useRef(formatDateKey(new Date(timerNow)))
  const todayKey = formatDateKey(calendarNow)
  const range = useMemo(() => buildCalendarRange(mode, anchorDate, customDayCount), [anchorDate, customDayCount, mode])
  const visibleBlocks = useMemo(
    () => blocks.filter((block) => dateTimeOverlapsRange(block.startTime, block.endTime, range.start, range.end)),
    [blocks, range.end, range.start]
  )
  const selectedBlock = visibleBlocks.find((block) => block.id === selectedBlockId) ?? blocks.find((block) => block.id === selectedBlockId) ?? null

  useEffect(() => {
    const updateNow = () => setCalendarNow(new Date())
    updateNow()
    const intervalId = window.setInterval(updateNow, 60000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const previousTodayKey = previousTodayKeyRef.current
    const wasViewingPreviousToday = range.days.some((day) => formatDateKey(day) === previousTodayKey)
    if (previousTodayKey !== todayKey && wasViewingPreviousToday) {
      onAnchorDateChange(todayKey)
    }
    previousTodayKeyRef.current = todayKey
  }, [onAnchorDateChange, range.days, todayKey])

  useEffect(() => {
    if (!dragState) return
    const handleMove = (event: MouseEvent) => {
      setDragPreview(createDragPreview(dragState, event.clientY, defaultCalendarTimeScale))
    }
    const handleUp = () => {
      setDragState(null)
      window.setTimeout(() => setDragPreview(null), 300)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp, { once: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragState])

  const sharedViewProps = {
    days: range.days,
    blocks: visibleBlocks,
    todayKey,
    now: calendarNow,
    scale: defaultCalendarTimeScale,
    selectedBlockId,
    dragPreview,
    onSelectBlock: (block: CalendarBlock) => setSelectedBlockId((current) => (current === block.id ? null : block.id)),
    onDragStart: (block: CalendarBlock, clientY: number) => {
      setSelectedBlockId(block.id)
      setDragState(createDragState(block, clientY))
    }
  }

  return (
    <div className="grid min-h-[760px] gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Calendar</div>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{range.label}</h3>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CalendarViewSwitcher mode={mode} customDayCount={customDayCount} onModeChange={onModeChange} onCustomDayCountChange={onCustomDayCountChange} />
            <button type="button" onClick={() => onAnchorDateChange(todayKey)} className={primaryButtonClass}>今天</button>
            <button type="button" onClick={() => onAnchorDateChange(shiftAnchorDate(mode, anchorDate, customDayCount, -1))} className={buttonClass}>上一段</button>
            <button type="button" onClick={() => onAnchorDateChange(shiftAnchorDate(mode, anchorDate, customDayCount, 1))} className={buttonClass}>下一段</button>
            <button type="button" onClick={onOpenManual} className={primaryButtonClass}>新增日志</button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
          <Legend dotClass="border-dashed border-amber-400 bg-amber-400/10" label="Planned" />
          <Legend dotClass="border-emerald-400 bg-emerald-400/20" label="Active" />
          <Legend dotClass="border-cyan-400 bg-cyan-400/20" label="Completed" />
          <Legend dotClass="border-rose-400 bg-rose-400/10" label="Missed" />
        </div>
        {mode === 'day' ? <DayCalendarView {...sharedViewProps} /> : null}
        {mode === 'week' ? <WeekCalendarView {...sharedViewProps} /> : null}
        {mode === 'customDays' ? <CustomDaysCalendarView {...sharedViewProps} /> : null}
        {mode === 'month' ? (
          <MonthCalendarView
            days={range.days}
            anchorDateKey={anchorDate}
            blocks={visibleBlocks}
            todayKey={todayKey}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(block) => setSelectedBlockId(block.id)}
            onSelectDay={(dateKey) => {
              onAnchorDateChange(dateKey)
              onModeChange('day')
            }}
          />
        ) : null}
      </section>
      <CalendarEventDetailPanel
        block={selectedBlock}
        dragPreview={dragPreview}
        timerNow={timerNow}
        onDelete={onDelete}
        onStartPlan={onStartPlan}
        onConvertPlanToManual={onConvertPlanToManual}
        onAbandonPlan={onAbandonPlan}
        onFinishTimer={onFinishTimer}
      />
    </div>
  )
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full border ${dotClass}`} />
      {label}
    </span>
  )
}
