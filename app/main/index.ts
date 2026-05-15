import { app, BrowserWindow, globalShortcut } from 'electron'
import { join } from 'node:path'
import { ensureAppPaths } from './storage'
import { GrowthTreeDatabase } from './db'
import { registerIpc } from './ipc'

const timeDebtOpenQuickFloatChannel = 'time-debt:open-quick-float'
const preferredTimeDebtShortcut = 'CommandOrControl+Alt+T'
const fallbackTimeDebtShortcut = 'CommandOrControl+Shift+L'

let mainWindow: BrowserWindow | null = null
let registeredTimeDebtShortcuts: string[] = []

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
  sendOpenTimeDebtQuickFloat(mainWindow)
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

app.whenReady().then(() => {
  const appPaths = ensureAppPaths()
  const db = new GrowthTreeDatabase(appPaths.sqlitePath, appPaths.reviewsDir)
  registerIpc(db, appPaths)
  createWindow()
  registerTimeDebtShortcut()

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
