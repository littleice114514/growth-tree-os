import type { CalendarTimeScale } from './calendarTypes'
import { timeToTop } from './calendarTimePositionUtils'

export function CalendarTimeAxis({ scale }: { scale: CalendarTimeScale }) {
  const hours = Array.from({ length: scale.visibleEndHour - scale.visibleStartHour + 1 }, (_, index) => scale.visibleStartHour + index)
  return (
    <div className="relative border-r border-[color:var(--panel-border)]/40">
      {hours.map((hour) => (
        <div key={hour} className="absolute left-0 right-0" style={{ top: timeToTop(hour * 60, scale) }}>
          {hour < scale.visibleEndHour ? <span className="absolute right-3 -translate-y-1/2 text-[11px] tabular-nums text-[color:var(--text-muted)]">{formatHour(hour)}</span> : null}
        </div>
      ))}
    </div>
  )
}

export function CalendarGridLines({ scale }: { scale: CalendarTimeScale }) {
  const hourCount = scale.visibleEndHour - scale.visibleStartHour
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: hourCount + 1 }, (_, index) => (
        <div key={index} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]/45" style={{ top: timeToTop((scale.visibleStartHour + index) * 60, scale) }} />
      ))}
      {scale.showHalfHourLine
        ? Array.from({ length: hourCount }, (_, index) => (
            <div key={index} className="absolute left-0 right-0 border-t border-dashed border-[color:var(--panel-border)]/25" style={{ top: timeToTop((scale.visibleStartHour + index) * 60 + 30, scale) }} />
          ))
        : null}
    </div>
  )
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}
