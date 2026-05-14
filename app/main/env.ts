import fs from 'node:fs'
import path from 'node:path'

/**
 * Read an env var — first from process.env, then fall back to
 * reading the root .env file directly. This is needed because
 * electron-vite does not auto-load .env into the main process.
 */
export function getEnvValue(name: string): string {
  const direct = process.env[name]
  if (direct && direct.trim()) return direct.trim()

  // Fallback: parse root .env
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return ''

  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim()
    if (key === name) {
      return value.replace(/^["']|["']$/g, '').trim()
    }
  }
  return ''
}
