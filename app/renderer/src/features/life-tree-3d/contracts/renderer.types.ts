export type RendererMode = 'procedural' | 'low_poly' | 'semi_realistic' | 'realistic'

export interface RendererContractNote {
  mode: RendererMode
  status: 'type_only'
  note: string
}

export const rendererContractNote: RendererContractNote = {
  mode: 'procedural',
  status: 'type_only',
  note: 'M3D-1 only defines renderer mode contracts. It does not implement a renderer, 3D canvas, model loader, or WebGL integration.'
}
