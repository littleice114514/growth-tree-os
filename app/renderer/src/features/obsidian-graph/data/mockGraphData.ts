import type { ObsidianGraphData } from '../types'

export const mockGraphData: ObsidianGraphData = {
  nodes: [
    {
      id: 'note-growth-loop',
      label: '成长闭环笔记',
      type: 'note',
      createdAt: '2026-04-01T09:20:00.000Z',
      updatedAt: '2026-04-18T21:10:00.000Z'
    },
    {
      id: 'tag-reflection',
      label: '#复盘',
      type: 'tag',
      createdAt: '2026-04-02T10:00:00.000Z',
      updatedAt: '2026-04-19T08:30:00.000Z'
    },
    {
      id: 'daily-2026-04-16',
      label: '2026-04-16 Daily',
      type: 'daily',
      createdAt: '2026-04-16T22:20:00.000Z',
      updatedAt: '2026-04-16T22:50:00.000Z'
    },
    {
      id: 'project-graph-v1',
      label: 'Obsidian Graph V1',
      type: 'project',
      createdAt: '2026-04-18T14:10:00.000Z',
      updatedAt: '2026-04-20T11:35:00.000Z'
    },
    {
      id: 'note-energy-map',
      label: '能量管理地图',
      type: 'note',
      createdAt: '2026-04-04T08:00:00.000Z',
      updatedAt: '2026-04-19T20:15:00.000Z'
    },
    {
      id: 'tag-energy',
      label: '#能量',
      type: 'tag',
      createdAt: '2026-04-04T08:10:00.000Z',
      updatedAt: '2026-04-19T20:15:00.000Z'
    },
    {
      id: 'daily-2026-04-18',
      label: '2026-04-18 Daily',
      type: 'daily',
      createdAt: '2026-04-18T23:00:00.000Z',
      updatedAt: '2026-04-18T23:18:00.000Z'
    },
    {
      id: 'project-writing-system',
      label: '表达输出系统',
      type: 'project',
      createdAt: '2026-04-05T10:45:00.000Z',
      updatedAt: '2026-04-20T09:05:00.000Z'
    },
    {
      id: 'note-writing-rhythm',
      label: '每日成稿节奏',
      type: 'note',
      createdAt: '2026-04-06T15:00:00.000Z',
      updatedAt: '2026-04-20T09:05:00.000Z'
    },
    {
      id: 'tag-output',
      label: '#输出',
      type: 'tag',
      createdAt: '2026-04-06T15:20:00.000Z',
      updatedAt: '2026-04-20T09:05:00.000Z'
    },
    {
      id: 'daily-2026-04-19',
      label: '2026-04-19 Daily',
      type: 'daily',
      createdAt: '2026-04-19T22:15:00.000Z',
      updatedAt: '2026-04-19T22:45:00.000Z'
    },
    {
      id: 'project-weekly-radar',
      label: '周回看雷达',
      type: 'project',
      createdAt: '2026-04-08T09:30:00.000Z',
      updatedAt: '2026-04-20T10:00:00.000Z'
    },
    {
      id: 'note-problem-loop',
      label: '重复问题识别',
      type: 'note',
      createdAt: '2026-04-09T18:20:00.000Z',
      updatedAt: '2026-04-20T10:00:00.000Z'
    },
    {
      id: 'tag-problem',
      label: '#问题',
      type: 'tag',
      createdAt: '2026-04-09T18:30:00.000Z',
      updatedAt: '2026-04-20T10:00:00.000Z'
    },
    {
      id: 'daily-2026-04-20',
      label: '2026-04-20 Daily',
      type: 'daily',
      createdAt: '2026-04-20T22:00:00.000Z',
      updatedAt: '2026-04-20T22:20:00.000Z'
    },
    {
      id: 'note-relationship-feedback',
      label: '关键反馈关系',
      type: 'note',
      createdAt: '2026-04-10T11:00:00.000Z',
      updatedAt: '2026-04-19T18:10:00.000Z'
    }
  ],
  links: [
    { source: 'note-growth-loop', target: 'tag-reflection', type: 'tag-ref' },
    { source: 'note-growth-loop', target: 'daily-2026-04-16', type: 'timeline' },
    { source: 'note-growth-loop', target: 'project-weekly-radar', type: 'parent-child' },
    { source: 'note-growth-loop', target: 'note-problem-loop', type: 'link' },
    { source: 'project-graph-v1', target: 'note-growth-loop', type: 'link' },
    { source: 'project-graph-v1', target: 'project-weekly-radar', type: 'link' },
    { source: 'project-graph-v1', target: 'daily-2026-04-20', type: 'timeline' },
    { source: 'note-energy-map', target: 'tag-energy', type: 'tag-ref' },
    { source: 'note-energy-map', target: 'daily-2026-04-18', type: 'timeline' },
    { source: 'note-energy-map', target: 'note-growth-loop', type: 'link' },
    { source: 'project-writing-system', target: 'note-writing-rhythm', type: 'parent-child' },
    { source: 'project-writing-system', target: 'tag-output', type: 'tag-ref' },
    { source: 'project-writing-system', target: 'daily-2026-04-19', type: 'timeline' },
    { source: 'project-writing-system', target: 'note-relationship-feedback', type: 'link' },
    { source: 'note-writing-rhythm', target: 'tag-output', type: 'tag-ref' },
    { source: 'note-writing-rhythm', target: 'daily-2026-04-19', type: 'timeline' },
    { source: 'project-weekly-radar', target: 'note-problem-loop', type: 'parent-child' },
    { source: 'project-weekly-radar', target: 'daily-2026-04-20', type: 'timeline' },
    { source: 'project-weekly-radar', target: 'tag-reflection', type: 'tag-ref' },
    { source: 'note-problem-loop', target: 'tag-problem', type: 'tag-ref' },
    { source: 'note-problem-loop', target: 'daily-2026-04-20', type: 'timeline' },
    { source: 'note-problem-loop', target: 'note-relationship-feedback', type: 'link' },
    { source: 'note-relationship-feedback', target: 'daily-2026-04-19', type: 'timeline' },
    { source: 'note-relationship-feedback', target: 'tag-reflection', type: 'tag-ref' },
    { source: 'daily-2026-04-16', target: 'daily-2026-04-18', type: 'timeline' },
    { source: 'daily-2026-04-18', target: 'daily-2026-04-19', type: 'timeline' },
    { source: 'daily-2026-04-19', target: 'daily-2026-04-20', type: 'timeline' },
    { source: 'project-graph-v1', target: 'tag-output', type: 'tag-ref' }
  ]
}

export const emptyGraphData: ObsidianGraphData = {
  nodes: [],
  links: []
}
