import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server as OscServer } from "node-osc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ──────────────────────────────────────
// 型定義
// ──────────────────────────────────────

type OscPlayerSignal = {
  x: number;
  y: number;
  id: number;
};

type OscPayload = {
  frame: number;
  players: OscPlayerSignal[];
};

// ──────────────────────────────────────
// OSC サーバー (node-osc) — ポート 10000
// ──────────────────────────────────────

const OSC_PORT = 10000;
const OSC_HOST = "0.0.0.0";

/** TUIO /tuio/2Dcur で管理中のアクティブカーソル */
const tuioCursors = new Map<number, { x: number; y: number }>();
let tuioFrame = 0;

/**
 * レンダラー側に OscPayload を IPC で送る
 */
function broadcastOscPayload(payload: OscPayload) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("osc-data", payload);
  }
}

/**
 * TUIO /tuio/2Dcur メッセージの処理
 * プロファイル仕様: https://www.tuio.org/?specification
 *
 * set s x y X Y m   — カーソル更新
 * alive s1 s2 ...    — 現在生存中のセッションIDリスト
 * fseq frame         — フレーム番号
 */
function handleTuio2Dcur(args: (string | number | boolean)[]) {
  if (args.length < 1) return;

  const command = args[0];

  if (command === "set" && args.length >= 4) {
    const sessionId = Number(args[1]);
    const x = Number(args[2]);
    const y = Number(args[3]);
    if (Number.isFinite(sessionId) && Number.isFinite(x) && Number.isFinite(y)) {
      tuioCursors.set(sessionId, { x, y });
    }
  } else if (command === "alive") {
    // alive で列挙されていないセッションIDは削除
    const aliveIds = new Set<number>();
    for (let i = 1; i < args.length; i++) {
      const id = Number(args[i]);
      if (Number.isFinite(id)) aliveIds.add(id);
    }
    for (const key of tuioCursors.keys()) {
      if (!aliveIds.has(key)) tuioCursors.delete(key);
    }
  } else if (command === "fseq") {
    tuioFrame = Number(args[1]) || 0;

    // fseq が来たタイミングで 1 フレーム分を確定して送信
    const players: OscPlayerSignal[] = [];
    let idx = 1;
    for (const [sessionId, pos] of tuioCursors.entries()) {
      players.push({ x: pos.x, y: pos.y, id: sessionId });
      idx++;
    }
    broadcastOscPayload({ frame: tuioFrame, players });
  }
}

/**
 * /touches アドレスの処理 (既存互換)
 * args: [frame, x1, y1, x2, y2, ...]
 */
function handleTouches(args: (string | number | boolean)[]) {
  const nums = args.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const frame = nums.length > 0 ? nums[0] : 0;
  const players: OscPlayerSignal[] = [];
  for (let i = 1; i + 1 < nums.length; i += 2) {
    players.push({ x: nums[i], y: nums[i + 1], id: players.length + 1 });
  }
  broadcastOscPayload({ frame, players });
}

/**
 * /mangacatch/players アドレスの処理 (既存互換)
 */
function handleMangacatchPlayers(args: (string | number | boolean)[]) {
  const nums = args.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const startIndex = nums.length % 2 === 1 ? 1 : 0;
  const frame = startIndex === 1 ? nums[0] : 0;
  const players: OscPlayerSignal[] = [];
  for (let i = startIndex; i + 1 < nums.length; i += 2) {
    players.push({ x: nums[i], y: nums[i + 1], id: players.length + 1 });
  }
  broadcastOscPayload({ frame, players });
}

// OSCサーバーを起動
const oscServer = new OscServer(OSC_PORT, OSC_HOST, () => {
  console.log(`[OSC] Listening on ${OSC_HOST}:${OSC_PORT}`);
});

oscServer.on("message", (message) => {
  // ★★★ 全 OSC メッセージをログ出力（最重要）★★★
  console.log("[OSC] Received:", JSON.stringify(message));

  const address = message[0];
  const args = message.slice(1) as (string | number | boolean)[];

  try {
    if (address === "/tuio/2Dcur") {
      handleTuio2Dcur(args);
      return;
    }

    if (address === "/touches") {
      handleTouches(args);
      return;
    }

    if (address === "/mangacatch/players") {
      handleMangacatchPlayers(args);
      return;
    }

    // 未知のアドレスでも数値引数があればプレイヤーとして扱う（汎用フォールバック）
    const nums = args.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (nums.length >= 2) {
      const startIndex = nums.length % 2 === 1 ? 1 : 0;
      const frame = startIndex === 1 ? nums[0] : 0;
      const players: OscPlayerSignal[] = [];
      for (let i = startIndex; i + 1 < nums.length; i += 2) {
        players.push({ x: nums[i], y: nums[i + 1], id: players.length + 1 });
      }
      broadcastOscPayload({ frame, players });
    }
  } catch (err) {
    console.error("[OSC] message handler error:", err);
  }
});

oscServer.on("error", (err: Error) => {
  console.error(`[OSC] Server error:\n${err.stack || err.message}`);
});

// ──────────────────────────────────────
// Electron アプリ
// ──────────────────────────────────────

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
