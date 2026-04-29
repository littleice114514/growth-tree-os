import { clamp } from './clamp'

export function normalizeScore(value: number, min = 0, max = 100): number {
  if (min === max) {
    return 0
  }

  return clamp((value - min) / (max - min), 0, 1)
}
