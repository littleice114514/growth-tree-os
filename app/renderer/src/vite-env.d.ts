/// <reference types="vite/client" />

import type { GrowthTreeApi } from '@shared/contracts'

declare global {
  interface Window {
    growthTree: GrowthTreeApi
  }
}

export {}
