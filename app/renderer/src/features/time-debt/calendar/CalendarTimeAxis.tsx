import type { CalendarTimeScale } from './calendarTypes'
import { timeToTop } from './calendarTimePositionUtils'

export function CalendarTimeAxis({ scale }: { scale: CalendarTimeScale }) {
  const hourCount = scale.visibleEndHour - scale.visibleStartHour
  const labels = Array.from({ length: hourCount * 2 + 1 }, (_, index) => scale.visibleStartHour * 60 + index * 30)
  return (
    <div className="relative border-r border-[color:var(--panel-border)]/25">
      {labels.map((minutes) => {
        const isHour = minutes % 60 === 0
        if (minutes >= scale.visibleEndHour * 60 || (!isHour && !scale.showHalfHourLabel)) {
          return null
        }
        return (
          <div key={minutes} className="absolute left-0 right-0" style={{ top: timeToTop(minutes, scale) }}>
            <span className={`absolute right-2 -translate-y-1/2 tabular-nums ${isHour ? 'text-[11px] font-medium text-[color:var(--text-secondary)]' : 'text-[10px] text-[color:var(--text-muted)]/70'}`}>
              {formatTimeLabel(minutes)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function CalendarGridLines({ scale }: { scale: CalendarTimeScale }) {
  const hourCount = scale.visibleEndHour - scale.visibleStartHour
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: hourCount + 1 }, (_, index) => (
        <div key={index} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]/32" style={{ top: timeToTop((scale.visibleStartHour + index) * 60, scale) }} />
      ))}
      {scale.showHalfHourLine
        ? Array.from({ length: hourCount }, (_, index) => (
            <div key={index} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]/18" style={{ top: timeToTop((scale.visibleStartHour + index) * 60 + 30, scale) }} />
          ))
        : null}
    </div>
  )
}

function formatTimeLabel(minutes: number): string {
  const hour = Math.floor(minutes / 60)
  if (minutes % 60 === 30) {
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:30`
  }
  return formatHour(hour)
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}
