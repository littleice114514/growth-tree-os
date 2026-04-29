export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    return value
  }

  return Math.min(Math.max(value, min), max)
}
