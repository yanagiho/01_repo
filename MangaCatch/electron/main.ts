import { app, BrowserWindow } from 'electron';
import * as dgram from 'node:dgram';
import * as fs from 'node:fs';
import * as path from 'node:path';

type OscArg = number | string | boolean | null;
type ParseMode = 'touches' | 'mangacatch_players' | 'unknown';

type OscPlayer = {
  id: number;
  x: number;
  y: number;
};

type RendererOscPayload = {
  frame: number;
  players: OscPlayer[];
  address: string;
  args: OscArg[];
  argCount: number;
  parseMode: ParseMode;
  parseError: string | null;
  receivedAt: number;
  rawPreview: string;
};

const OSC_PORT = 7000;

let mainWindow: BrowserWindow | null = null;
let udpServer: dgram.Socket | null = null;

function readOscString(buffer: Buffer, startOffset: number): { value: string; nextOffset: number } {
  let end = startOffset;

  while (end < buffer.length && buffer[end] !== 0) {
    end += 1;
  }

  const value = buffer.toString('utf8', startOffset, end);

  end += 1;
  while (end % 4 !== 0) {
    end += 1;
  }

  return { value, nextOffset: end };
}

function parseOscMessage(buffer: Buffer): { address: string; args: OscArg[] } {
  if (!buffer || buffer.length < 4) {
    throw new Error('OSC buffer is empty or too small');
  }

  const addressInfo = readOscString(buffer, 0);
  const address = addressInfo.value;

  if (!address.startsWith('/')) {
    throw new Error(`OSC address not found: "${address}"`);
  }

  if (addressInfo.nextOffset >= buffer.length) {
    return { address, args: [] };
  }

  const typeInfo = readOscString(buffer, addressInfo.nextOffset);
  const typeTag = typeInfo.value;

  if (!typeTag.startsWith(',')) {
    return { address, args: [] };
  }

  const tags = typeTag.slice(1);
  let offset = typeInfo.nextOffset;
  const args: OscArg[] = [];

  for (const tag of tags) {
    switch (tag) {
      case 'i': {
        if (offset + 4 > buffer.length) {
          throw new Error('OSC int32 read overflow');
        }
        args.push(buffer.readInt32BE(offset));
        offset += 4;
        break;
      }

      case 'f': {
        if (offset + 4 > buffer.length) {
          throw new Error('OSC float32 read overflow');
        }
        args.push(buffer.readFloatBE(offset));
        offset += 4;
        break;
      }

      case 's': {
        const s = readOscString(buffer, offset);
        args.push(s.value);
        offset = s.nextOffset;
        break;
      }

      case 'T':
        args.push(true);
        break;

      case 'F':
        args.push(false);
        break;

      case 'N':
        args.push(null);
        break;

      default: {
        if (offset + 4 <= buffer.length) {
          offset += 4;
        }
        args.push(null);
        break;
      }
    }
  }

  return { address, args };
}

function toFiniteNumber(value: OscArg): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }

  return null;
}

function classifyAddress(address: string): ParseMode {
  const lower = address.toLowerCase();

  if (lower === '/touches' || lower.includes('touch')) {
    return 'touches';
  }

  if (lower === '/mangacatch/players' || lower.includes('player')) {
    return 'mangacatch_players';
  }

  return 'unknown';
}

function scoreAxis(value: number, axis: 'x' | 'y'): number {
  if (!Number.isFinite(value)) {
    return -1000;
  }

  if (value >= 0 && value <= 1) {
    return 6;
  }

  if (axis === 'x') {
    if (value >= 0 && value <= 1920) return 5;
    if (value >= 0 && value <= 10000) return 4;
  } else {
    if (value >= 0 && value <= 1080) return 5;
    if (value >= 0 && value <= 10000) return 4;
  }

  if (Math.abs(value) <= 50000) {
    return 1;
  }

  return -1000;
}

function buildPlayersByPattern(
  values: number[],
  startIndex: number,
  stride: number,
  xPos: number,
  yPos: number,
  idPos?: number,
): { players: OscPlayer[]; score: number; pattern: string } {
  const players: OscPlayer[] = [];
  let score = 0;
  let autoId = 0;

  for (let i = startIndex; i + stride - 1 < values.length; i += stride) {
    const chunk = values.slice(i, i + stride);
    const x = chunk[xPos];
    const y = chunk[yPos];

    const axisScore = scoreAxis(x, 'x') + scoreAxis(y, 'y');

    if (!Number.isFinite(x) || !Number.isFinite(y) || axisScore < 4) {
      continue;
    }

    let id = autoId;
    if (typeof idPos === 'number' && Number.isFinite(chunk[idPos])) {
      id = Math.round(chunk[idPos]);
    }

    players.push({ id, x, y });
    autoId += 1;
    score += axisScore;
  }

  score += players.length * 100;

  return {
    players,
    score,
    pattern: `start=${startIndex}, stride=${stride}, xPos=${xPos}, yPos=${yPos}, idPos=${typeof idPos === 'number' ? idPos : 'none'}`,
  };
}

function interpretArgs(address: string, args: OscArg[]): {
  frame: number;
  players: OscPlayer[];
  parseMode: ParseMode;
  parseError: string | null;
} {
  const parseMode = classifyAddress(address);
  const numericArgs = args
    .map(toFiniteNumber)
    .filter((v): v is number => v !== null);

  let frame = Date.now();

  if (numericArgs.length === 0) {
    return {
      frame,
      players: [],
      parseMode,
      parseError: 'numeric args が 0 件です',
    };
  }

  const startCandidates = new Set<number>([0]);

  if (Number.isInteger(numericArgs[0]) && numericArgs[0] > 10) {
    frame = numericArgs[0];
    startCandidates.add(1);

    if (
      numericArgs.length >= 2 &&
      Number.isInteger(numericArgs[1]) &&
      numericArgs[1] >= 0 &&
      numericArgs[1] <= 16
    ) {
      startCandidates.add(2);
    }
  } else if (
    Number.isInteger(numericArgs[0]) &&
    numericArgs[0] >= 0 &&
    numericArgs[0] <= 16
  ) {
    startCandidates.add(1);
  }

  const patterns = [
    { stride: 2, xPos: 0, yPos: 1, idPos: undefined }, // x,y
    { stride: 3, xPos: 0, yPos: 1, idPos: 2 },         // x,y,id
    { stride: 3, xPos: 1, yPos: 2, idPos: 0 },         // id,x,y
    { stride: 4, xPos: 0, yPos: 1, idPos: 2 },         // x,y,id,lifetime
    { stride: 4, xPos: 2, yPos: 3, idPos: 0 },         // id,lifetime,x,y
    { stride: 4, xPos: 1, yPos: 2, idPos: 0 },         // id,x,y,lifetime
    { stride: 4, xPos: 0, yPos: 1, idPos: undefined }, // x,y,*,*
    { stride: 4, xPos: 2, yPos: 3, idPos: undefined }, // *,*,x,y
  ];

  let bestPlayers: OscPlayer[] = [];
  let bestScore = -999999;
  let bestPattern = '(none)';

  for (const startIndex of startCandidates) {
    for (const pattern of patterns) {
      const candidate = buildPlayersByPattern(
        numericArgs,
        startIndex,
        pattern.stride,
        pattern.xPos,
        pattern.yPos,
        pattern.idPos,
      );

      if (
        candidate.players.length > bestPlayers.length ||
        (candidate.players.length === bestPlayers.length && candidate.score > bestScore)
      ) {
        bestPlayers = candidate.players;
        bestScore = candidate.score;
        bestPattern = candidate.pattern;
      }
    }
  }

  if (bestPlayers.length > 0) {
    return {
      frame,
      players: bestPlayers,
      parseMode,
      parseError: null,
    };
  }

  return {
    frame,
    players: [],
    parseMode,
    parseError: `players 解釈失敗: address=${address}, numericArgs=${JSON.stringify(
      numericArgs.slice(0, 20),
    )}, bestPattern=${bestPattern}`,
  };
}

function formatArgForPreview(arg: OscArg): string {
  if (typeof arg === 'number') {
    return Number.isInteger(arg) ? String(arg) : arg.toFixed(4);
  }

  if (typeof arg === 'string') {
    return `"${arg}"`;
  }

  if (typeof arg === 'boolean') {
    return arg ? 'true' : 'false';
  }

  return 'null';
}

function makeRawPreview(address: string, args: OscArg[]): string {
  const preview = args.slice(0, 16).map(formatArgForPreview).join(', ');
  return `${address} [${preview}${args.length > 16 ? ', ...' : ''}]`;
}

function sendOscToRenderer(payload: RendererOscPayload): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send('osc-data', payload);
}

function startUdpServer(): void {
  if (udpServer) {
    return;
  }

  udpServer = dgram.createSocket('udp4');

  udpServer.on('error', (error) => {
    console.error('[OSC] UDP error:', error);
  });

  udpServer.on('message', (buffer) => {
    let address = '/unknown';
    let args: OscArg[] = [];
    let frame = Date.now();
    let players: OscPlayer[] = [];
    let parseMode: ParseMode = 'unknown';
    let parseError: string | null = null;

    try {
      const parsed = parseOscMessage(buffer);
      address = parsed.address;
      args = parsed.args;

      const interpreted = interpretArgs(address, args);
      frame = interpreted.frame;
      players = interpreted.players;
      parseMode = interpreted.parseMode;
      parseError = interpreted.parseError;
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
    }

    const payload: RendererOscPayload = {
      frame,
      players,
      address,
      args,
      argCount: args.length,
      parseMode,
      parseError,
      receivedAt: Date.now(),
      rawPreview: makeRawPreview(address, args),
    };

    sendOscToRenderer(payload);
  });

  udpServer.bind(OSC_PORT, '0.0.0.0', () => {
    console.log(`[OSC] listening on udp://0.0.0.0:${OSC_PORT}`);
  });
}

function resolveRendererPath(): string | null {
  const candidates = [
    path.join(__dirname, '../dist/index.html'),
    path.join(__dirname, '../../dist/index.html'),
    path.join(app.getAppPath(), 'dist/index.html'),
    path.join(process.resourcesPath, 'app.asar/dist/index.html'),
    path.join(process.resourcesPath, 'app/dist/index.html'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow
      .loadURL(devServerUrl)
      .catch((error) => console.error('[Electron] loadURL failed:', error));
  } else {
    const rendererPath = resolveRendererPath();

    if (rendererPath) {
      mainWindow
        .loadFile(rendererPath)
        .catch((error) =>
          console.error('[Electron] loadFile failed:', error, 'path=', rendererPath),
        );
    } else {
      mainWindow.loadURL(
        'data:text/html;charset=utf-8,' +
        encodeURIComponent(
          '<html><body style="background:#111;color:#0f0;font-family:monospace;padding:20px;">Renderer not found</body></html>',
        ),
      );
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  startUdpServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (udpServer) {
    try {
      udpServer.close();
    } catch {
      // noop
    }
    udpServer = null;
  }
});