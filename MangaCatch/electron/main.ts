import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. GPU Disabled (Stability)
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

function createWindow() {
  console.log('[Main] createWindow: Starting...');
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Prevent white flash, show when ready
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Ready to show
  win.once('ready-to-show', () => {
    console.log('[Main] Window ready-to-show');
    win.show();
  });

  // 2. Logging
  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.error('[did-fail-load]', { code, desc, url });
  });

  win.webContents.on('render-process-gone', (e, details) => {
    console.error('[render-process-gone]', details);
  });

  win.webContents.on('unresponsive', () => {
    console.error('[unresponsive]');
  });

  // 3. Renderer Console to Main
  win.webContents.on('console-message', (e, level, message, line, sourceId) => {
    console.log(`[renderer] ${level}: ${message} (${sourceId}:${line})`);
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    console.log('[Main] Loading Dev URL:', devUrl);
    win.loadURL(devUrl);
    // DevTools only in dev mode
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const prodPath = path.join(__dirname, "../dist/index.html");
    console.log('[Main] Loading Production File:', prodPath);
    win.loadFile(prodPath);
  }
}

// Global child process error
app.on('child-process-gone', (e, details) => {
  console.error('[child-process-gone]', details);
});

app.whenReady().then(() => {
  console.log('[Main] App Ready');
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
