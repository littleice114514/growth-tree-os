import type { QualityProfileName } from '../contracts'

export function resolveDefaultQualityProfile(): QualityProfileName {
  if (typeof navigator === 'undefined') {
    return 'medium'
  }

  const platform = `${navigator.platform} ${navigator.userAgent}`.toLowerCase()
  const deviceMemory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : undefined
  const cores = navigator.hardwareConcurrency

  // TODO: Replace this with measured WebGL capability and frame budget detection.
  if (platform.includes('mac') || (deviceMemory && deviceMemory <= 4) || (cores && cores <= 4)) {
    return 'low'
  }

  return 'medium'
}
