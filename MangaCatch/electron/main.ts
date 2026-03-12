import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dgram from "node:dgram";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type OscArg = number | string;

type OscPlayerSignal = {
  x: number;
  y: number;
  id: number;
};

type OscPayload = {
  frame: number;
  players: OscPlayerSignal[];
};

const OSC_PORT = 7000;
const udpServer = dgram.createSocket("udp4");

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

    const addr = readOscString(buf, offset);
    offset = addr.next;

    if (!addr.value.startsWith("/")) return null;

    const typeTag = readOscString(buf, offset);
    offset = typeTag.next;

    if (!typeTag.value.startsWith(",")) {
      return {
        address: addr.value,
        args: [],
      };
    }

    const types = typeTag.value.slice(1);
    const args: OscArg[] = [];

    for (const t of types) {
      if (t === "i") {
        const r = readInt32BE(buf, offset);
        args.push(r.value);
        offset = r.next;
      } else if (t === "f") {
        const r = readFloat32BE(buf, offset);
        args.push(r.value);
        offset = r.next;
      } else if (t === "s") {
        const r = readOscString(buf, offset);
        args.push(r.value);
        offset = r.next;
      }
    }

    return {
      address: addr.value,
      args,
    };
  } catch (err) {
    console.error("[OSC] parse error:", err);
    return null;
  }
}

function toNumberArgs(args: OscArg[]): number[] {
  return args.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

function buildPlayersFromXY(values: number[], startIndex: number): OscPlayerSignal[] {
  const players: OscPlayerSignal[] = [];

  for (let i = startIndex; i + 1 < values.length; i += 2) {
    const x = values[i];
    const y = values[i + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    players.push({
      x,
      y,
      id: players.length + 1,
    });
  }

  return players;
}

function broadcastOscPayload(payload: OscPayload) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("osc-data", payload);
  }
}

udpServer.on("message", (msg) => {
  try {
    const parsed = parseOscPacket(msg);
    if (!parsed) return;

    if (parsed.address === "/touches") {
      const nums = toNumberArgs(parsed.args);
      const frame = nums.length > 0 ? nums[0] : 0;
      const players = buildPlayersFromXY(nums, 1);

      broadcastOscPayload({
        frame,
        players,
      });
      return;
    }

    if (parsed.address === "/mangacatch/players") {
      const nums = toNumberArgs(parsed.args);
      const startIndex = nums.length % 2 === 1 ? 1 : 0;
      const frame = startIndex === 1 ? nums[0] : 0;
      const players = buildPlayersFromXY(nums, startIndex);

      broadcastOscPayload({
        frame,
        players,
      });
      return;
    }
  } catch (err) {
    console.error("[OSC] message handler error:", err);
  }
});

udpServer.on("error", (err) => {
  console.error(`[OSC] Server error:\n${err.stack}`);
  udpServer.close();
});

udpServer.bind(OSC_PORT, () => {
  console.log(`[OSC] Listening on port ${OSC_PORT}`);
});

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