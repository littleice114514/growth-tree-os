import { create } from 'zustand'
import type { NodePosition, ObsidianGraphMode, ObsidianGraphNodeType, PositionMap } from '../types'

type ObsidianGraphState = {
  searchQuery: string
  selectedNodeId: string | null
  hoveredNodeId: string | null
  draggingNodeId: string | null
  isDragging: boolean
  isViewportLocked: boolean
  positions: PositionMap
  mode: ObsidianGraphMode
  depth: 1 | 2 | 3
  showArrows: boolean
  nodeSize: number
  linkDistance: number
  repelForce: number
  enabledTypes: ObsidianGraphNodeType[]
  setSearchQuery: (searchQuery: string) => void
  setSelectedNodeId: (selectedNodeId: string | null) => void
  setHoveredNodeId: (hoveredNodeId: string | null) => void
  startDragging: (nodeId: string) => void
  endDragging: () => void
  setNodePosition: (nodeId: string, position: NodePosition) => void
  setManyNodePositions: (positions: PositionMap) => void
  clearPositions: () => void
  setMode: (mode: ObsidianGraphMode) => void
  setDepth: (depth: 1 | 2 | 3) => void
  setShowArrows: (showArrows: boolean) => void
  setNodeSize: (nodeSize: number) => void
  setLinkDistance: (linkDistance: number) => void
  setRepelForce: (repelForce: number) => void
  toggleType: (nodeType: ObsidianGraphNodeType) => void
}

const allTypes: ObsidianGraphNodeType[] = ['note', 'tag', 'daily', 'project']

function isSamePosition(a: NodePosition | undefined, b: NodePosition) {
  return a?.x === b.x && a.y === b.y && a.fx === b.fx && a.fy === b.fy
}

export const useObsidianGraphStore = create<ObsidianGraphState>((set, get) => ({
  searchQuery: '',
  selectedNodeId: 'project-graph-v1',
  hoveredNodeId: null,
  draggingNodeId: null,
  isDragging: false,
  isViewportLocked: false,
  positions: {},
  mode: 'global',
  depth: 2,
  showArrows: false,
  nodeSize: 5,
  linkDistance: 86,
  repelForce: -115,
  enabledTypes: allTypes,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setHoveredNodeId: (hoveredNodeId) => {
    if (get().isDragging) {
      return
    }
    set({ hoveredNodeId })
  },
  startDragging: (nodeId) =>
    set({
      draggingNodeId: nodeId,
      isDragging: true,
      isViewportLocked: true,
      hoveredNodeId: nodeId
    }),
  endDragging: () => set({ draggingNodeId: null, isDragging: false, isViewportLocked: false }),
  setNodePosition: (nodeId, position) => {
    const current = get().positions
    if (isSamePosition(current[nodeId], position)) {
      return
    }
    set({
      positions: {
        ...current,
        [nodeId]: position
      }
    })
  },
  setManyNodePositions: (positions) => {
    const current = get().positions
    let changed = false
    const next = { ...current }

    Object.entries(positions).forEach(([nodeId, position]) => {
      if (!isSamePosition(current[nodeId], position)) {
        next[nodeId] = position
        changed = true
      }
    })

    if (changed) {
      set({ positions: next })
    }
  },
  clearPositions: () => set({ positions: {} }),
  setMode: (mode) => set({ mode }),
  setDepth: (depth) => set({ depth }),
  setShowArrows: (showArrows) => set({ showArrows }),
  setNodeSize: (nodeSize) => set({ nodeSize }),
  setLinkDistance: (linkDistance) => set({ linkDistance }),
  setRepelForce: (repelForce) => set({ repelForce }),
  toggleType: (nodeType) => {
    const enabledTypes = get().enabledTypes
    if (enabledTypes.includes(nodeType) && enabledTypes.length === 1) {
      return
    }
    set({
      enabledTypes: enabledTypes.includes(nodeType)
        ? enabledTypes.filter((item) => item !== nodeType)
        : [...enabledTypes, nodeType]
    })
  }
}))
