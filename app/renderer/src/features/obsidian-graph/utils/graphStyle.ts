import type { Link, Node, ObsidianGraphLinkType, ObsidianGraphNodeType } from '../types'

export const nodeTypeMeta: Record<ObsidianGraphNodeType, { label: string; color: string; muted: string }> = {
  note: { label: 'Note', color: '#9ca3af', muted: 'rgba(156, 163, 175, 0.24)' },
  tag: { label: 'Tag', color: '#7dd3fc', muted: 'rgba(125, 211, 252, 0.24)' },
  daily: { label: 'Daily', color: '#fbbf24', muted: 'rgba(251, 191, 36, 0.24)' },
  project: { label: 'Project', color: '#86efac', muted: 'rgba(134, 239, 172, 0.24)' }
}

export const linkTypeMeta: Record<ObsidianGraphLinkType, { label: string; color: string }> = {
  link: { label: 'Link', color: '148, 163, 184' },
  'tag-ref': { label: 'Tag Ref', color: '125, 211, 252' },
  timeline: { label: 'Timeline', color: '251, 191, 36' },
  'parent-child': { label: 'Parent Child', color: '134, 239, 172' }
}

const GRAPH_VISIBILITY = {
  nodeDefaultOpacity: 0.88,
  nodeRelatedOpacity: 1,
  nodeDimmedOpacity: 0.42,
  linkDefaultOpacity: 0.3,
  linkRelatedOpacity: 0.88,
  linkDimmedOpacity: 0.16,
  labelDefaultOpacity: 0.62,
  labelRelatedOpacity: 0.95,
  labelDimmedOpacity: 0.38
} as const

export function getNodeColor(node: Node, highlightIds: Set<string>, hasFocus: boolean) {
  const meta = nodeTypeMeta[node.type]
  if (!hasFocus || highlightIds.has(node.id)) {
    return meta.color
  }
  return meta.muted
}

export function getNodeOpacity(node: Node, highlightIds: Set<string>, hasFocus: boolean) {
  if (!hasFocus) {
    return GRAPH_VISIBILITY.nodeDefaultOpacity
  }
  return highlightIds.has(node.id) ? GRAPH_VISIBILITY.nodeRelatedOpacity : GRAPH_VISIBILITY.nodeDimmedOpacity
}

export function getLinkColor(link: Link, highlightIds: Set<string>, hasFocus: boolean) {
  const opacity = getLinkOpacity(link, highlightIds, hasFocus)
  return `rgba(${linkTypeMeta[link.type].color}, ${opacity})`
}

export function getLinkWidth(link: Link, highlightIds: Set<string>, hasFocus: boolean) {
  return isRelatedLink(link, highlightIds, hasFocus) ? 1.45 : 0.85
}

export function getLinkOpacity(link: Link, highlightIds: Set<string>, hasFocus: boolean) {
  if (!hasFocus) {
    return GRAPH_VISIBILITY.linkDefaultOpacity
  }
  return isRelatedLink(link, highlightIds, hasFocus)
    ? GRAPH_VISIBILITY.linkRelatedOpacity
    : GRAPH_VISIBILITY.linkDimmedOpacity
}

export function getLabelOpacity(node: Node, highlightIds: Set<string>, hasFocus: boolean) {
  if (!hasFocus) {
    return GRAPH_VISIBILITY.labelDefaultOpacity
  }
  return highlightIds.has(node.id) ? GRAPH_VISIBILITY.labelRelatedOpacity : GRAPH_VISIBILITY.labelDimmedOpacity
}

function isRelatedLink(link: Link, highlightIds: Set<string>, hasFocus: boolean) {
  return !hasFocus || (highlightIds.has(link.source) && highlightIds.has(link.target))
}
