import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import clsx from 'clsx'
import { ShellCard } from '@/components/ShellCard'

type GraphNodeType = 'belief' | 'skill' | 'project' | 'relationship' | 'resource'

type GraphPrototypeNode = {
  id: string
  label: string
  type: GraphNodeType
  group: string
  summary: string
  tags: string[]
  x: number
  y: number
}

type GraphPrototypeEdge = {
  id: string
  source: string
  target: string
}

type GraphViewport = {
  x: number
  y: number
  zoom: number
}

const GRAPH_WIDTH = 1680
const GRAPH_HEIGHT = 1040

const TYPE_META: Record<
  GraphNodeType,
  { label: string; color: string; glow: string; ring: string; description: string }
> = {
  belief: {
    label: '认知母题',
    color: '#7dd3fc',
    glow: 'rgba(125, 211, 252, 0.34)',
    ring: 'rgba(125, 211, 252, 0.50)',
    description: '稳定影响判断与策略的内在认知。'
  },
  skill: {
    label: '能力结构',
    color: '#86efac',
    glow: 'rgba(134, 239, 172, 0.30)',
    ring: 'rgba(134, 239, 172, 0.44)',
    description: '可以反复调用、持续复利的能力模块。'
  },
  project: {
    label: '项目推进',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.30)',
    ring: 'rgba(251, 191, 36, 0.42)',
    description: '承接目标、反馈与节奏的具体项目。'
  },
  relationship: {
    label: '关系节点',
    color: '#f9a8d4',
    glow: 'rgba(249, 168, 212, 0.28)',
    ring: 'rgba(249, 168, 212, 0.40)',
    description: '与外部世界连接、反馈和协作的关系层。'
  },
  resource: {
    label: '资源杠杆',
    color: '#c4b5fd',
    glow: 'rgba(196, 181, 253, 0.28)',
    ring: 'rgba(196, 181, 253, 0.42)',
    description: '放大行动效率的工具、资产与支持系统。'
  }
}

function buildGraphPrototypeData(): { nodes: GraphPrototypeNode[]; edges: GraphPrototypeEdge[] } {
  return {
    nodes: [
      {
        id: 'north-star',
        label: '长期成长主线',
        type: 'belief',
        group: 'Direction',
        summary: '把项目、能力、关系与节律串到同一张可推演的成长地图里。',
        tags: ['vision', 'system', 'north-star'],
        x: 850,
        y: 180
      },
      {
        id: 'review-loop',
        label: '复盘回路',
        type: 'belief',
        group: 'Thinking',
        summary: '用复盘持续抽取证据与模式，推动结构更新。',
        tags: ['reflection', 'loop'],
        x: 520,
        y: 280
      },
      {
        id: 'relationship-canvas',
        label: '关系图谱原型',
        type: 'project',
        group: 'Execution',
        summary: '当前要落地的高保真画布原型，用来验证视觉与交互方向。',
        tags: ['prototype', 'canvas', 'graph'],
        x: 910,
        y: 360
      },
      {
        id: 'writing-engine',
        label: '表达输出引擎',
        type: 'skill',
        group: 'Leverage',
        summary: '把认知沉淀成可以复用的写作、讲述和公开表达。',
        tags: ['writing', 'communication'],
        x: 1160,
        y: 310
      },
      {
        id: 'energy-rhythm',
        label: '能量节律',
        type: 'belief',
        group: 'Body',
        summary: '围绕睡眠、训练与恢复建立可长期维持的节奏。',
        tags: ['health', 'rhythm'],
        x: 1230,
        y: 610
      },
      {
        id: 'focus-blocks',
        label: '深度专注块',
        type: 'skill',
        group: 'Execution',
        summary: '通过聚焦时间块让复杂任务持续推进。',
        tags: ['focus', 'execution'],
        x: 1080,
        y: 540
      },
      {
        id: 'peer-feedback',
        label: '关键反馈关系',
        type: 'relationship',
        group: 'People',
        summary: '从高质量关系中获得校准、镜像与推进力。',
        tags: ['feedback', 'people'],
        x: 650,
        y: 560
      },
      {
        id: 'archive-memory',
        label: '资料与记忆库',
        type: 'resource',
        group: 'Infrastructure',
        summary: '承接复盘、任务卡与长期轨迹的可检索存储层。',
        tags: ['memory', 'archive'],
        x: 440,
        y: 500
      },
      {
        id: 'weekly-radar',
        label: '周回看雷达',
        type: 'project',
        group: 'Execution',
        summary: '把最近一周的新节点、旧问题和沉寂点聚到同一视野。',
        tags: ['weekly-review', 'radar'],
        x: 720,
        y: 740
      },
      {
        id: 'tooling-stack',
        label: '桌面工作台',
        type: 'resource',
        group: 'Infrastructure',
        summary: '当前 Electron 工作区，是图谱嵌入的载体与操作面。',
        tags: ['electron', 'workspace'],
        x: 960,
        y: 770
      },
      {
        id: 'opportunity-map',
        label: '机会地图',
        type: 'project',
        group: 'Strategy',
        summary: '把项目、关系与能力联动成可选择的增长机会面。',
        tags: ['opportunity', 'strategy'],
        x: 1280,
        y: 430
      },
      {
        id: 'social-proof',
        label: '外部信号',
        type: 'relationship',
        group: 'People',
        summary: '外部反馈与结果回流，帮助判断当前路径是否有效。',
        tags: ['signal', 'market'],
        x: 1380,
        y: 690
      }
    ],
    edges: [
      { id: 'e1', source: 'north-star', target: 'review-loop' },
      { id: 'e2', source: 'north-star', target: 'relationship-canvas' },
      { id: 'e3', source: 'north-star', target: 'writing-engine' },
      { id: 'e4', source: 'north-star', target: 'opportunity-map' },
      { id: 'e5', source: 'review-loop', target: 'archive-memory' },
      { id: 'e6', source: 'review-loop', target: 'weekly-radar' },
      { id: 'e7', source: 'review-loop', target: 'peer-feedback' },
      { id: 'e8', source: 'relationship-canvas', target: 'tooling-stack' },
      { id: 'e9', source: 'relationship-canvas', target: 'focus-blocks' },
      { id: 'e10', source: 'relationship-canvas', target: 'weekly-radar' },
      { id: 'e11', source: 'writing-engine', target: 'opportunity-map' },
      { id: 'e12', source: 'writing-engine', target: 'social-proof' },
      { id: 'e13', source: 'energy-rhythm', target: 'focus-blocks' },
      { id: 'e14', source: 'focus-blocks', target: 'tooling-stack' },
      { id: 'e15', source: 'peer-feedback', target: 'opportunity-map' },
      { id: 'e16', source: 'archive-memory', target: 'tooling-stack' },
      { id: 'e17', source: 'weekly-radar', target: 'tooling-stack' },
      { id: 'e18', source: 'opportunity-map', target: 'social-proof' },
      { id: 'e19', source: 'peer-feedback', target: 'social-proof' },
      { id: 'e20', source: 'energy-rhythm', target: 'social-proof' }
    ]
  }
}

const GRAPH_DATA = buildGraphPrototypeData()

const GROUPS = Array.from(new Set(GRAPH_DATA.nodes.map((node) => node.group)))
const NODE_TYPES = Object.keys(TYPE_META) as GraphNodeType[]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

function edgeKey(source: string, target: string) {
  return [source, target].sort().join('::')
}

export function GraphPrototype() {
  const [searchQuery, setSearchQuery] = useState('')
  const [graphMode, setGraphMode] = useState<'global' | 'local'>('global')
  const [depth, setDepth] = useState(2)
  const [enabledTypes, setEnabledTypes] = useState<GraphNodeType[]>(NODE_TYPES)
  const [enabledGroups, setEnabledGroups] = useState<string[]>(GROUPS)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('relationship-canvas')
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<GraphViewport>({
    x: 0,
    y: 0,
    zoom: 0.82
  })
  const [isPanning, setIsPanning] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const nodeMap = useMemo(
    () => new Map(GRAPH_DATA.nodes.map((node) => [node.id, node])),
    []
  )

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>()
    GRAPH_DATA.nodes.forEach((node) => {
      map.set(node.id, new Set())
    })
    GRAPH_DATA.edges.forEach((edge) => {
      map.get(edge.source)?.add(edge.target)
      map.get(edge.target)?.add(edge.source)
    })
    return map
  }, [])

  const degreeMap = useMemo(() => {
    const map = new Map<string, number>()
    GRAPH_DATA.nodes.forEach((node) => {
      map.set(node.id, adjacency.get(node.id)?.size ?? 0)
    })
    return map
  }, [adjacency])

  const baseFilteredIds = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return new Set(
      GRAPH_DATA.nodes
        .filter((node) => enabledTypes.includes(node.type) && enabledGroups.includes(node.group))
        .filter((node) => {
          if (!keyword) {
            return true
          }
          const haystacks = [node.label, node.type, node.group, node.summary, ...node.tags].map((item) => item.toLowerCase())
          return haystacks.some((item) => item.includes(keyword))
        })
        .map((node) => node.id)
    )
  }, [enabledGroups, enabledTypes, searchQuery])

  const focusNodeId = useMemo(() => {
    if (selectedNodeId && baseFilteredIds.has(selectedNodeId)) {
      return selectedNodeId
    }
    return GRAPH_DATA.nodes.find((node) => baseFilteredIds.has(node.id))?.id ?? null
  }, [baseFilteredIds, selectedNodeId])

  const visibleNodeIds = useMemo(() => {
    if (graphMode === 'global' || !focusNodeId) {
      return baseFilteredIds
    }

    const visited = new Set<string>([focusNodeId])
    let frontier = new Set<string>([focusNodeId])

    for (let layer = 0; layer < depth; layer += 1) {
      const nextFrontier = new Set<string>()
      frontier.forEach((nodeId) => {
        adjacency.get(nodeId)?.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId)
            nextFrontier.add(neighborId)
          }
        })
      })
      frontier = nextFrontier
    }

    return new Set(Array.from(visited).filter((nodeId) => baseFilteredIds.has(nodeId)))
  }, [adjacency, baseFilteredIds, depth, focusNodeId, graphMode])

  const visibleNodes = useMemo(
    () => GRAPH_DATA.nodes.filter((node) => visibleNodeIds.has(node.id)),
    [visibleNodeIds]
  )

  const visibleEdges = useMemo(
    () =>
      GRAPH_DATA.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)),
    [visibleNodeIds]
  )

  const activeNodeId = hoveredNodeId ?? focusNodeId

  const highlightedNodeIds = useMemo(() => {
    if (!activeNodeId) {
      return new Set<string>()
    }
    return new Set([activeNodeId, ...(adjacency.get(activeNodeId) ?? new Set<string>())])
  }, [activeNodeId, adjacency])

  const highlightedEdgeIds = useMemo(() => {
    if (!activeNodeId) {
      return new Set<string>()
    }
    return new Set(
      GRAPH_DATA.edges
        .filter((edge) => edge.source === activeNodeId || edge.target === activeNodeId)
        .map((edge) => edge.id)
    )
  }, [activeNodeId])

  const selectedNode = focusNodeId ? nodeMap.get(focusNodeId) ?? null : null

  const selectedNeighbors = useMemo(() => {
    if (!selectedNode) {
      return []
    }
    return Array.from(adjacency.get(selectedNode.id) ?? [])
      .map((neighborId) => nodeMap.get(neighborId))
      .filter((neighbor): neighbor is GraphPrototypeNode => Boolean(neighbor))
  }, [adjacency, nodeMap, selectedNode])

  const visibleCountSummary = `${visibleNodes.length} nodes / ${visibleEdges.length} edges`
  const labelOpacityBase = clamp((viewport.zoom - 0.58) / 0.92, 0.08, 1)

  useEffect(() => {
    if (focusNodeId !== selectedNodeId) {
      setSelectedNodeId(focusNodeId)
    }
  }, [focusNodeId, selectedNodeId])

  const handleCanvasPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('[data-graph-node="true"]')) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y
    }
    setIsPanning(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - dragRef.current.startX
    const deltaY = event.clientY - dragRef.current.startY
    setViewport((current) => ({
      ...current,
      x: dragRef.current ? dragRef.current.originX - deltaX / current.zoom : current.x,
      y: dragRef.current ? dragRef.current.originY - deltaY / current.zoom : current.y
    }))
  }

  const releaseCanvasPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
      setIsPanning(false)
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleCanvasWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault()
    const svg = svgRef.current
    if (!svg) {
      return
    }

    const rect = svg.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top

    setViewport((current) => {
      const nextZoom = clamp(current.zoom * (event.deltaY > 0 ? 0.92 : 1.08), 0.5, 2.2)
      const viewWidth = GRAPH_WIDTH / current.zoom
      const viewHeight = GRAPH_HEIGHT / current.zoom
      const worldX = current.x + (offsetX / rect.width) * viewWidth
      const worldY = current.y + (offsetY / rect.height) * viewHeight

      return {
        zoom: nextZoom,
        x: worldX - (offsetX / rect.width) * (GRAPH_WIDTH / nextZoom),
        y: worldY - (offsetY / rect.height) * (GRAPH_HEIGHT / nextZoom)
      }
    })
  }

  const resetViewport = () => {
    setViewport({ x: 0, y: 0, zoom: 0.82 })
  }

  return (
    <>
      <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.26em] text-base-500">graph controls</div>
            <h2 className="mt-2 text-lg font-semibold text-base-100">关系图谱原型</h2>
          </div>
          <div className="rounded-full border border-accent-cyan/15 bg-accent-cyan/10 px-3 py-1 text-xs text-accent-cyan">
            mock data
          </div>
        </div>

        <div className="mt-5 rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
          <label className="block text-xs uppercase tracking-[0.22em] text-base-500">节点搜索</label>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索标签、分组、摘要"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-base-950/70 px-4 py-3 text-sm text-base-100 outline-none placeholder:text-base-500"
          />
          <div className="mt-3 text-xs text-base-500">{visibleCountSummary}</div>
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-[0.22em] text-base-500">图谱范围</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['global', '全局图'],
              ['local', '局部图']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setGraphMode(value as 'global' | 'local')}
                className={
                  graphMode === value
                    ? 'rounded-2xl border border-accent-cyan/25 bg-accent-cyan/14 px-4 py-3 text-sm text-base-100'
                    : 'rounded-2xl border border-white/8 bg-base-850/60 px-4 py-3 text-sm text-base-400'
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-[24px] border border-white/8 bg-base-950/40 px-4 py-4">
            <div className="flex items-center justify-between text-sm text-base-300">
              <span>局部深度</span>
              <span>{depth}</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={depth}
              onChange={(event) => setDepth(Number(event.target.value))}
              disabled={graphMode !== 'local'}
              className="mt-3 h-2 w-full accent-cyan disabled:opacity-40"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs uppercase tracking-[0.22em] text-base-500">类型着色</div>
          <div className="mt-3 space-y-2">
            {NODE_TYPES.map((type) => {
              const meta = TYPE_META[type]
              const enabled = enabledTypes.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEnabledTypes((current) => toggleValue(current, type))}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                    enabled
                      ? 'border-white/12 bg-white/[0.04] text-base-100'
                      : 'border-white/6 bg-transparent text-base-500'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: meta.color, boxShadow: `0 0 16px ${meta.glow}` }}
                    />
                    <span className="text-sm">{meta.label}</span>
                  </span>
                  <span className="text-xs text-base-500">{type}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1">
          <div className="text-xs uppercase tracking-[0.22em] text-base-500">分组过滤</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {GROUPS.map((group) => {
              const enabled = enabledGroups.includes(group)
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setEnabledGroups((current) => toggleValue(current, group))}
                  className={
                    enabled
                      ? 'rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-base-200'
                      : 'rounded-full border border-white/6 px-3 py-2 text-xs text-base-500'
                  }
                >
                  {group}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/8 bg-base-950/55 p-4 text-xs leading-6 text-base-400">
          <div className="uppercase tracking-[0.2em] text-base-500">Next adapter</div>
          <div className="mt-2">
            下一轮从 <code>buildGraphPrototypeData()</code> 替换为真实节点与关系映射，不改交互层。
          </div>
        </div>
      </ShellCard>

      <ShellCard className="relative h-full min-h-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[12%] h-56 w-56 rounded-full bg-accent-cyan/10 blur-[100px]" />
          <div className="absolute right-[12%] top-[18%] h-64 w-64 rounded-full bg-fuchsia-400/8 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[28%] h-72 w-72 rounded-full bg-accent-green/8 blur-[140px]" />
        </div>

        <div className="relative flex items-center justify-between border-b border-white/6 px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-base-500">relationship canvas</div>
            <h2 className="mt-2 text-lg font-semibold text-base-100">思考地图画布</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-base-300">
              zoom {viewport.zoom.toFixed(2)}x
            </div>
            <button
              type="button"
              onClick={resetViewport}
              className="rounded-full border border-white/10 bg-base-950/60 px-3 py-1 text-xs text-base-200"
            >
              reset view
            </button>
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`${viewport.x} ${viewport.y} ${GRAPH_WIDTH / viewport.zoom} ${GRAPH_HEIGHT / viewport.zoom}`}
          className={clsx('relative h-[calc(100%-89px)] w-full touch-none', isPanning ? 'cursor-grabbing' : 'cursor-grab')}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={releaseCanvasPointer}
          onPointerLeave={() => setHoveredNodeId(null)}
          onPointerCancel={releaseCanvasPointer}
          onWheel={handleCanvasWheel}
        >
          <defs>
            <pattern id="graph-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
            </pattern>
            <radialGradient id="vignette" cx="50%" cy="42%" r="68%">
              <stop offset="0%" stopColor="rgba(12, 18, 24, 0)" />
              <stop offset="100%" stopColor="rgba(4, 6, 10, 0.62)" />
            </radialGradient>
          </defs>

          <rect x={viewport.x} y={viewport.y} width={GRAPH_WIDTH / viewport.zoom} height={GRAPH_HEIGHT / viewport.zoom} fill="#0a0f16" />
          <rect x={viewport.x} y={viewport.y} width={GRAPH_WIDTH / viewport.zoom} height={GRAPH_HEIGHT / viewport.zoom} fill="url(#graph-grid)" />

          {visibleEdges.map((edge) => {
            const source = nodeMap.get(edge.source)
            const target = nodeMap.get(edge.target)
            if (!source || !target) {
              return null
            }
            const isHighlighted = highlightedEdgeIds.has(edge.id)
            const hasFocus = highlightedNodeIds.size > 0
            const edgeOpacity = hasFocus ? (isHighlighted ? 0.9 : 0.12) : 0.34
            return (
              <g key={edge.id}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#c8ebff' : 'rgba(142, 167, 196, 0.42)'}
                  strokeWidth={isHighlighted ? 2.2 : 1.15}
                  strokeOpacity={edgeOpacity}
                />
              </g>
            )
          })}

          {visibleNodes.map((node) => {
            const meta = TYPE_META[node.type]
            const degree = degreeMap.get(node.id) ?? 0
            const radius = 14 + degree * 2.5
            const isSelected = node.id === focusNodeId
            const isHovered = node.id === hoveredNodeId
            const isHighlighted = highlightedNodeIds.has(node.id)
            const hasFocus = highlightedNodeIds.size > 0
            const nodeOpacity = hasFocus ? (isHighlighted ? 1 : 0.14) : 1
            const labelOpacity = isSelected || isHovered ? 1 : labelOpacityBase * (hasFocus && !isHighlighted ? 0.4 : 0.82)

            return (
              <g
                key={node.id}
                data-graph-node="true"
                transform={`translate(${node.x}, ${node.y})`}
                style={{ opacity: nodeOpacity, transition: 'opacity 140ms ease' }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <circle r={radius + 10} fill={meta.glow} opacity={isSelected || isHovered ? 0.72 : 0.34} />
                <circle
                  r={radius + 2.5}
                  fill="rgba(9, 13, 18, 0.96)"
                  stroke={isSelected ? meta.ring : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isSelected ? 2.2 : 1}
                />
                <circle r={radius} fill={meta.color} fillOpacity={isSelected ? 0.96 : 0.84} />
                <text
                  x={radius + 12}
                  y={4}
                  fill="rgba(237,242,247,0.96)"
                  fontSize={16}
                  fontWeight={isSelected ? 600 : 500}
                  opacity={labelOpacity}
                  style={{ userSelect: 'none', pointerEvents: 'none', transition: 'opacity 140ms ease' }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}

          <rect
            x={viewport.x}
            y={viewport.y}
            width={GRAPH_WIDTH / viewport.zoom}
            height={GRAPH_HEIGHT / viewport.zoom}
            fill="url(#vignette)"
            pointerEvents="none"
          />
        </svg>
      </ShellCard>

      <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden p-6">
        <div className="text-xs uppercase tracking-[0.24em] text-base-500">node detail</div>
        {selectedNode ? (
          <>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-base-100">{selectedNode.label}</h2>
                <p className="mt-3 text-sm leading-7 text-base-300">{selectedNode.summary}</p>
              </div>
              <span
                className="rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: TYPE_META[selectedNode.type].ring,
                  color: TYPE_META[selectedNode.type].color,
                  backgroundColor: 'rgba(255,255,255,0.03)'
                }}
              >
                {TYPE_META[selectedNode.type].label}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{selectedNode.group}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
                degree {degreeMap.get(selectedNode.id) ?? 0}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
                {graphMode === 'local' ? `depth ${depth}` : 'global mode'}
              </span>
            </div>

            <div className="mt-6 rounded-[26px] border border-white/8 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-base-500">Type Meta</div>
              <div className="mt-2 text-sm leading-7 text-base-300">{TYPE_META[selectedNode.type].description}</div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-base-300">
              <InfoRow label="局部邻居" value={`${selectedNeighbors.length} 个`} />
              <InfoRow label="当前模式" value={graphMode === 'local' ? '局部图探索' : '全局图总览'} />
              <InfoRow label="搜索状态" value={searchQuery.trim() ? `filter: ${searchQuery}` : '未加关键词'} />
              <InfoRow label="数据来源" value="mock prototype only" />
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium text-base-200">标签</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedNode.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-base-950/45 px-3 py-2 text-xs text-base-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 min-h-0 flex-1 overflow-auto">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-base-200">关联邻居</div>
                <div className="text-xs text-base-500">{selectedNeighbors.length} linked</div>
              </div>
              <div className="mt-3 space-y-3 pr-1">
                {selectedNeighbors.map((neighbor) => {
                  const isEdgeVisible = visibleEdges.some(
                    (edge) => edgeKey(edge.source, edge.target) === edgeKey(selectedNode.id, neighbor.id)
                  )
                  return (
                    <button
                      key={neighbor.id}
                      type="button"
                      onClick={() => setSelectedNodeId(neighbor.id)}
                      className="block w-full rounded-[24px] border border-white/8 bg-base-850/60 px-4 py-4 text-left transition hover:border-white/14"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-base-100">{neighbor.label}</div>
                          <div className="mt-2 text-xs text-base-400">{neighbor.group}</div>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-base-300">
                          {isEdgeVisible ? 'visible' : 'filtered'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-sm leading-7 text-base-400">
            当前过滤条件下没有可展示节点。调整类型、分组或搜索条件后，右侧会显示新的节点详情。
          </div>
        )}
      </ShellCard>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-base-850/55 px-4 py-3">
      <span className="text-base-500">{label}</span>
      <span className="text-base-100">{value}</span>
    </div>
  )
}
