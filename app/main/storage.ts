import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

export type AppPaths = {
  dataRoot: string
  reviewsDir: string
  dbDir: string
  configDir: string
  sqlitePath: string
}

export function ensureAppPaths(): AppPaths {
  const userData = app.getPath('userData')
  const legacyRoot = path.join(userData, 'growth-tree-os')
  const legacyDbPath = path.join(legacyRoot, 'db', 'growth-tree-os.sqlite')
  const dataRoot = fs.existsSync(legacyDbPath) ? legacyRoot : userData
  const reviewsDir = path.join(dataRoot, 'reviews')
  const dbDir = path.join(dataRoot, 'db')
  const configDir = path.join(dataRoot, 'config')
  const sqlitePath = path.join(dbDir, 'growth-tree-os.sqlite')

  ;[dataRoot, reviewsDir, dbDir, configDir].forEach((target) => {
    fs.mkdirSync(target, { recursive: true })
  })

  return {
    dataRoot,
    reviewsDir,
    dbDir,
    configDir,
    sqlitePath
  }
}

export function persistMarkdownReview(reviewsDir: string, reviewDate: string, content: string): string {
  let suffix = 0
  let fileName = `${reviewDate}.md`
  let filePath = path.join(reviewsDir, fileName)

  while (fs.existsSync(filePath)) {
    suffix += 1
    fileName = `${reviewDate}-${suffix}.md`
    filePath = path.join(reviewsDir, fileName)
  }

  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}
