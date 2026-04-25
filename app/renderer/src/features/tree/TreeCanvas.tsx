import { useEffect, useMemo, useRef } from 'react'
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type NodeProps
} from '@xyflow/react'
import clsx from 'clsx'
import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'
import { useThemeMode } from '@/app/theme'
import { formatDateTime } from '@/services/time'

const statusStyles = {
  new: 'border-[color:var(--status-new)] bg-[var(--node-fill)]',
  growing: 'border-[color:var(--status-growing)] bg-[var(--node-fill)]',
  stable: 'border-[color:var(--status-stable)] bg-[var(--node-fill)]',
  dormant: 'border-[color:var(--status-dormant)] bg-[var(--node-fill)]',
  review: 'border-[color:var(--status-review)] bg-[var(--node-fill)]',
  restarted: 'border-[color:var(--status-restarted)] bg-[var(--node-fill)]'
} as const

const statusDots = {
  new: 'bg-[var(--status-new)]',
  growing: 'bg-[var(--status-growing)]',
  stable: 'bg-[var(--status-stable)]',
  dormant: 'bg-[var(--status-dormant)]',
  review: 'bg-[var(--status-review)]',
  restarted: 'bg-[var(--status-restarted)]'
} as const

function GraphNode({ data, selected }: NodeProps) {
  const nodeData = data as {
    title: string
    nodeType: string
    status: keyof typeof statusStyles
    relation: 'active' | 'neighbor' | 'dim' | 'idle'
  }
  const isMainline = nodeData.nodeType === 'mainline'
  const isActive = nodeData.relation === 'active' || selected
  const isNeighbor = nodeData.relation === 'neighbor'

  return (
    <div
      className={clsx(
        'relative flex h-full w-full items-center gap-2 rounded-[inherit] border text-left transition duration-150',
        isMainline
          ? 'justify-center px-3 text-[12px] font-semibold tracking-[0.04em] text-[color:var(--node-text)]'
          : clsx('px-2.5 text-[11px] text-[color:var(--node-text)]', statusStyles[nodeData.status]),
        isActive ? 'scale-[1.04] ring-1 ring-[color:var(--node-selected-border)]' : '',
        isNeighbor ? 'ring-1 ring-[color:var(--node-neighbor-border)]' : ''
      )}
    >
      {!isMainline ? (
        <span
          className={clsx(
            'h-2 w-2 shrink-0 rounded-full shadow-[0_0_12px_currentColor]',
            statusDots[nodeData.status],
            isActive ? 'opacity-100' : isNeighbor ? 'opacity-80' : 'opacity-55'
          )}
        />
      ) : null}
      <span className={clsx('truncate', isMainline ? 'tracking-[0.04em]' : 'max-w-full')}>{nodeData.title}</span>
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}

const nodeTypes = {
  graphNode: GraphNode
}

const graphPalette = {
  nodeText: 'var(--node-text)',
  mainlineBackground: 'var(--node-mainline-fill)',
  nodeBackground: 'var(--node-fill)',
  activeNodeBackground: 'var(--node-selected-fill)',
  activeBorder: 'var(--node-selected-border)',
  neighborBorder: 'var(--node-neighbor-border)',
  idleBorder: 'var(--node-border)',
  activeShadow: 'var(--shadow-node-selected)',
  neighborShadow: 'var(--shadow-node-neighbor)',
  idleShadow: 'var(--shadow-node)',
  activeEdge: 'var(--edge-emphasis)',
  idleEdge: 'var(--edge-default)',
  dimEdge: 'var(--edge-muted)',
  minimapMask: 'var(--minimap-mask)',
  minimapNode: 'var(--minimap-node)',
  grid: 'var(--graph-grid)'
} as const

export function TreeCanvas() {
  const { themeMode } = useThemeMode()
  const palette = graphPalette
  const tree = useWorkspaceStore((state) => state.tree)
  const hoverCard = useWorkspaceStore((state) => state.hoverCard)
  const setHoverCard = useWorkspaceStore((state) => state.setHoverCard)
  const hoveredNodeId = useWorkspaceStore((state) => state.hoveredNodeId)
  const setHoveredNodeId = useWorkspaceStore((state) => state.setHoveredNodeId)
  const selectNode = useWorkspaceStore((state) => state.selectNode)
  const selectedNodeId = useWorkspaceStore((state) => state.selectedNodeId)
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId)
  const searchQuery = useWorkspaceStore((state) => state.searchQuery)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const flowRef = useRef<ReactFlowInstance | null>(null)

  const filteredTree = useMemo(() => {
    if (!tree || !searchQuery.trim()) {
      return tree
    }

    const keyword = searchQuery.trim().toLowerCase()
    const matchedIds = new Set(
      tree.nodes
        .filter(
          (item) =>
            item.title.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword) ||
            item.domain.toLowerCase().includes(keyword)
        )
        .map((item) => item.id)
    )

    tree.edges.forEach((edge) => {
      if (matchedIds.has(edge.targetNodeId)) {
        matchedIds.add(edge.sourceNodeId)
      }
    })

    return {
      ...tree,
      nodes: tree.nodes.filter((item) => matchedIds.has(item.id)),
      edges: tree.edges.filter((item) => matchedIds.has(item.sourceNodeId) && matchedIds.has(item.targetNodeId))
    }
  }, [tree, searchQuery])

  const highlightIds = useMemo(() => {
    const activeId = hoveredNodeId ?? focusedNodeId ?? selectedNodeId
    if (!activeId || !filteredTree) {
      return new Set<string>()
    }

    const ids = new Set<string>([activeId])
    filteredTree.edges.forEach((edge) => {
      if (edge.sourceNodeId === activeId) {
        ids.add(edge.targetNodeId)
      }
      if (edge.targetNodeId === activeId) {
        ids.add(edge.sourceNodeId)
      }
    })
    return ids
  }, [filteredTree, focusedNodeId, hoveredNodeId, selectedNodeId])

  const activeNodeId = hoveredNodeId ?? focusedNodeId ?? selectedNodeId

  const nodes = useMemo<Node[]>(() => {
    return (filteredTree?.nodes ?? []).map((item) => ({
      id: item.id,
      position: item.position,
      data: {
        ...item,
        relation: !activeNodeId ? 'idle' : activeNodeId === item.id ? 'active' : highlightIds.has(item.id) ? 'neighbor' : 'dim'
      },
      draggable: false,
      selectable: true,
      type: 'graphNode',
      zIndex: activeNodeId === item.id ? 30 : highlightIds.has(item.id) ? 20 : 1,
      style: {
        width: item.nodeType === 'mainline' ? 150 : Math.max(70, Math.min(116, 62 + item.title.length * 3.4)),
        height: item.nodeType === 'mainline' ? 36 : 26,
        borderRadius: 999,
        border:
          activeNodeId === item.id
            ? `1px solid ${palette.activeBorder}`
            : highlightIds.has(item.id)
              ? `1px solid ${palette.neighborBorder}`
              : `1px solid ${palette.idleBorder}`,
        color: palette.nodeText,
        background:
          item.nodeType === 'mainline'
            ? palette.mainlineBackground
            : activeNodeId === item.id
              ? palette.activeNodeBackground
              : palette.nodeBackground,
        boxShadow:
          activeNodeId === item.id
            ? palette.activeShadow
            : highlightIds.has(item.id)
              ? palette.neighborShadow
              : palette.idleShadow,
        opacity:
          highlightIds.size === 0 || highlightIds.has(item.id)
            ? 1
            : item.nodeType === 'mainline'
              ? 0.34
              : 0.14,
        transition: 'opacity 140ms ease, box-shadow 140ms ease, border-color 140ms ease'
      },
      className: item.nodeType === 'mainline' ? 'mainline-node text-xs font-semibold' : clsx(statusStyles[item.status], 'text-[11px]')
    }))
  }, [activeNodeId, filteredTree, highlightIds, palette, themeMode])

  const edges = useMemo<Edge[]>(() => {
    return (filteredTree?.edges ?? []).map((item) => ({
      id: item.id,
      source: item.sourceNodeId,
      target: item.targetNodeId,
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color:
          activeNodeId && (item.sourceNodeId === activeNodeId || item.targetNodeId === activeNodeId)
            ? palette.activeEdge
            : palette.idleEdge
      },
      style: {
        stroke:
          activeNodeId && (item.sourceNodeId === activeNodeId || item.targetNodeId === activeNodeId)
            ? palette.activeEdge
            : highlightIds.size === 0
              ? palette.idleEdge
              : palette.dimEdge,
        strokeWidth: activeNodeId && (item.sourceNodeId === activeNodeId || item.targetNodeId === activeNodeId) ? 1.7 : 1.05,
        opacity:
          highlightIds.size === 0
            ? 0.5
            : activeNodeId && (item.sourceNodeId === activeNodeId || item.targetNodeId === activeNodeId)
              ? 0.9
              : 0.12
      },
      type: 'smoothstep'
    }))
  }, [activeNodeId, filteredTree, highlightIds, palette, themeMode])

  const handleNodeHover: NodeMouseHandler = (event, node) => {
    const data = node.data as { title: string; createdAt: string; updatedAt: string; id: string }
    const rootRect = frameRef.current?.getBoundingClientRect()
    const nodeElement = frameRef.current?.querySelector(`[data-id="${node.id}"]`) as HTMLDivElement | null
    const nodeRect = nodeElement?.getBoundingClientRect()
    const fallbackX = event.clientX - (rootRect?.left ?? 0)
    const fallbackY = event.clientY - (rootRect?.top ?? 0)
    setHoveredNodeId(data.id)
    setHoverCard({
      nodeId: data.id,
      title: data.title,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      x: nodeRect && rootRect ? nodeRect.left - rootRect.left + nodeRect.width / 2 : fallbackX,
      y: nodeRect && rootRect ? nodeRect.top - rootRect.top - 14 : fallbackY
    })
  }

  useEffect(() => {
    if (!focusedNodeId || !flowRef.current || !filteredTree) {
      return
    }

    const target = filteredTree.nodes.find((item) => item.id === focusedNodeId)
    if (!target) {
      return
    }

    flowRef.current.setCenter(target.position.x, target.position.y, {
      zoom: target.nodeType === 'mainline' ? 0.92 : 1.1,
      duration: 360
    })
  }, [filteredTree, focusedNodeId])

  return (
    <ShellCard className="relative h-full overflow-hidden border-[color:var(--panel-border)] bg-[var(--graph-bg)]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] px-4 py-3 shadow-panel backdrop-blur-xl">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">growth graph</div>
        <div className="mt-1 flex items-end gap-3">
          <h2 className="text-base font-semibold text-[color:var(--text-primary)]">成长树主画布</h2>
          <span className="pb-0.5 text-xs text-[color:var(--text-muted)]">{filteredTree?.nodes.length ?? 0} nodes</span>
        </div>
      </div>

      <div ref={frameRef} className="h-full">
        <ReactFlow
          fitView
          fitViewOptions={{ padding: 0.14 }}
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onInit={(instance) => {
            flowRef.current = instance
          }}
          onNodeClick={(_event, node) => void selectNode(node.id)}
          onNodeMouseEnter={handleNodeHover}
          onNodeMouseLeave={() => {
            setHoveredNodeId(null)
            setHoverCard(null)
          }}
          zoomOnScroll
          panOnScroll={false}
          panOnDrag
          preventScrolling
        >
          <MiniMap
            pannable
            zoomable
            maskColor={palette.minimapMask}
            nodeBorderRadius={8}
            nodeColor={(node) => ((node.data as { nodeType: string }).nodeType === 'mainline' ? palette.activeEdge : palette.minimapNode)}
          />
          <Controls showInteractive={false} />
          <Background color={palette.grid} gap={30} />
        </ReactFlow>
      </div>

      {hoverCard ? (
        <div
          className="pointer-events-none absolute z-20 min-w-52 rounded-2xl border border-[color:var(--node-selected-border)] bg-[var(--overlay-bg)] px-4 py-3 text-sm shadow-panel backdrop-blur-xl"
          style={{ left: hoverCard.x, top: hoverCard.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="font-medium text-[color:var(--text-primary)]">{hoverCard.title}</div>
          <div className="mt-2 text-xs text-[color:var(--text-secondary)]">创建于 {formatDateTime(hoverCard.createdAt)}</div>
          <div className="mt-1 text-xs text-[color:var(--text-secondary)]">最近修改 {formatDateTime(hoverCard.updatedAt)}</div>
        </div>
      ) : null}
    </ShellCard>
  )
}
