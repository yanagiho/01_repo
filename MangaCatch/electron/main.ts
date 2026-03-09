import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dgram from "node:dgram";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// OSC Receiver
// =====================================================
const OSC_PORT = 7000;
const udpServer = dgram.createSocket("udp4");

type OscArg =
  | { type: "i"; value: number }
  | { type: "f"; value: number }
  | { type: "s"; value: string }
  | { type: "unknown"; value: null };

function align4(n: number) {
  return (n + 3) & ~3;
}

function readOscString(buf: Buffer, offset: number): { value: string; next: number } {
  let end = offset;
  while (end < buf.length && buf[end] !== 0) end++;
  const value = buf.toString("utf8", offset, end);
  return { value, next: align4(end + 1) };
}

function readInt32BE(buf: Buffer, offset: number): { value: number; next: number } {
  if (offset + 4 > buf.length) return { value: 0, next: buf.length };
  return { value: buf.readInt32BE(offset), next: offset + 4 };
}

function readFloat32BE(buf: Buffer, offset: number): { value: number; next: number } {
  if (offset + 4 > buf.length) return { value: 0, next: buf.length };
  return { value: buf.readFloatBE(offset), next: offset + 4 };
}

function parseOscPacket(buf: Buffer): { address: string; args: OscArg[] } | null {
  try {
    let offset = 0;

    // address
    const addr = readOscString(buf, offset);
    const address = addr.value;
    offset = addr.next;

    if (!address.startsWith("/")) return null;
    if (offset >= buf.length) return { address, args: [] };

    // typetag
    const tag = readOscString(buf, offset);
    const typetag = tag.value;
    offset = tag.next;

    if (!typetag.startsWith(",")) {
      // typetagが無い/壊れているケース
      return { address, args: [] };
    }

    const args: OscArg[] = [];
    for (let i = 1; i < typetag.length; i++) {
      const t = typetag[i];
      if (t === "i") {
        const r = readInt32BE(buf, offset);
        args.push({ type: "i", value: r.value });
        offset = r.next;
      } else if (t === "f") {
        const r = readFloat32BE(buf, offset);
        args.push({ type: "f", value: r.value });
        offset = r.next;
      } else if (t === "s") {
        const r = readOscString(buf, offset);
        args.push({ type: "s", value: r.value });
        offset = r.next;
      } else {
        // 未対応型は安全にスキップ不能なので unknown 扱い
        args.push({ type: "unknown", value: null });
      }
    }

    return { address, args };
  } catch (e) {
    console.error("[OSC] parse error:", e);
    return null;
  }
}

function numericArgs(args: OscArg[]): number[] {
  return args
    .filter((a) => a.type === "i" || a.type === "f")
    .map((a) => (a.type === "i" || a.type === "f" ? a.value : 0))
    .filter((n) => Number.isFinite(n));
}

function broadcastOscData(data: number[]) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send("osc-data", data);
  });
}

udpServer.on("message", (msg) => {
  try {
    const parsed = parseOscPacket(msg);
    if (!parsed) return;

    // -------------------------------------------------
    // 1) HokuyoUtil / TouchDesigner の /touches
    // 期待形: [frame, x1, y1, x2, y2, ...]
    // -------------------------------------------------
    if (parsed.address === "/touches") {
      const nums = numericArgs(parsed.args);

      // そのまま renderer に送る
      // SensorManager 側が count を見る/後段で使える形を優先
      if (nums.length >= 1) {
        broadcastOscData(nums);
      }
      return;
    }

    // -------------------------------------------------
    // 2) 旧形式 /mangacatch/players
    // -------------------------------------------------
    if (parsed.address === "/mangacatch/players") {
      const nums = numericArgs(parsed.args);
      if (nums.length > 0) {
        broadcastOscData(nums);
      }
      return;
    }

    // -------------------------------------------------
    // 3) 後方互換：壊れた簡易パケットっぽい場合
    //    （旧 main.ts の Float32Array 化に近いフォールバック）
    // -------------------------------------------------
    if (parsed.address.startsWith("/")) {
      const rawFloatCount = Math.floor(msg.byteLength / 4);
      if (rawFloatCount > 0) {
        try {
          const arr = Array.from(
            new Float32Array(msg.buffer, msg.byteOffset, rawFloatCount)
          ).filter((n) => Number.isFinite(n));
          if (arr.length > 0) {
            broadcastOscData(arr);
          }
        } catch {
          // 何もしない
        }
      }
    }
  } catch (e) {
    console.error("[OSC] message handler error:", e);
  }
});

udpServer.on("error", (err) => {
  console.error(`[OSC] Server error:\n${err.stack}`);
  udpServer.close();
});

udpServer.bind(OSC_PORT, () => {
  console.log(`[OSC] Listening on port ${OSC_PORT}`);
});

// =====================================================
// Electron App
// =====================================================
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");

function createWindow() {
  console.log("[Main] createWindow: Starting...");

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: process.env.NODE_ENV === "production",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => {
    console.log("[Main] Window ready-to-show");
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
