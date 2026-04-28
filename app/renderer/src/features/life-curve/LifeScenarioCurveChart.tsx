import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  CURRENT_AGE,
  END_AGE,
  START_AGE,
  type LifeScenarioCurve,
  type LifeScenarioCurveKey,
  type LifeScenarioCurvePoint
} from './lifeScenarioCurves'
import { LifeScenarioCurveLegend } from './LifeScenarioCurveLegend'

const chartWidth = 1000
const chartHeight = 430
const padding = {
  top: 34,
  right: 34,
  bottom: 52,
  left: 64
}
const maxValue = 100
const xTicks = [18, 25, 35, 45, 60, 80]
const yTicks = [0, 25, 50, 75, 100]
const defaultVisibleKeys: LifeScenarioCurveKey[] = ['employment', 'aiCollaboration', 'capitalCompound', 'composite']
const plotLeft = padding.left
const plotRight = chartWidth - padding.right
const plotTop = padding.top
const plotBottom = chartHeight - padding.bottom
const plotWidth = plotRight - plotLeft
const plotHeight = plotBottom - plotTop
const tooltipWidth = 238
const tooltipLineHeight = 20

type HoverState = {
  age: number
  x: number
  y: number
}

function xScale(age: number) {
  const ratio = (age - START_AGE) / (END_AGE - START_AGE)
  return plotLeft + ratio * plotWidth
}

function yScale(value: number) {
  const ratio = value / maxValue
  return plotBottom - ratio * plotHeight
}

function buildPath(points: LifeScenarioCurvePoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xScale(point.age).toFixed(2)} ${yScale(point.value).toFixed(2)}`).join(' ')
}

function buildAreaPath(points: LifeScenarioCurvePoint[]) {
  const linePath = buildPath(points)
  const first = points[0]
  const last = points.at(-1)
  if (!first || !last) {
    return ''
  }
  return `${linePath} L ${xScale(last.age).toFixed(2)} ${yScale(0).toFixed(2)} L ${xScale(first.age).toFixed(2)} ${yScale(0).toFixed(2)} Z`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getSvgPointFromMouseEvent(event: MouseEvent<SVGRectElement>, svg: SVGSVGElement) {
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) {
    return { x: plotLeft, y: plotTop }
  }
  const svgPoint = point.matrixTransform(ctm.inverse())
  return { x: svgPoint.x, y: svgPoint.y }
}

function getNearestAgeFromSvgX(svgX: number) {
  const clampedX = clamp(svgX, plotLeft, plotRight)
  const ratio = (clampedX - plotLeft) / plotWidth
  return Math.round(START_AGE + ratio * (END_AGE - START_AGE))
}

function getTooltipPosition(hoverState: HoverState, rowCount: number) {
  const height = 48 + rowCount * tooltipLineHeight
  const x = Math.min(hoverState.x + 16, plotRight - tooltipWidth)
  const y = clamp(hoverState.y - height / 2, plotTop + 10, plotBottom - height - 10)
  return {
    x: Math.max(plotLeft + 10, x),
    y,
    height
  }
}

export function LifeScenarioCurveChart({ curves }: { curves: LifeScenarioCurve[] }) {
  const [visibleKeys, setVisibleKeys] = useState<LifeScenarioCurveKey[]>(defaultVisibleKeys)
  const [hoverState, setHoverState] = useState<HoverState | null>(null)
  const visibleCurves = useMemo(() => curves.filter((curve) => visibleKeys.includes(curve.key)), [curves, visibleKeys])
  const hoverPoints = useMemo(
    () =>
      hoverState === null
        ? []
        : visibleCurves
            .map((curve) => ({
              curve,
              point: curve.points.find((item) => item.age === hoverState.age)
            }))
            .filter((item): item is { curve: LifeScenarioCurve; point: LifeScenarioCurvePoint } => Boolean(item.point)),
    [hoverState, visibleCurves]
  )
  const tooltip = hoverState ? getTooltipPosition(hoverState, hoverPoints.length) : null

  const toggleCurve = (key: LifeScenarioCurveKey) => {
    setVisibleKeys((current) => {
      if (current.includes(key)) {
        const next = current.filter((item) => item !== key)
        return next.length > 0 ? next : ['composite']
      }
      return [...current, key]
    })
  }

  const handleMouseMove = (event: MouseEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) {
      return
    }
    const point = getSvgPointFromMouseEvent(event, svg)
    const age = getNearestAgeFromSvgX(point.x)
    setHoverState({
      age,
      x: xScale(age),
      y: clamp(point.y, plotTop, plotBottom)
    })
  }

  return (
    <section className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-5 shadow-panel backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Scenario Model</div>
          <h3 className="mt-2 text-xl font-semibold">六种人生曲线</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
            点击下方按钮，逐条叠加对比。上方曲线是长期模型模板；下方评分来自每日复盘，后续会用真实复盘数据逐步修正曲线参数。
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-4 py-3 text-sm">
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">当前年龄</div>
          <div className="mt-1 text-xl font-semibold">{CURRENT_AGE}</div>
        </div>
      </div>

      <div className="mt-4">
        <LifeScenarioCurveLegend curves={curves} visibleKeys={visibleKeys} onToggle={toggleCurve} />
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
        <svg
          className="block h-[360px] w-full md:h-[430px]"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="六种人生曲线折线图"
        >
          <defs>
            {curves.map((curve) => (
              <linearGradient key={curve.key} id={`life-curve-fill-${curve.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={curve.color} stopOpacity={curve.key === 'composite' ? 0.18 : 0.11} />
                <stop offset="100%" stopColor={curve.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="transparent" />

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeDasharray={tick === 0 ? undefined : '4 8'}
              />
              <text x={plotLeft - 14} y={yScale(tick) + 4} textAnchor="end" className="fill-current text-[12px] text-[color:var(--text-muted)]">
                {tick}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={tick}>
              <line x1={xScale(tick)} x2={xScale(tick)} y1={plotTop} y2={plotBottom} stroke="currentColor" strokeOpacity="0.08" />
              <text x={xScale(tick)} y={chartHeight - 20} textAnchor="middle" className="fill-current text-[12px] text-[color:var(--text-muted)]">
                {tick}
              </text>
            </g>
          ))}

          <line x1={plotLeft} x2={plotRight} y1={yScale(0)} y2={yScale(0)} stroke="currentColor" strokeOpacity="0.22" />
          <line x1={plotLeft} x2={plotLeft} y1={plotTop} y2={plotBottom} stroke="currentColor" strokeOpacity="0.22" />
          <text x={(plotLeft + plotRight) / 2} y={chartHeight - 6} textAnchor="middle" className="fill-current text-[13px] text-[color:var(--text-secondary)]">
            年龄
          </text>
          <text x="18" y={plotTop - 8} className="fill-current text-[13px] text-[color:var(--text-secondary)]">
            生命力指数
          </text>

          <line
            x1={xScale(CURRENT_AGE)}
            x2={xScale(CURRENT_AGE)}
            y1={plotTop}
            y2={plotBottom}
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeDasharray="7 7"
          />
          <text x={xScale(CURRENT_AGE) + 8} y={plotTop + 16} className="fill-current text-[12px] text-[color:var(--text-secondary)]">
            当前年龄
          </text>

          {visibleCurves.map((curve) => (
            <g key={curve.key}>
              <path d={buildAreaPath(curve.points)} fill={`url(#life-curve-fill-${curve.key})`} />
              <path
                d={buildPath(curve.points)}
                fill="none"
                stroke={curve.color}
                strokeWidth={curve.key === 'composite' ? 5 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={curve.key === 'composite' ? 1 : 0.86}
              />
            </g>
          ))}

          {hoverState !== null ? (
            <g>
              <line x1={hoverState.x} x2={hoverState.x} y1={plotTop} y2={plotBottom} stroke="currentColor" strokeOpacity="0.45" />
              {hoverPoints.map(({ curve, point }) => (
                <circle key={curve.key} cx={hoverState.x} cy={yScale(point.value)} r={curve.key === 'composite' ? 5 : 4} fill={curve.color} stroke="white" strokeWidth="1.5" />
              ))}
            </g>
          ) : null}

          {hoverState !== null && tooltip !== null ? (
            <g pointerEvents="none">
              <rect x={tooltip.x} y={tooltip.y} width={tooltipWidth} height={tooltip.height} rx="16" fill="rgba(0,0,0,0.82)" stroke="rgba(255,255,255,0.14)" />
              <text x={tooltip.x + 14} y={tooltip.y + 25} className="fill-white text-[14px] font-semibold">
                {hoverState.age} 岁
              </text>
              {hoverPoints.map(({ curve, point }, index) => (
                <g key={curve.key}>
                  <circle cx={tooltip.x + 18} cy={tooltip.y + 49 + index * tooltipLineHeight} r="4" fill={curve.color} />
                  <text x={tooltip.x + 30} y={tooltip.y + 53 + index * tooltipLineHeight} className="fill-white text-[12px]">
                    {curve.label}
                  </text>
                  <text x={tooltip.x + tooltipWidth - 14} y={tooltip.y + 53 + index * tooltipLineHeight} textAnchor="end" className="fill-white text-[12px]">
                    {point.value.toFixed(1)}
                  </text>
                </g>
              ))}
            </g>
          ) : null}

          <rect
            x={plotLeft}
            y={plotTop}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverState(null)}
          />
        </svg>
      </div>
    </section>
  )
}
