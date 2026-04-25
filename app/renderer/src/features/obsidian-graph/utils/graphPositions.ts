import type { ForceGraphNode, Node, NodePosition, PositionMap } from '../types'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function toNodePosition(node: ForceGraphNode, fixed = true): NodePosition | null {
  if (!isNumber(node.x) || !isNumber(node.y)) {
    return null
  }

  return {
    x: node.x,
    y: node.y,
    fx: fixed ? node.x : node.fx ?? null,
    fy: fixed ? node.y : node.fy ?? null
  }
}

export function mergeGraphPositions<T extends Node>(nodes: T[], positions: PositionMap): ForceGraphNode[] {
  return nodes.map((node) => {
    const existingNode = node as ForceGraphNode
    const stored = positions[node.id]
    const merged: ForceGraphNode = { ...node }

    if (stored) {
      merged.x = stored.x
      merged.y = stored.y
      if (isNumber(stored.fx)) {
        merged.fx = stored.fx
      }
      if (isNumber(stored.fy)) {
        merged.fy = stored.fy
      }
      return merged
    }

    if (isNumber(existingNode.x)) {
      merged.x = existingNode.x
    }
    if (isNumber(existingNode.y)) {
      merged.y = existingNode.y
    }
    if (isNumber(existingNode.fx)) {
      merged.fx = existingNode.fx
    }
    if (isNumber(existingNode.fy)) {
      merged.fy = existingNode.fy
    }

    return merged
  })
}

export function captureGraphPositions(nodes: ForceGraphNode[], fixed = false): PositionMap {
  return nodes.reduce<PositionMap>((acc, node) => {
    const position = toNodePosition(node, fixed)
    if (position) {
      acc[node.id] = position
    }
    return acc
  }, {})
}
