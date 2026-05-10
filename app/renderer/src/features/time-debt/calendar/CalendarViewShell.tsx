import { useEffect, useMemo, useRef, useState } from 'react'
import type { TimeDebtPlan } from '../timeDebtPlansStorage'
import type { CalendarBlock, CalendarDragPreview, CalendarDragState, CalendarResizeEdge, CalendarResizePreview, CalendarResizeState, CalendarViewMode } from './calendarTypes'
import { defaultCalendarTimeScale } from './calendarTypes'
import { buildCalendarRange, dateTimeOverlapsRange, formatDateKey, shiftAnchorDate } from './calendarDateUtils'
import { createDragPreview, createDragState, createResizePreview, createResizeState } from './calendarDragPreviewUtils'
import { splitEventsIntoDailySegments } from './calendarDailySegmentUtils'
import { CalendarEventDetailPanel } from './CalendarEventDetailPanel'
import { CalendarViewSwitcher } from './CalendarViewSwitcher'
import { CustomDaysCalendarView } from './CustomDaysCalendarView'
import { DayCalendarView } from './DayCalendarView'
import { MonthCalendarView } from './MonthCalendarView'
import { WeekCalendarView } from './WeekCalendarView'

const buttonClass = 'rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:text-[color:var(--text-primary)]'
const primaryButtonClass = 'rounded-full border border-[color:var(--node-selected-border)] bg-[var(--node-selected-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--node-selected-border)]'

const fixedTimezoneOptions = ['GMT+8', 'GMT-7 Los Angeles', 'GMT-4 New York', 'GMT+1 London']

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
  onFinishTimer,
  onMoveBlock,
  onResizeBlock,
  onEditTimeRange
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
  onFinishTimer: (block?: CalendarBlock | null) => void
  onMoveBlock: (blockId: string, nextStartTime: string, nextEndTime: string) => void
  onResizeBlock: (blockId: string, nextStartTime: string, nextEndTime: string) => void
  onEditTimeRange: (blockId: string, nextStartTime: string, nextEndTime: string) => void
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [calendarNow, setCalendarNow] = useState(() => new Date(timerNow))
  const [dragState, setDragState] = useState<CalendarDragState>(null)
  const [dragPreview, setDragPreview] = useState<CalendarDragPreview>(null)
  const [resizeState, setResizeState] = useState<CalendarResizeState>(null)
  const [resizePreview, setResizePreview] = useState<CalendarResizePreview>(null)
  const [timezoneLabel, setTimezoneLabel] = useState(() => formatSystemTimezoneLabel())
  const [timezoneMenuOpen, setTimezoneMenuOpen] = useState(false)
  const previousTodayKeyRef = useRef(formatDateKey(new Date(timerNow)))
  const todayKey = formatDateKey(calendarNow)
  const timezoneOptions = useMemo(() => {
    const systemOption = `${formatSystemTimezoneLabel()} 系统时区`
    return [systemOption, ...fixedTimezoneOptions.filter((option) => option !== formatSystemTimezoneLabel())]
  }, [])
  const range = useMemo(() => buildCalendarRange(mode, anchorDate, customDayCount), [anchorDate, customDayCount, mode])
  const dayKeys = useMemo(() => range.days.map(formatDateKey), [range.days])
  const visibleBlocks = useMemo(
    () => splitEventsIntoDailySegments(
      blocks.filter((block) => dateTimeOverlapsRange(block.startTime, block.endTime, range.start, range.end)),
      range.start,
      range.end
    ),
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
      setDragPreview(createDragPreview(dragState, event.clientX, event.clientY, defaultCalendarTimeScale, dayKeys))
    }
    const handleUp = (event: MouseEvent) => {
      const finalPreview = createDragPreview(dragState, event.clientX, event.clientY, defaultCalendarTimeScale, dayKeys)
      if (finalPreview) {
        onMoveBlock(
          finalPreview.blockId,
          buildDateTimeFromDayAndMinutes(finalPreview.dayKey, finalPreview.startMinutes),
          buildDateTimeFromDayAndMinutes(finalPreview.dayKey, finalPreview.endMinutes)
        )
      }
      setDragState(null)
      window.setTimeout(() => setDragPreview(null), 300)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp, { once: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dayKeys, dragState, onMoveBlock])

  useEffect(() => {
    if (!resizeState) return
    const handleMove = (event: MouseEvent) => {
      setResizePreview(createResizePreview(resizeState, event.clientY, defaultCalendarTimeScale))
    }
    const handleUp = (event: MouseEvent) => {
      const finalPreview = createResizePreview(resizeState, event.clientY, defaultCalendarTimeScale)
      if (finalPreview) {
        onResizeBlock(
          finalPreview.blockId,
          buildDateTimeFromDayAndMinutes(finalPreview.dayKey, finalPreview.startMinutes),
          buildDateTimeFromDayAndMinutes(finalPreview.dayKey, finalPreview.endMinutes)
        )
      }
      setResizeState(null)
      window.setTimeout(() => setResizePreview(null), 300)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp, { once: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [onResizeBlock, resizeState])

  const sharedViewProps = {
    days: range.days,
    blocks: visibleBlocks,
    todayKey,
    now: calendarNow,
    scale: defaultCalendarTimeScale,
    selectedBlockId,
    dragPreview,
    resizePreview,
    onSelectBlock: (block: CalendarBlock) => setSelectedBlockId(block.id),
    onClearSelection: () => {
      if (!dragState) {
        setSelectedBlockId(null)
      }
    },
    onDragStart: (
      block: CalendarBlock,
      drag: { originClientX: number; originClientY: number; currentClientX: number; currentClientY: number; dayColumnWidth: number; dayIndex: number; columnCount: number }
    ) => {
      setSelectedBlockId(block.id)
      const nextDragState = createDragState(block, drag.originClientX, drag.originClientY, drag.dayIndex, drag.dayColumnWidth, drag.columnCount)
      setDragState(nextDragState)
      if (nextDragState) {
        setDragPreview(createDragPreview(nextDragState, drag.currentClientX, drag.currentClientY, defaultCalendarTimeScale, dayKeys))
      }
    },
    onResizeStart: (block: CalendarBlock, edge: CalendarResizeEdge, originClientY: number) => {
      if (block.status === 'active') return
      setSelectedBlockId(block.id)
      const nextResizeState = createResizeState(block, edge, originClientY)
      setResizeState(nextResizeState)
      if (nextResizeState) {
        setResizePreview(createResizePreview(nextResizeState, originClientY, defaultCalendarTimeScale))
      }
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
            <div className="relative">
              <button
                type="button"
                aria-expanded={timezoneMenuOpen}
                onClick={() => setTimezoneMenuOpen((open) => !open)}
                className={buttonClass}
              >
                {timezoneLabel}
              </button>
              {timezoneMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[80] min-w-48 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-2 shadow-panel">
                  {timezoneOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setTimezoneLabel(formatTimezoneButtonLabel(option))
                        setTimezoneMenuOpen(false)
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-xs transition ${formatTimezoneButtonLabel(option) === timezoneLabel ? 'bg-[var(--control-hover)] text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:bg-[var(--control-bg)] hover:text-[color:var(--text-primary)]'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" onClick={onOpenManual} className={primaryButtonClass}>新增日志</button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
          <Legend dotClass="border-dashed border-amber-500 bg-amber-100" label="Planned" />
          <Legend dotClass="border-emerald-600 bg-emerald-100" label="Active" />
          <Legend dotClass="border-sky-600 bg-sky-100" label="Completed" />
          <Legend dotClass="border-rose-500 bg-rose-100" label="Missed" />
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
        resizePreview={resizePreview}
        timerNow={timerNow}
        onDelete={onDelete}
        onStartPlan={onStartPlan}
        onConvertPlanToManual={onConvertPlanToManual}
        onAbandonPlan={onAbandonPlan}
        onFinishTimer={onFinishTimer}
        onEditTimeRange={onEditTimeRange}
      />
    </div>
  )
}

function buildDateTimeFromDayAndMinutes(dayKey: string, minutes: number): string {
  const date = new Date(`${dayKey}T00:00`)
  date.setMinutes(minutes)
  return `${date.getFullYear()}-${padDateTimePart(date.getMonth() + 1)}-${padDateTimePart(date.getDate())}T${padDateTimePart(date.getHours())}:${padDateTimePart(date.getMinutes())}`
}

function padDateTimePart(value: number): string {
  return String(value).padStart(2, '0')
}

function formatSystemTimezoneLabel(): string {
  const offsetMinutes = -new Date().getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteMinutes / 60)
  const minutes = absoluteMinutes % 60
  return minutes === 0 ? `GMT${sign}${hours}` : `GMT${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

function formatTimezoneButtonLabel(option: string): string {
  return option.replace(' 系统时区', '')
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full border ${dotClass}`} />
      {label}
    </span>
  )
}
