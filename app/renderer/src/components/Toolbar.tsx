import { useMemo } from 'react'
import { useWorkspaceStore } from '@/app/store'
import { useThemeMode } from '@/app/theme'
import type { WorkspaceView } from '@/types/ui'

const workspaceViews: Array<[WorkspaceView, string]> = [
  ['tree', '成长树'],
  ['wealth', '财富'],
  ['timeDebt', '时间负债'],
  ['obsidianGraph', '图谱 V1'],
  ['reminders', '提醒'],
  ['weeklyReview', '周回看']
]

const workspaceTitles: Record<WorkspaceView, string> = {
  tree: '成长树主视图',
  wealth: '财富操作系统',
  timeDebt: '时间负债',
  obsidianGraph: '图谱 V1',
  reminders: '提醒工作台',
  weeklyReview: '周回看'
}

export function Toolbar() {
  const { themeMode, toggleTheme } = useThemeMode()
  const openReviewComposer = useWorkspaceStore((state) => state.openReviewComposer)
  const searchQuery = useWorkspaceStore((state) => state.searchQuery)
  const searchResults = useWorkspaceStore((state) => state.searchResults)
  const searchLoading = useWorkspaceStore((state) => state.searchLoading)
  const searchError = useWorkspaceStore((state) => state.searchError)
  const setSearchQuery = useWorkspaceStore((state) => state.setSearchQuery)
  const jumpToNode = useWorkspaceStore((state) => state.jumpToNode)
  const currentView = useWorkspaceStore((state) => state.currentView)
  const setCurrentView = useWorkspaceStore((state) => state.setCurrentView)
  const tree = useWorkspaceStore((state) => state.tree)
  const reminders = useWorkspaceStore((state) => state.reminders)
  const shouldShowSearchResults = Boolean(searchQuery.trim())

  const stats = useMemo(() => {
    const total = tree?.nodes.filter((item) => item.nodeType !== 'mainline').length ?? 0
    const stable = tree?.nodes.filter((item) => item.status === 'stable').length ?? 0
    const openReminders = reminders.filter((item) => item.status === 'open').length
    return `${stable} stable / ${total} total / ${openReminders} open reminders`
  }, [reminders, tree])

  return (
    <header className="relative flex items-center justify-between rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="flex min-w-0 items-center gap-5">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">growth tree os</div>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">{workspaceTitles[currentView]}</h1>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-accent-green">
              Desktop / Local-first
            </span>
          </div>
        </div>
        <nav className="flex items-center rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] p-1">
          {workspaceViews.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => void setCurrentView(id)}
              className={
                currentView === id
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-1.5 text-sm text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'
                  : 'rounded-xl border border-transparent px-3 py-1.5 text-sm text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-xs text-[color:var(--text-secondary)] xl:block">
          {stats}
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
          title={themeMode === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
        >
          {themeMode === 'dark' ? 'Dark' : 'Light'}
        </button>
        <div className="relative">
          <label className="flex items-center rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition focus-within:border-[color:var(--node-selected-border)] focus-within:bg-[var(--control-hover)]">
            <span className="mr-2 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="节点标题、主线、描述"
              className="w-44 border-none bg-transparent text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)]"
            />
          </label>
          {shouldShowSearchResults ? (
            <div className="fixed left-5 top-[84px] z-40 w-[360px] overflow-hidden rounded-[20px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
              <div className="border-b border-[color:var(--panel-border)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Search Results</div>
                <div className="mt-1 truncate text-sm text-[color:var(--text-secondary)]">{searchQuery.trim()}</div>
              </div>
              {searchLoading ? <div className="px-4 py-3 text-sm text-[color:var(--text-muted)]">搜索中...</div> : null}
              {!searchLoading && searchError ? <div className="px-4 py-3 text-sm text-accent-rose">{searchError}</div> : null}
              {!searchLoading && !searchError && searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[color:var(--text-muted)]">没有找到匹配节点</div>
              ) : null}
              {!searchLoading && !searchError && searchResults.length > 0 ? (
                <div className="max-h-80 overflow-auto py-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void jumpToNode(item.id)}
                      className="block w-full border-b border-[color:var(--panel-border)] px-4 py-3 text-left transition last:border-b-0 hover:bg-[var(--control-hover)]"
                    >
                      <div className="truncate text-sm font-medium text-[color:var(--text-primary)]">{item.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                        <span>{item.nodeType}</span>
                        <span className="text-[color:var(--text-muted)]">/</span>
                        <span className="truncate">{item.domain}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openReviewComposer}
          className="rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-medium text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
        >
          新建今日复盘
        </button>
      </div>
    </header>
  )
}
