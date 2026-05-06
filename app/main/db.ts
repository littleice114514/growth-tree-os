import { DatabaseSync } from 'node:sqlite'
import dayjs from 'dayjs'
import type {
  Domain,
  ExtractionUpdate,
  NodeDetail,
  NodeRecord,
  NodeReminderSummary,
  NodeStatus,
  ReminderRecord,
  ReminderStatus,
  ReminderType,
  ReviewDetail,
  ReviewCreatePayload,
  ReviewCreateResult,
  ReviewRecord,
  SearchNodeResult,
  TreeSnapshot,
  UserRecord,
  WeeklyReviewItem,
  WeeklyReviewSummary
} from '@shared/contracts'
import { DOMAIN_OPTIONS } from '@shared/contracts'
import { domainMainlines, seedEdges, seedEvidence, seedNodes, seedReviews } from './seed'
import { persistMarkdownReview } from './storage'

const STABLE_THRESHOLD = 3
const DORMANT_DAYS = 7
const REVIEW_DAYS = 5
const RESTARTED_GRACE_DAYS = 3
const WEEKLY_WINDOW_DAYS = 7
const LOCAL_USER_ID = 'local_user'
const LOCAL_USER_DISPLAY_NAME = '本地账户'
const LOCAL_USER_MODE = 'local'

type DatabaseRow = Record<string, string | number | null>
type ReminderAction = 'complete' | 'reviewed'

type ComputedNodeRecord = NodeRecord & {
  weeklyEvidenceCount: number
  computedStatus: NodeStatus
  isReviewDue: boolean
  daysSinceLastActive: number
}

export class GrowthTreeDatabase {
  private db: DatabaseSync
  private reviewsDir: string

  constructor(sqlitePath: string, reviewsDir: string) {
    this.db = new DatabaseSync(sqlitePath)
    this.reviewsDir = reviewsDir
    this.db.exec('PRAGMA journal_mode = WAL;')
    this.createSchema()
    this.migrateLocalUserIdentity()
    this.seedIfNeeded()
    this.migrateSeedForP02IfNeeded()
    this.recomputeDerivedState()
  }

  private createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        mode TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'local_user',
        review_date TEXT NOT NULL,
        title TEXT NOT NULL,
        content_markdown TEXT NOT NULL,
        markdown_path TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'local_user',
        title TEXT NOT NULL,
        node_type TEXT NOT NULL,
        domain TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        first_seen_at TEXT NOT NULL,
        last_active_at TEXT NOT NULL,
        evidence_count INTEGER NOT NULL DEFAULT 0,
        weight_score REAL NOT NULL DEFAULT 0,
        is_achievement INTEGER NOT NULL DEFAULT 0,
        needs_review INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS edges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'local_user',
        source_node_id TEXT NOT NULL,
        target_node_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS node_evidence (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'local_user',
        node_id TEXT NOT NULL,
        review_id TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'local_user',
        node_id TEXT NOT NULL,
        reminder_type TEXT NOT NULL,
        status TEXT NOT NULL,
        due_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_triggered_at TEXT
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'local_user',
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `)
  }

  private migrateLocalUserIdentity() {
    const now = new Date().toISOString()
    this.db
      .prepare(
        `
        INSERT INTO users (id, display_name, mode, created_at, updated_at)
        VALUES (@id, @display_name, @mode, @created_at, @updated_at)
        ON CONFLICT(id) DO UPDATE SET
          display_name = excluded.display_name,
          mode = excluded.mode,
          updated_at = excluded.updated_at
      `
      )
      .run({
        id: LOCAL_USER_ID,
        display_name: LOCAL_USER_DISPLAY_NAME,
        mode: LOCAL_USER_MODE,
        created_at: now,
        updated_at: now
      })

    for (const table of ['reviews', 'nodes', 'edges', 'node_evidence', 'reminders', 'app_settings']) {
      if (!this.hasColumn(table, 'user_id')) {
        this.db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT NOT NULL DEFAULT '${LOCAL_USER_ID}'`)
      }

      this.db.prepare(`UPDATE ${table} SET user_id = ? WHERE user_id IS NULL OR user_id = ''`).run(LOCAL_USER_ID)
    }
  }

  private hasColumn(table: string, column: string) {
    const rows = this.db.prepare(`PRAGMA table_info(${table})`).all() as DatabaseRow[]
    return rows.some((row) => String(row.name) === column)
  }

  private getCurrentUserId() {
    return LOCAL_USER_ID
  }

  private seedIfNeeded() {
    const userId = this.getCurrentUserId()
    const count = this.db
      .prepare('SELECT COUNT(*) as count FROM nodes WHERE user_id = ?')
      .get(userId) as { count: number }
    if (count.count > 0) {
      return
    }

    const insertReview = this.db.prepare(`
      INSERT INTO reviews (id, user_id, review_date, title, content_markdown, markdown_path, created_at, updated_at)
      VALUES (@id, @user_id, @review_date, @title, @content_markdown, @markdown_path, @created_at, @updated_at)
    `)

    const insertNode = this.db.prepare(`
      INSERT INTO nodes (
        id, user_id, title, node_type, domain, status, description, created_at, updated_at,
        first_seen_at, last_active_at, evidence_count, weight_score, is_achievement, needs_review
      ) VALUES (
        @id, @user_id, @title, @node_type, @domain, @status, @description, @created_at, @updated_at,
        @first_seen_at, @last_active_at, @evidence_count, @weight_score, @is_achievement, @needs_review
      )
    `)

    const insertEdge = this.db.prepare(`
      INSERT INTO edges (id, user_id, source_node_id, target_node_id, relation_type, created_at, updated_at)
      VALUES (@id, @user_id, @source_node_id, @target_node_id, @relation_type, @created_at, @updated_at)
    `)

    const insertEvidence = this.db.prepare(`
      INSERT INTO node_evidence (id, user_id, node_id, review_id, excerpt, created_at)
      VALUES (@id, @user_id, @node_id, @review_id, @excerpt, @created_at)
    `)

    const insertSetting = this.db.prepare(`
      INSERT INTO app_settings (id, user_id, key, value, updated_at)
      VALUES (@id, @user_id, @key, @value, @updated_at)
    `)

    this.runTransaction(() => {
      for (const review of seedReviews) {
        const markdownPath = persistMarkdownReview(this.reviewsDir, review.reviewDate, review.contentMarkdown)
        insertReview.run({
          id: review.id,
          user_id: userId,
          review_date: review.reviewDate,
          title: review.title,
          content_markdown: review.contentMarkdown,
          markdown_path: markdownPath,
          created_at: review.createdAt,
          updated_at: review.updatedAt
        })
      }

      for (const node of seedNodes) {
        insertNode.run(this.toNodeRow(node))
      }

      for (const edge of seedEdges) {
        insertEdge.run(this.toEdgeRow(edge))
      }

      for (const evidence of seedEvidence) {
        insertEvidence.run(this.toEvidenceRow(evidence))
      }

      insertSetting.run({
        id: 'setting-initialized',
        user_id: userId,
        key: 'seed_initialized_at',
        value: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })
  }

  private migrateSeedForP02IfNeeded() {
    const userId = this.getCurrentUserId()
    const migrated = this.db
      .prepare(`SELECT value FROM app_settings WHERE key = 'seed_p0_2_migrated' AND user_id = ?`)
      .get(userId) as DatabaseRow | undefined
    if (migrated) {
      return
    }

    const fingerprint = this.db
      .prepare(
        `
        SELECT
          (SELECT COUNT(*) FROM nodes WHERE user_id = '${LOCAL_USER_ID}') as node_count,
          (SELECT COUNT(*) FROM reviews WHERE user_id = '${LOCAL_USER_ID}') as review_count,
          (SELECT COUNT(*) FROM node_evidence WHERE user_id = '${LOCAL_USER_ID}') as evidence_count,
          (SELECT COUNT(*) FROM reminders WHERE user_id = '${LOCAL_USER_ID}') as reminder_count
      `
      )
      .get() as { node_count: number; review_count: number; evidence_count: number; reminder_count: number }

    const looksLikeUntouchedSeed =
      Number(fingerprint.node_count) === 18 &&
      Number(fingerprint.review_count) === 2 &&
      Number(fingerprint.evidence_count) === 4 &&
      Number(fingerprint.reminder_count) === 0

    if (!looksLikeUntouchedSeed) {
      return
    }

    this.runTransaction(() => {
      for (const node of seedNodes) {
        this.db
          .prepare(
            `
            UPDATE nodes
            SET
              status = @status,
              description = @description,
              created_at = @created_at,
              updated_at = @updated_at,
              first_seen_at = @first_seen_at,
              last_active_at = @last_active_at,
              evidence_count = @evidence_count,
              weight_score = @weight_score,
              is_achievement = @is_achievement,
              needs_review = @needs_review
            WHERE id = @id
              AND user_id = @user_id
          `
          )
          .run(this.toNodeRow(node))
      }

      this.db
        .prepare(
          `
          DELETE FROM node_evidence
          WHERE user_id = '${LOCAL_USER_ID}'
            AND node_id IN ('node-deep-reading', 'node-question-journal', 'node-sleep-window', 'node-writing-output', 'node-offer-pipeline')
        `
        )
        .run()

      const insertEvidence = this.db.prepare(`
        INSERT INTO node_evidence (id, user_id, node_id, review_id, excerpt, created_at)
        VALUES (@id, @user_id, @node_id, @review_id, @excerpt, @created_at)
      `)

      for (const evidence of seedEvidence) {
        insertEvidence.run({
          id: evidence.id,
          user_id: userId,
          node_id: evidence.nodeId,
          review_id: this.mapSeedEvidenceReview(evidence.reviewId),
          excerpt: evidence.excerpt,
          created_at: evidence.createdAt
        })
      }

      this.db
        .prepare(
          `
          UPDATE reviews
          SET review_date = '2026-04-13', created_at = '2026-04-14T09:00:00.000Z', updated_at = '2026-04-14T09:00:00.000Z'
          WHERE id = 'review-2026-04-18'
            AND user_id = '${LOCAL_USER_ID}'
        `
        )
        .run()

      this.db
        .prepare(
          `
          INSERT INTO app_settings (id, user_id, key, value, updated_at)
          VALUES (@id, @user_id, @key, @value, @updated_at)
        `
        )
        .run({
          id: 'setting-seed-p0-2-migrated',
          user_id: userId,
          key: 'seed_p0_2_migrated',
          value: 'true',
          updated_at: new Date().toISOString()
        })
    })
  }

  getCurrentUser(): UserRecord {
    const userId = this.getCurrentUserId()
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as DatabaseRow | undefined
    return {
      id: String(row?.id ?? userId),
      displayName: String(row?.display_name ?? LOCAL_USER_DISPLAY_NAME),
      mode: String(row?.mode ?? LOCAL_USER_MODE) as UserRecord['mode'],
      createdAt: String(row?.created_at ?? ''),
      updatedAt: String(row?.updated_at ?? '')
    }
  }

  listRecentReviews(): ReviewRecord[] {
    const userId = this.getCurrentUserId()
    const rows = this.db
      .prepare(
        `
        SELECT id, review_date, title, content_markdown, markdown_path, created_at, updated_at
        FROM reviews
        WHERE user_id = ?
        ORDER BY review_date DESC, created_at DESC
        LIMIT 20
      `
      )
      .all(userId) as DatabaseRow[]

    return rows.map((row) => this.fromReviewRow(row))
  }

  getReviewDetail(reviewId: string): ReviewDetail | null {
    const userId = this.getCurrentUserId()
    const reviewRow = this.db
      .prepare(
        `
        SELECT id, review_date, title, content_markdown, markdown_path, created_at, updated_at
        FROM reviews
        WHERE id = ?
          AND user_id = ?
      `
      )
      .get(reviewId, userId) as DatabaseRow | undefined

    if (!reviewRow) {
      return null
    }

    const relatedRows = this.db
      .prepare(
        `
        SELECT
          nodes.id as node_id,
          nodes.title as node_title,
          nodes.node_type,
          nodes.domain,
          nodes.status,
          nodes.evidence_count,
          node_evidence.excerpt,
          node_evidence.created_at
        FROM node_evidence
        JOIN nodes ON nodes.id = node_evidence.node_id
        WHERE node_evidence.review_id = ?
          AND node_evidence.user_id = ?
          AND nodes.user_id = ?
        ORDER BY node_evidence.created_at DESC
      `
      )
      .all(reviewId, userId, userId) as DatabaseRow[]

    const seen = new Set<string>()
    const relatedNodes = relatedRows
      .filter((row) => {
        const nodeId = String(row.node_id)
        if (seen.has(nodeId)) {
          return false
        }
        seen.add(nodeId)
        return true
      })
      .map((row) => ({
        nodeId: String(row.node_id),
        title: String(row.node_title),
        nodeType: String(row.node_type) as NodeRecord['nodeType'],
        domain: String(row.domain) as Domain,
        status: String(row.status) as NodeStatus,
        evidenceCount: Number(row.evidence_count),
        excerpt: String(row.excerpt)
      }))

    return {
      ...this.fromReviewRow(reviewRow),
      relatedNodes
    }
  }

  createReview(payload: ReviewCreatePayload): ReviewCreateResult {
    const userId = this.getCurrentUserId()
    const now = new Date().toISOString()
    const reviewId = `review-${payload.reviewDate}-${Math.random().toString(36).slice(2, 8)}`
    const markdownPath = persistMarkdownReview(this.reviewsDir, payload.reviewDate, payload.contentMarkdown)

    this.db
      .prepare(
        `
        INSERT INTO reviews (id, user_id, review_date, title, content_markdown, markdown_path, created_at, updated_at)
        VALUES (@id, @user_id, @review_date, @title, @content_markdown, @markdown_path, @created_at, @updated_at)
      `
      )
      .run({
        id: reviewId,
        user_id: userId,
        review_date: payload.reviewDate,
        title: payload.title,
        content_markdown: payload.contentMarkdown,
        markdown_path: markdownPath,
        created_at: now,
        updated_at: now
      })

    return {
      review: {
        id: reviewId,
        reviewDate: payload.reviewDate,
        title: payload.title,
        contentMarkdown: payload.contentMarkdown,
        markdownPath,
        createdAt: now,
        updatedAt: now
      }
    }
  }

  applyExtraction(reviewId: string, updates: ExtractionUpdate[]): TreeSnapshot {
    const userId = this.getCurrentUserId()
    const targetUpdates = updates.slice(0, 3)
    const review = this.db
      .prepare('SELECT id FROM reviews WHERE id = ? AND user_id = ?')
      .get(reviewId, userId) as DatabaseRow | undefined

    if (!review) {
      return this.getTreeSnapshot()
    }

    this.runTransaction(() => {
      for (const update of targetUpdates) {
        const nodeId = update.mode === 'bind' && update.bindNodeId ? update.bindNodeId : this.createNode(update)
        this.touchNode(nodeId, update.description, reviewId, update.addEvidence)
      }
      this.recomputeDerivedState()
    })

    return this.getTreeSnapshot()
  }

  searchNodes(query: string): SearchNodeResult[] {
    const userId = this.getCurrentUserId()
    this.recomputeDerivedState()

    const text = `%${query.trim()}%`
    const rows = this.db
      .prepare(
        `
        SELECT id, title, node_type, domain, status
        FROM nodes
        WHERE node_type != 'mainline'
          AND user_id = @user_id
          AND (@query = '%%' OR title LIKE @query OR description LIKE @query)
        ORDER BY updated_at DESC
        LIMIT 8
      `
      )
      .all({ query: text.length > 2 ? text : '%%', user_id: userId }) as DatabaseRow[]

    return rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      nodeType: String(row.node_type) as NodeRecord['nodeType'],
      domain: String(row.domain) as Domain,
      status: String(row.status) as NodeStatus
    }))
  }

  getNodeDetail(nodeId: string): NodeDetail | null {
    const userId = this.getCurrentUserId()
    this.recomputeDerivedState()

    const row = this.db
      .prepare(
        `
        SELECT *
        FROM nodes
        WHERE id = ?
          AND user_id = ?
      `
      )
      .get(nodeId, userId) as DatabaseRow | undefined

    if (!row) {
      return null
    }

    const evidenceRows = this.db
      .prepare(
        `
        SELECT *
        FROM node_evidence
        WHERE node_id = ?
          AND user_id = ?
        ORDER BY created_at DESC
        LIMIT 3
      `
      )
      .all(nodeId, userId) as DatabaseRow[]

    const reminderRows = this.db
      .prepare(
        `
        SELECT reminders.*, nodes.title as node_title, nodes.domain, nodes.status as node_status, nodes.last_active_at
        FROM reminders
        JOIN nodes ON nodes.id = reminders.node_id
        WHERE reminders.node_id = ?
          AND reminders.user_id = ?
          AND nodes.user_id = ?
          AND reminders.status = 'open'
        ORDER BY reminders.updated_at DESC
      `
      )
      .all(nodeId, userId, userId) as DatabaseRow[]

    const detailNode = this.computeNodeFromRow(row)

    return {
      ...detailNode,
      recentEvidence: evidenceRows.map((item) => this.fromEvidenceRow(item)),
      daysSinceLastActive: detailNode.daysSinceLastActive,
      isReviewDue: detailNode.isReviewDue,
      activeReminders: reminderRows.map((item) => this.toNodeReminderSummary(item))
    }
  }

  markNodeReviewed(nodeId: string): NodeDetail | null {
    const userId = this.getCurrentUserId()
    const now = new Date().toISOString()

    this.runTransaction(() => {
      const row = this.db
        .prepare('SELECT * FROM nodes WHERE id = ? AND user_id = ?')
        .get(nodeId, userId) as DatabaseRow | undefined
      if (!row) {
        return
      }

      const current = this.fromNodeRow(row)
      this.db
        .prepare(
          `
          UPDATE nodes
          SET status = @status, needs_review = 0, updated_at = @updated_at
          WHERE id = @id
            AND user_id = @user_id
        `
        )
        .run({
          id: nodeId,
          user_id: userId,
          status: current.status === 'review' ? 'stable' : current.status,
          updated_at: now
        })

      this.db
        .prepare(
          `
          UPDATE reminders
          SET status = 'done', updated_at = @updated_at
          WHERE node_id = @node_id
            AND user_id = @user_id
            AND reminder_type = 'review_due'
            AND status = 'open'
        `
        )
        .run({
          node_id: nodeId,
          user_id: userId,
          updated_at: now
        })

      this.recomputeDerivedState()
    })

    return this.getNodeDetail(nodeId)
  }

  listAllReminders(): ReminderRecord[] {
    const userId = this.getCurrentUserId()
    this.recomputeDerivedState()

    const rows = this.db
      .prepare(
        `
        SELECT reminders.*, nodes.title as node_title, nodes.domain, nodes.status as node_status, nodes.last_active_at
        FROM reminders
        JOIN nodes ON nodes.id = reminders.node_id
          AND nodes.user_id = reminders.user_id
        WHERE reminders.user_id = ?
        ORDER BY CASE reminders.status WHEN 'open' THEN 0 ELSE 1 END, reminders.updated_at DESC, reminders.due_at ASC
      `
      )
      .all(userId) as DatabaseRow[]

    return rows.map((row) => this.fromReminderRow(row))
  }

  completeReminder(reminderId: string, action: ReminderAction): { ok: true } {
    const userId = this.getCurrentUserId()
    const now = new Date().toISOString()
    const row = this.db
      .prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?')
      .get(reminderId, userId) as DatabaseRow | undefined
    if (!row) {
      return { ok: true }
    }

    this.runTransaction(() => {
      this.db
        .prepare(
          `
          UPDATE reminders
          SET status = 'done', updated_at = @updated_at
          WHERE id = @id
            AND user_id = @user_id
        `
        )
        .run({
          id: reminderId,
          user_id: userId,
          updated_at: now
        })

      if (action === 'reviewed' || String(row.reminder_type) === 'review_due') {
        const nodeId = String(row.node_id)
        const nodeRow = this.db
          .prepare('SELECT * FROM nodes WHERE id = ? AND user_id = ?')
          .get(nodeId, userId) as DatabaseRow | undefined
        if (nodeRow) {
          const current = this.fromNodeRow(nodeRow)
          this.db
            .prepare(
              `
              UPDATE nodes
              SET status = @status, needs_review = 0, updated_at = @updated_at
              WHERE id = @id
                AND user_id = @user_id
            `
            )
            .run({
              id: nodeId,
              user_id: userId,
              status: current.status === 'review' ? 'stable' : current.status,
              updated_at: now
            })
        }
      }

      this.recomputeDerivedState()
    })

    return { ok: true }
  }

  getWeeklyReview(): WeeklyReviewSummary {
    const userId = this.getCurrentUserId()
    this.recomputeDerivedState()
    const nodes = this.getComputedNodes()
    const now = dayjs()
    const windowStart = now.subtract(WEEKLY_WINDOW_DAYS, 'day')

    const reviewsRow = this.db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM reviews
        WHERE datetime(created_at) >= datetime(?)
          AND user_id = ?
      `
      )
      .get(windowStart.toISOString(), userId) as { count: number }

    const newNodes = nodes
      .filter((node) => node.nodeType !== 'mainline' && dayjs(node.createdAt).isAfter(windowStart))
      .sort((left, right) => dayjs(right.createdAt).valueOf() - dayjs(left.createdAt).valueOf())
      .map((node) =>
        this.toWeeklyReviewItem(node, `在最近 7 天内首次进入成长树，当前状态为 ${node.computedStatus}。`)
      )

    const repeatProblems = nodes
      .filter((node) => node.nodeType === 'issue' && node.weeklyEvidenceCount > 0)
      .sort((left, right) => {
        if (right.weeklyEvidenceCount !== left.weeklyEvidenceCount) {
          return right.weeklyEvidenceCount - left.weeklyEvidenceCount
        }
        return right.evidenceCount - left.evidenceCount
      })
      .slice(0, 3)
      .map((node) =>
        this.toWeeklyReviewItem(
          node,
          `最近 7 天新增 ${node.weeklyEvidenceCount} 条相关证据，总证据 ${node.evidenceCount}，属于重复出现的问题。`
        )
      )

    const dormantNodes = nodes
      .filter(
        (node) =>
          node.nodeType !== 'mainline' &&
          node.computedStatus === 'dormant' &&
          node.daysSinceLastActive <= DORMANT_DAYS + WEEKLY_WINDOW_DAYS
      )
      .sort((left, right) => right.daysSinceLastActive - left.daysSinceLastActive)
      .map((node) =>
        this.toWeeklyReviewItem(node, `已经 ${node.daysSinceLastActive} 天没有更新，因此进入 dormant。`)
      )

    const restartedNodes = nodes
      .filter(
        (node) =>
          node.nodeType !== 'mainline' &&
          node.computedStatus === 'restarted' &&
          dayjs(node.updatedAt).isAfter(windowStart)
      )
      .sort((left, right) => dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf())
      .map((node) =>
        this.toWeeklyReviewItem(node, `原本已沉寂，本周重新出现新证据，因此回到 restarted。`)
      )

    return {
      windowStart: windowStart.toISOString(),
      windowEnd: now.toISOString(),
      newNodesCount: nodes.filter((node) => node.nodeType !== 'mainline' && dayjs(node.createdAt).isAfter(windowStart)).length,
      updatedNodesCount: nodes.filter((node) => {
        if (node.nodeType === 'mainline') {
          return false
        }
        const updated = dayjs(node.updatedAt)
        const active = dayjs(node.lastActiveAt)
        return (updated.isAfter(windowStart) || active.isAfter(windowStart)) && !updated.isSame(dayjs(node.createdAt))
      }).length,
      stableNodesCount: nodes.filter((node) => node.nodeType !== 'mainline' && node.computedStatus === 'stable').length,
      dormantNodesCount: nodes.filter((node) => node.nodeType !== 'mainline' && node.computedStatus === 'dormant').length,
      restartedNodesCount: nodes.filter((node) => node.nodeType !== 'mainline' && node.computedStatus === 'restarted').length,
      newReviewsCount: Number(reviewsRow.count),
      newNodes,
      repeatProblems,
      dormantNodes,
      restartedNodes
    }
  }

  getTreeSnapshot(): TreeSnapshot {
    const userId = this.getCurrentUserId()
    this.recomputeDerivedState()

    const nodeRows = this.db
      .prepare(
        `
        SELECT *
        FROM nodes
        WHERE user_id = ?
        ORDER BY CASE node_type WHEN 'mainline' THEN 0 ELSE 1 END, domain, updated_at DESC
      `
      )
      .all(userId) as DatabaseRow[]

    const edgeRows = this.db.prepare('SELECT * FROM edges WHERE user_id = ? ORDER BY created_at ASC').all(userId) as DatabaseRow[]
    const nodes = nodeRows.map((row) => this.fromNodeRow(row))
    const positionedNodes = this.withPositions(nodes)

    return {
      nodes: positionedNodes,
      edges: edgeRows.map((row) => this.fromEdgeRow(row)),
      mainlines: domainMainlines.map((item) => ({ domain: item.domain, nodeId: item.id }))
    }
  }

  private recomputeDerivedState() {
    const userId = this.getCurrentUserId()
    const nodes = this.getComputedNodes()

    for (const node of nodes) {
      this.db
        .prepare(
          `
          UPDATE nodes
          SET status = @status, needs_review = @needs_review
          WHERE id = @id
            AND user_id = @user_id
        `
        )
        .run({
          id: node.id,
          user_id: userId,
          status: node.computedStatus,
          needs_review: node.isReviewDue ? 1 : 0
        })
    }

    this.syncReminders(nodes)
  }

  private getComputedNodes(): ComputedNodeRecord[] {
    const userId = this.getCurrentUserId()
    const nodeRows = this.db.prepare('SELECT * FROM nodes WHERE user_id = ?').all(userId) as DatabaseRow[]
    return nodeRows.map((row) => this.computeNodeFromRow(row))
  }

  private computeNodeFromRow(row: DatabaseRow): ComputedNodeRecord {
    const base = this.fromNodeRow(row)
    const daysSinceLastActive = Math.max(0, dayjs().diff(dayjs(base.lastActiveAt), 'day'))
    const weeklyEvidenceCount = this.getWeeklyEvidenceCount(base.id)
    const computedStatus = this.computeStatus(base, daysSinceLastActive)
    const isReviewDue = computedStatus === 'review'

    return {
      ...base,
      weeklyEvidenceCount,
      computedStatus,
      isReviewDue,
      daysSinceLastActive
    }
  }

  private computeStatus(node: NodeRecord, daysSinceLastActive: number): NodeStatus {
    if (node.nodeType === 'mainline') {
      return 'stable'
    }

    if (daysSinceLastActive > DORMANT_DAYS) {
      return 'dormant'
    }

    if (node.status === 'restarted' && daysSinceLastActive <= RESTARTED_GRACE_DAYS) {
      return 'restarted'
    }

    if (node.evidenceCount >= STABLE_THRESHOLD && daysSinceLastActive > REVIEW_DAYS) {
      return 'review'
    }

    if (node.evidenceCount >= STABLE_THRESHOLD) {
      return 'stable'
    }

    if (node.updatedAt !== node.createdAt || node.evidenceCount > 1) {
      return 'growing'
    }

    return 'new'
  }

  private syncReminders(nodes: ComputedNodeRecord[]) {
    const userId = this.getCurrentUserId()
    const wanted = new Map<string, { node: ComputedNodeRecord; type: ReminderType; dueAt: string; reason: string }>()

    for (const node of nodes) {
      if (node.nodeType === 'mainline') {
        continue
      }

      if (node.computedStatus === 'dormant') {
        wanted.set(`${node.id}:dormant`, {
          node,
          type: 'dormant',
          dueAt: dayjs(node.lastActiveAt).add(DORMANT_DAYS, 'day').toISOString(),
          reason: `最近 ${node.daysSinceLastActive} 天没有更新，已经进入沉寂状态。`
        })
      }

      if (node.computedStatus === 'review') {
        wanted.set(`${node.id}:review_due`, {
          node,
          type: 'review_due',
          dueAt: dayjs(node.lastActiveAt).add(REVIEW_DAYS, 'day').toISOString(),
          reason: `稳定节点超过 ${REVIEW_DAYS} 天未活跃，进入回看周期。`
        })
      }

      if (node.nodeType === 'issue' && node.evidenceCount >= STABLE_THRESHOLD && node.weeklyEvidenceCount > 0) {
        wanted.set(`${node.id}:repeat_problem`, {
          node,
          type: 'repeat_problem',
          dueAt: node.lastActiveAt,
          reason: `最近 7 天问题持续出现 ${node.weeklyEvidenceCount} 次，已触发重复问题提醒。`
        })
      }
    }

    const reminderRows = this.db.prepare('SELECT * FROM reminders WHERE user_id = ?').all(userId) as DatabaseRow[]
    const grouped = new Map<string, DatabaseRow[]>()
    for (const row of reminderRows) {
      const key = `${String(row.node_id)}:${String(row.reminder_type)}`
      grouped.set(key, [...(grouped.get(key) ?? []), row])
    }

    for (const [key, target] of wanted) {
      const rows = grouped.get(key) ?? []
      const openReminder = rows.find((row) => String(row.status) === 'open')

      if (openReminder) {
        this.db
          .prepare(
            `
            UPDATE reminders
            SET due_at = @due_at, updated_at = @updated_at, last_triggered_at = @last_triggered_at
            WHERE id = @id
              AND user_id = @user_id
          `
          )
          .run({
            id: String(openReminder.id),
            user_id: userId,
            due_at: target.dueAt,
            updated_at: new Date().toISOString(),
            last_triggered_at: target.node.lastActiveAt
          })
        continue
      }

      const latestDone = rows
        .filter((row) => String(row.status) === 'done')
        .sort((left, right) => String(right.updated_at).localeCompare(String(left.updated_at)))[0]

      if (
        latestDone &&
        String(latestDone.last_triggered_at ?? '') === target.node.lastActiveAt &&
        String(latestDone.due_at) === target.dueAt
      ) {
        continue
      }

      this.db
        .prepare(
          `
          INSERT INTO reminders (
            id, user_id, node_id, reminder_type, status, due_at, created_at, updated_at, last_triggered_at
          ) VALUES (
            @id, @user_id, @node_id, @reminder_type, @status, @due_at, @created_at, @updated_at, @last_triggered_at
          )
        `
        )
        .run({
          id: `reminder-${target.type}-${target.node.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
          user_id: userId,
          node_id: target.node.id,
          reminder_type: target.type,
          status: 'open',
          due_at: target.dueAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_triggered_at: target.node.lastActiveAt
        })
    }

    const activeKeys = new Set(wanted.keys())
    const openRowsToClose = reminderRows.filter(
      (row) => String(row.status) === 'open' && !activeKeys.has(`${String(row.node_id)}:${String(row.reminder_type)}`)
    )

    for (const row of openRowsToClose) {
      this.db
        .prepare(
          `
          UPDATE reminders
          SET status = 'done', updated_at = @updated_at
          WHERE id = @id
            AND user_id = @user_id
        `
        )
        .run({
          id: String(row.id),
          user_id: userId,
          updated_at: new Date().toISOString()
        })
    }
  }

  private getWeeklyEvidenceCount(nodeId: string): number {
    const userId = this.getCurrentUserId()
    const row = this.db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM node_evidence
        WHERE node_id = ?
          AND user_id = ?
          AND datetime(created_at) >= datetime(?)
      `
      )
      .get(nodeId, userId, dayjs().subtract(WEEKLY_WINDOW_DAYS, 'day').toISOString()) as { count: number }

    return Number(row.count)
  }

  private mapSeedEvidenceReview(reviewId: string) {
    if (reviewId === 'review-2026-04-13') {
      return 'review-2026-04-18'
    }
    return reviewId
  }

  private createNode(update: ExtractionUpdate): string {
    const userId = this.getCurrentUserId()
    const now = new Date().toISOString()
    const nodeId = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

    this.db
      .prepare(
        `
        INSERT INTO nodes (
          id, user_id, title, node_type, domain, status, description, created_at, updated_at,
          first_seen_at, last_active_at, evidence_count, weight_score, is_achievement, needs_review
        ) VALUES (
          @id, @user_id, @title, @node_type, @domain, @status, @description, @created_at, @updated_at,
          @first_seen_at, @last_active_at, @evidence_count, @weight_score, @is_achievement, @needs_review
        )
      `
      )
      .run({
        id: nodeId,
        user_id: userId,
        title: update.title,
        node_type: update.nodeType,
        domain: update.domain,
        status: 'new',
        description: update.description,
        created_at: now,
        updated_at: now,
        first_seen_at: now,
        last_active_at: now,
        evidence_count: 0,
        weight_score: 4,
        is_achievement: update.nodeType === 'achievement' ? 1 : 0,
        needs_review: 0
      })

    const mainline = domainMainlines.find((item) => item.domain === update.domain)
    if (mainline) {
      this.db
        .prepare(
          `
          INSERT INTO edges (id, user_id, source_node_id, target_node_id, relation_type, created_at, updated_at)
          VALUES (@id, @user_id, @source_node_id, @target_node_id, @relation_type, @created_at, @updated_at)
        `
        )
        .run({
          id: `edge-${mainline.id}-${nodeId}`,
          user_id: userId,
          source_node_id: mainline.id,
          target_node_id: nodeId,
          relation_type: 'supports',
          created_at: now,
          updated_at: now
        })
    }

    return nodeId
  }

  private touchNode(nodeId: string, description: string, reviewId: string, addEvidence: boolean) {
    const userId = this.getCurrentUserId()
    const row = this.db
      .prepare('SELECT * FROM nodes WHERE id = ? AND user_id = ?')
      .get(nodeId, userId) as DatabaseRow | undefined
    if (!row) {
      return
    }

    const current = this.fromNodeRow(row)
    const now = new Date().toISOString()
    const nextEvidenceCount = addEvidence ? current.evidenceCount + 1 : current.evidenceCount
    const wasDormant = this.computeStatus(current, dayjs().diff(dayjs(current.lastActiveAt), 'day')) === 'dormant'
    const nextStatus: NodeStatus = wasDormant
      ? 'restarted'
      : nextEvidenceCount >= STABLE_THRESHOLD
        ? 'stable'
        : current.evidenceCount > 0 || current.status === 'new'
          ? 'growing'
          : 'new'

    this.db
      .prepare(
        `
        UPDATE nodes
        SET
          description = @description,
          status = @status,
          updated_at = @updated_at,
          last_active_at = @last_active_at,
          evidence_count = @evidence_count,
          weight_score = @weight_score,
          needs_review = @needs_review
        WHERE id = @id
          AND user_id = @user_id
      `
      )
      .run({
        id: nodeId,
        user_id: userId,
        description: description || current.description,
        status: nextStatus,
        updated_at: now,
        last_active_at: now,
        evidence_count: nextEvidenceCount,
        weight_score: Math.max(current.weightScore, nextEvidenceCount + 3),
        needs_review: 0
      })

    if (addEvidence) {
      this.db
        .prepare(
          `
          INSERT INTO node_evidence (id, user_id, node_id, review_id, excerpt, created_at)
          VALUES (@id, @user_id, @node_id, @review_id, @excerpt, @created_at)
        `
        )
        .run({
          id: `evidence-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          user_id: userId,
          node_id: nodeId,
          review_id: reviewId,
          excerpt: description || current.description,
          created_at: now
        })
    }
  }

  private withPositions(nodes: NodeRecord[]) {
    const anchors = new Map<Domain, { x: number; y: number }>(
      DOMAIN_OPTIONS.map((domain, index) => {
        const column = index % 3
        const row = Math.floor(index / 3)
        return [domain, { x: 220 + column * 460, y: 180 + row * 330 }]
      })
    )
    const grouped = new Map<Domain, NodeRecord[]>(
      DOMAIN_OPTIONS.map((domain) => [domain, nodes.filter((node) => node.domain === domain && node.nodeType !== 'mainline')])
    )

    return nodes.map((node) => {
      const anchor = anchors.get(node.domain) ?? { x: 220, y: 180 }
      if (node.nodeType === 'mainline') {
        return {
          ...node,
          position: anchor
        }
      }

      const domainNodes = grouped.get(node.domain) ?? []
      const order = Math.max(0, domainNodes.findIndex((item) => item.id === node.id))
      const ring = Math.floor(order / 5)
      const slot = order % 5
      const radius = 118 + ring * 74 + (node.nodeType === 'issue' ? 16 : 0)
      const angle = -Math.PI / 2 + slot * ((Math.PI * 2) / 5) + (ring % 2 === 0 ? 0 : 0.38)
      return {
        ...node,
        position: {
          x: Math.round(anchor.x + Math.cos(angle) * radius),
          y: Math.round(anchor.y + Math.sin(angle) * (radius * 0.82))
        }
      }
    })
  }

  private toWeeklyReviewItem(node: ComputedNodeRecord, reason: string): WeeklyReviewItem {
    return {
      nodeId: node.id,
      title: node.title,
      domain: node.domain,
      status: node.computedStatus,
      reason
    }
  }

  private runTransaction(task: () => void) {
    this.db.exec('BEGIN')
    try {
      task()
      this.db.exec('COMMIT')
    } catch (error) {
      this.db.exec('ROLLBACK')
      throw error
    }
  }

  private toNodeRow(node: NodeRecord) {
    return {
      id: node.id,
      user_id: this.getCurrentUserId(),
      title: node.title,
      node_type: node.nodeType,
      domain: node.domain,
      status: node.status,
      description: node.description,
      created_at: node.createdAt,
      updated_at: node.updatedAt,
      first_seen_at: node.firstSeenAt,
      last_active_at: node.lastActiveAt,
      evidence_count: node.evidenceCount,
      weight_score: node.weightScore,
      is_achievement: node.isAchievement ? 1 : 0,
      needs_review: node.needsReview ? 1 : 0
    }
  }

  private toEdgeRow(edge: TreeSnapshot['edges'][number]) {
    return {
      id: edge.id,
      user_id: this.getCurrentUserId(),
      source_node_id: edge.sourceNodeId,
      target_node_id: edge.targetNodeId,
      relation_type: edge.relationType,
      created_at: edge.createdAt,
      updated_at: edge.updatedAt
    }
  }

  private toEvidenceRow(item: NodeDetail['recentEvidence'][number]) {
    return {
      id: item.id,
      user_id: this.getCurrentUserId(),
      node_id: item.nodeId,
      review_id: item.reviewId,
      excerpt: item.excerpt,
      created_at: item.createdAt
    }
  }

  private fromReviewRow(row: DatabaseRow): ReviewRecord {
    return {
      id: String(row.id),
      reviewDate: String(row.review_date),
      title: String(row.title),
      contentMarkdown: String(row.content_markdown),
      markdownPath: String(row.markdown_path),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at)
    }
  }

  private fromNodeRow(row: DatabaseRow): NodeRecord {
    return {
      id: String(row.id),
      title: String(row.title),
      nodeType: String(row.node_type) as NodeRecord['nodeType'],
      domain: String(row.domain) as Domain,
      status: String(row.status) as NodeStatus,
      description: String(row.description),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      firstSeenAt: String(row.first_seen_at),
      lastActiveAt: String(row.last_active_at),
      evidenceCount: Number(row.evidence_count),
      weightScore: Number(row.weight_score),
      isAchievement: Boolean(row.is_achievement),
      needsReview: Boolean(row.needs_review)
    }
  }

  private fromEdgeRow(row: DatabaseRow): TreeSnapshot['edges'][number] {
    return {
      id: String(row.id),
      sourceNodeId: String(row.source_node_id),
      targetNodeId: String(row.target_node_id),
      relationType: String(row.relation_type) as TreeSnapshot['edges'][number]['relationType'],
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at)
    }
  }

  private fromEvidenceRow(row: DatabaseRow): NodeDetail['recentEvidence'][number] {
    return {
      id: String(row.id),
      nodeId: String(row.node_id),
      reviewId: String(row.review_id),
      excerpt: String(row.excerpt),
      createdAt: String(row.created_at)
    }
  }

  private fromReminderRow(row: DatabaseRow): ReminderRecord {
    return {
      id: String(row.id),
      nodeId: String(row.node_id),
      reminderType: String(row.reminder_type) as ReminderType,
      status: String(row.status) as ReminderStatus,
      dueAt: String(row.due_at),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      lastTriggeredAt: row.last_triggered_at ? String(row.last_triggered_at) : null,
      nodeTitle: String(row.node_title),
      domain: String(row.domain) as Domain,
      nodeStatus: String(row.node_status) as NodeStatus,
      lastActiveAt: String(row.last_active_at),
      processedAt: String(row.status) === 'done' ? String(row.updated_at) : null,
      reason: this.getReminderReason(
        String(row.reminder_type) as ReminderType,
        String(row.node_title),
        String(row.node_status) as NodeStatus,
        String(row.last_active_at)
      )
    }
  }

  private toNodeReminderSummary(row: DatabaseRow): NodeReminderSummary {
    return {
      id: String(row.id),
      reminderType: String(row.reminder_type) as ReminderType,
      status: String(row.status) as ReminderStatus,
      dueAt: String(row.due_at),
      reason: this.getReminderReason(
        String(row.reminder_type) as ReminderType,
        String(row.node_title),
        String(row.node_status) as NodeStatus,
        String(row.last_active_at)
      )
    }
  }

  private getReminderReason(type: ReminderType, title: string, nodeStatus: NodeStatus, lastActiveAt: string) {
    const days = Math.max(0, dayjs().diff(dayjs(lastActiveAt), 'day'))
    switch (type) {
      case 'dormant':
        return `${title} 已经 ${days} 天没有更新，当前状态 ${nodeStatus}。`
      case 'review_due':
        return `${title} 已到回看周期，建议确认是否仍然稳定。`
      case 'repeat_problem':
        return `${title} 在最近 7 天内重复出现，建议集中回看。`
      default:
        return `${title} 触发了提醒。`
    }
  }
}
