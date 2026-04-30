export function isWebGLAvailable() {
  if (typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function WebGLFallback() {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-8 text-center shadow-panel">
      <div className="max-w-md">
        <div className="text-xs uppercase tracking-[0.2em] text-accent-amber">3D preview unavailable</div>
        <h2 className="mt-3 text-xl font-semibold text-[color:var(--text-primary)]">WebGL is not available in this environment.</h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
          The Life Tree 3D preview can be skipped on this device. Existing 2D views and data workflows remain available.
        </p>
      </div>
    </div>
  )
}
