import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dgram from "node:dgram";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- OSC Receiver ---
const OSC_PORT = 7000;
const udpServer = dgram.createSocket("udp4");

udpServer.on("message", (msg) => {
  // 簡易OSCパース: /mangacatch/players [10 floats]
  // 仕様: address(string), types(string starting with ,), data(float32be * 10)
  // 固定パケット長を想定した簡易実装
  try {
    const address = msg.toString('utf8', 0, 20).split('\0')[0];
    if (address === "/mangacatch/players") {
      // OSC string padding は 4byte 境界
      // /mangacatch/players\0\0\0\0 ,ffffffffff\0\0 [data]
      // 実際の実装ではオフセットを計算する必要があるが、一旦メッセージ全体を投げるか
      // あるいは renderer 側でパースさせる（安全のため raw buffer は送れないので変換）
      const data = Array.from(new Float32Array(msg.buffer, msg.byteOffset, msg.byteLength / 4));
      BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send("osc-data", data);
      });
    }
  } catch (e) {
    // 静かに無視
  }
});

udpServer.on("error", (err) => {
  console.error(`[OSC] Server error:\n${err.stack}`);
  udpServer.close();
});

udpServer.bind(OSC_PORT, () => {
  console.log(`[OSC] Listening on port ${OSC_PORT}`);
});

// --- Electron App ---
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

function createWindow() {
  console.log('[Main] createWindow: Starting...');
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: process.env.NODE_ENV === 'production',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => {
    console.log('[Main] Window ready-to-show');
    win.show();
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
