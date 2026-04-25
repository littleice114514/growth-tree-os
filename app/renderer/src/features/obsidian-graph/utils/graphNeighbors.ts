import type { Link } from '../types'

export function getNodeId(value: string | { id?: string }) {
  return typeof value === 'string' ? value : value.id ?? ''
}

export function getNeighborIds(nodeId: string | null, links: Link[]) {
  const neighbors = new Set<string>()
  if (!nodeId) {
    return neighbors
  }

  links.forEach((link) => {
    if (link.source === nodeId) {
      neighbors.add(link.target)
    }
    if (link.target === nodeId) {
      neighbors.add(link.source)
    }
  })

  return neighbors
}

export function getHighlightIds(nodeId: string | null, links: Link[]) {
  const ids = getNeighborIds(nodeId, links)
  if (nodeId) {
    ids.add(nodeId)
  }
  return ids
}

export function getNodeDegree(nodeId: string, links: Link[]) {
  return links.filter((link) => link.source === nodeId || link.target === nodeId).length
}
