import { app, BrowserWindow, globalShortcut } from 'electron'
import { join } from 'node:path'
import { ensureAppPaths } from './storage'
import { GrowthTreeDatabase } from './db'
import { registerIpc } from './ipc'

const timeDebtOpenQuickFloatChannel = 'time-debt:open-quick-float'
const preferredTimeDebtShortcut = 'CommandOrControl+Alt+T'
const fallbackTimeDebtShortcut = 'CommandOrControl+Shift+L'

const wealthOpenQuickFloatChannel = 'wealth:open-quick-float'
const preferredWealthShortcut = 'CommandOrControl+Alt+Z'

const quickRecordOpenChannel = 'quick-record:open'
const preferredQuickRecordShortcut = 'CommandOrControl+P'

let mainWindow: BrowserWindow | null = null
let registeredTimeDebtShortcuts: string[] = []
let registeredWealthShortcuts: string[] = []
let registeredQuickRecordShortcuts: string[] = []

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1280,
    minHeight: 760,
    backgroundColor: '#080a0d',
    title: 'growth-tree-os',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function openTimeDebtQuickFloat() {
  if (!mainWindow) {
    createWindow()
  }

  if (!mainWindow) {
    console.warn('[time-debt] failed to open quick float: main window unavailable')
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.show()
  mainWindow.focus()
  sendQuickRecordOpen(mainWindow, 'time')
}

function sendOpenTimeDebtQuickFloat(targetWindow: BrowserWindow) {
  const sendOpenEvent = () => {
    if (!targetWindow.isDestroyed()) {
      targetWindow.webContents.send(timeDebtOpenQuickFloatChannel)
    }
  }

  if (targetWindow.webContents.isLoading()) {
    targetWindow.webContents.once('did-finish-load', sendOpenEvent)
    return
  }

  sendOpenEvent()
}

function registerTimeDebtShortcut() {
  if (registeredTimeDebtShortcuts.length > 0) {
    return
  }

  for (const shortcut of [preferredTimeDebtShortcut, fallbackTimeDebtShortcut]) {
    const registered = globalShortcut.register(shortcut, openTimeDebtQuickFloat)
    if (registered) {
      registeredTimeDebtShortcuts = [...registeredTimeDebtShortcuts, shortcut]
      console.info(`[time-debt] registered global shortcut: ${shortcut}`)
      continue
    }

    console.warn(`[time-debt] failed to register global shortcut: ${shortcut}`)
  }

  if (registeredTimeDebtShortcuts.length === 0) {
    console.warn('[time-debt] no global shortcut registered for quick float')
  }
}

function openWealthQuickFloat() {
  if (!mainWindow) {
    createWindow()
  }

  if (!mainWindow) {
    console.warn('[wealth] failed to open quick float: main window unavailable')
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.show()
  mainWindow.focus()
  sendQuickRecordOpen(mainWindow, 'wealth')
}

function sendWealthQuickFloat(targetWindow: BrowserWindow) {
  const sendEvent = () => {
    if (!targetWindow.isDestroyed()) {
      targetWindow.webContents.send(wealthOpenQuickFloatChannel)
    }
  }

  if (targetWindow.webContents.isLoading()) {
    targetWindow.webContents.once('did-finish-load', sendEvent)
    return
  }

  sendEvent()
}

function sendQuickRecordOpen(targetWindow: BrowserWindow, mode: 'choose' | 'time' | 'wealth' | 'toggle') {
  const sendEvent = () => {
    if (!targetWindow.isDestroyed()) {
      targetWindow.webContents.send(quickRecordOpenChannel, mode)
    }
  }

  if (targetWindow.webContents.isLoading()) {
    targetWindow.webContents.once('did-finish-load', sendEvent)
    return
  }

  sendEvent()
}

function openQuickRecordChoose() {
  if (!mainWindow) {
    createWindow()
  }

  if (!mainWindow) {
    console.warn('[quick-record] failed to open: main window unavailable')
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }

  mainWindow.show()
  mainWindow.focus()
  sendQuickRecordOpen(mainWindow, 'toggle')
}

function registerQuickRecordShortcut() {
  if (registeredQuickRecordShortcuts.length > 0) {
    return
  }

  const registered = globalShortcut.register(preferredQuickRecordShortcut, openQuickRecordChoose)
  if (registered) {
    registeredQuickRecordShortcuts = [preferredQuickRecordShortcut]
    console.info(`[quick-record] registered global shortcut: ${preferredQuickRecordShortcut}`)
  } else {
    console.warn('[quick-record] failed to register global shortcut')
  }
}

function registerWealthShortcut() {
  if (registeredWealthShortcuts.length > 0) {
    return
  }

  const registered = globalShortcut.register(preferredWealthShortcut, openWealthQuickFloat)
  if (registered) {
    registeredWealthShortcuts = [preferredWealthShortcut]
    console.info(`[wealth] registered global shortcut: ${preferredWealthShortcut}`)
  } else {
    console.warn('[wealth] quick record shortcut registration failed')
  }
}

app.whenReady().then(() => {
  const appPaths = ensureAppPaths()
  const db = new GrowthTreeDatabase(appPaths.sqlitePath, appPaths.reviewsDir)
  registerIpc(db, appPaths)
  createWindow()
  registerTimeDebtShortcut()
  registerWealthShortcut()
  registerQuickRecordShortcut()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
