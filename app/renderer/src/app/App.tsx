import { useEffect } from 'react'
import { MainWorkspacePage } from '@/pages/MainWorkspacePage'
import { useWorkspaceStore } from './store'

export function App() {
  const boot = useWorkspaceStore((state) => state.boot)

  useEffect(() => {
    void boot()
  }, [boot])

  return <MainWorkspacePage />
}
