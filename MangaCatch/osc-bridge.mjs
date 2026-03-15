/**
 * OSC → WebSocket ブリッジ
 * ChromeBook開発用: TouchDesignerのOSCをブラウザに中継する
 *
 * 使い方:
 *   node osc-bridge.mjs
 *
 * TouchDesignerの送信先: localhost:7000 (UDP)
 * ブラウザの接続先: ws://localhost:8765
 */

import * as dgram from 'node:dgram';
import { WebSocketServer } from 'ws';

const OSC_PORT = 7000;
const WS_PORT = 8765;

// ============================================================
// OSC parser (electron/main.ts と同じロジック)
// ============================================================

function readOscString(buffer, startOffset) {
  let end = startOffset;
  while (end < buffer.length && buffer[end] !== 0) end += 1;
  const value = buffer.toString('utf8', startOffset, end);
  end += 1;
  while (end % 4 !== 0) end += 1;
  return { value, nextOffset: end };
}

function parseOscMessage(buffer) {
  if (!buffer || buffer.length < 4) throw new Error('OSC buffer too small');
  const addressInfo = readOscString(buffer, 0);
  const address = addressInfo.value;
  if (!address.startsWith('/')) throw new Error(`Invalid OSC address: "${address}"`);
  if (addressInfo.nextOffset >= buffer.length) return { address, args: [] };

  const typeInfo = readOscString(buffer, addressInfo.nextOffset);
  const typeTag = typeInfo.value;
  if (!typeTag.startsWith(',')) return { address, args: [] };

  const tags = typeTag.slice(1);
  let offset = typeInfo.nextOffset;
  const args = [];

  for (const tag of tags) {
    switch (tag) {
      case 'i':
        if (offset + 4 > buffer.length) throw new Error('OSC int32 overflow');
        args.push(buffer.readInt32BE(offset)); offset += 4; break;
      case 'f':
        if (offset + 4 > buffer.length) throw new Error('OSC float32 overflow');
        args.push(buffer.readFloatBE(offset)); offset += 4; break;
      case 's': { const s = readOscString(buffer, offset); args.push(s.value); offset = s.nextOffset; break; }
      case 'T': args.push(true); break;
      case 'F': args.push(false); break;
      case 'N': args.push(null); break;
      default:
        if (offset + 4 <= buffer.length) offset += 4;
        args.push(null); break;
    }
  }
  return { address, args };
}

function isOscBundle(buffer) {
  // '#bundle' = 0x23 0x62 0x75 0x6e 0x64 0x6c 0x65
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x23 && buffer[1] === 0x62 && buffer[2] === 0x75 &&
    buffer[3] === 0x6e && buffer[4] === 0x64 && buffer[5] === 0x6c && buffer[6] === 0x65
  );
}

function parseOscBundle(buffer) {
  if (!buffer || buffer.length < 16) throw new Error('OSC bundle too small');
  let offset = 16; // skip '#bundle\0' (8 bytes) + timetag (8 bytes)
  const messages = [];
  while (offset < buffer.length) {
    if (offset + 4 > buffer.length) break;
    const elementSize = buffer.readInt32BE(offset);
    offset += 4;
    if (elementSize <= 0 || offset + elementSize > buffer.length) break;
    const elementBuffer = buffer.subarray(offset, offset + elementSize);
    offset += elementSize;
    try {
      if (isOscBundle(elementBuffer)) {
        for (const m of parseOscBundle(elementBuffer)) messages.push(m);
      } else {
        messages.push(parseOscMessage(elementBuffer));
      }
    } catch { /* skip */ }
  }
  return messages;
}

function interpretTuioBundle(messages) {
  const tuioMessages = messages.filter(m => m.address.toLowerCase().startsWith('/tuio'));
  if (tuioMessages.length === 0) {
    return { frame: Date.now(), players: [], parseMode: 'touches', parseError: 'No /tuio messages in bundle' };
  }

  // alive / fseq / set を1パスで処理
  const aliveIds = new Set();
  let frame = Date.now();
  const players = [];

  for (const msg of tuioMessages) {
    const cmd = msg.args[0];
    if (cmd === 'alive') {
      for (let i = 1; i < msg.args.length; i++) {
        const id = toFiniteNumber(msg.args[i]);
        if (id !== null) aliveIds.add(Math.round(id));
      }
    } else if (cmd === 'fseq') {
      const fseq = toFiniteNumber(msg.args[1]);
      if (fseq !== null && fseq > 0) frame = fseq;
    } else if (cmd === 'set') {
      const id = toFiniteNumber(msg.args[1]);
      const x = toFiniteNumber(msg.args[2]);
      const y = toFiniteNumber(msg.args[3]);
      if (id !== null && x !== null && y !== null) {
        players.push({ id: Math.round(id), x, y });
      }
    }
  }

  // alive リストがある場合は非アクティブなプレイヤーを除外
  const activePlayers = aliveIds.size > 0 ? players.filter(p => aliveIds.has(p.id)) : players;
  return { frame, players: activePlayers, parseMode: 'touches', parseError: activePlayers.length === 0 ? 'No active TUIO cursors' : null };
}

function toFiniteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') { const n = Number(value); if (Number.isFinite(n)) return n; }
  return null;
}

function classifyAddress(address) {
  const lower = address.toLowerCase();
  if (lower === '/touches' || lower.includes('touch')) return 'touches';
  if (lower === '/mangacatch/players' || lower.includes('player')) return 'mangacatch_players';
  return 'unknown';
}

function scoreAxis(value, axis) {
  if (!Number.isFinite(value)) return -1000;
  if (value >= 0 && value <= 1) return 6;
  if (axis === 'x') {
    if (value >= 0 && value <= 1920) return 5;
    if (value >= 0 && value <= 10000) return 4;
  } else {
    if (value >= 0 && value <= 1080) return 5;
    if (value >= 0 && value <= 10000) return 4;
  }
  if (Math.abs(value) <= 50000) return 1;
  return -1000;
}

function buildPlayersByPattern(values, startIndex, stride, xPos, yPos, idPos) {
  const players = [];
  let score = 0, autoId = 0;
  for (let i = startIndex; i + stride - 1 < values.length; i += stride) {
    const chunk = values.slice(i, i + stride);
    const x = chunk[xPos], y = chunk[yPos];
    const axisScore = scoreAxis(x, 'x') + scoreAxis(y, 'y');
    if (!Number.isFinite(x) || !Number.isFinite(y) || axisScore < 4) continue;
    let id = autoId;
    if (typeof idPos === 'number' && Number.isFinite(chunk[idPos])) id = Math.round(chunk[idPos]);
    players.push({ id, x, y });
    autoId += 1;
    score += axisScore;
  }
  score += players.length * 100;
  return { players, score };
}

function interpretArgs(address, args) {
  const parseMode = classifyAddress(address);
  const numericArgs = args.map(toFiniteNumber).filter(v => v !== null);
  let frame = Date.now();
  if (numericArgs.length === 0) return { frame, players: [], parseMode, parseError: 'no numeric args' };

  const startCandidates = new Set([0]);
  if (Number.isInteger(numericArgs[0]) && numericArgs[0] > 10) {
    frame = numericArgs[0]; startCandidates.add(1);
    if (numericArgs.length >= 2 && Number.isInteger(numericArgs[1]) && numericArgs[1] >= 0 && numericArgs[1] <= 16)
      startCandidates.add(2);
  } else if (Number.isInteger(numericArgs[0]) && numericArgs[0] >= 0 && numericArgs[0] <= 16) {
    startCandidates.add(1);
  }

  const patterns = [
    { stride: 2, xPos: 0, yPos: 1, idPos: undefined },
    { stride: 3, xPos: 0, yPos: 1, idPos: 2 },
    { stride: 3, xPos: 1, yPos: 2, idPos: 0 },
    { stride: 4, xPos: 0, yPos: 1, idPos: 2 },
    { stride: 4, xPos: 2, yPos: 3, idPos: 0 },
    { stride: 4, xPos: 1, yPos: 2, idPos: 0 },
    { stride: 4, xPos: 0, yPos: 1, idPos: undefined },
    { stride: 4, xPos: 2, yPos: 3, idPos: undefined },
  ];

  let bestPlayers = [], bestScore = -999999;
  for (const startIndex of startCandidates) {
    for (const pattern of patterns) {
      const candidate = buildPlayersByPattern(numericArgs, startIndex, pattern.stride, pattern.xPos, pattern.yPos, pattern.idPos);
      if (candidate.players.length > bestPlayers.length ||
        (candidate.players.length === bestPlayers.length && candidate.score > bestScore)) {
        bestPlayers = candidate.players;
        bestScore = candidate.score;
      }
    }
  }

  if (bestPlayers.length > 0) return { frame, players: bestPlayers, parseMode, parseError: null };
  return { frame, players: [], parseMode, parseError: 'failed to interpret players' };
}

// ============================================================
// WebSocket server
// ============================================================

const wss = new WebSocketServer({ port: WS_PORT });
let clientCount = 0;

wss.on('connection', (ws) => {
  clientCount++;
  console.log(`[WS] ブラウザ接続 (計${clientCount}台)`);
  ws.on('close', () => { clientCount--; console.log(`[WS] 切断 (計${clientCount}台)`); });
});

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg); // OPEN
  }
}

console.log(`[WS]  WebSocketサーバー起動 → ws://localhost:${WS_PORT}`);

// ============================================================
// UDP / OSC listener
// ============================================================

const udpServer = dgram.createSocket('udp4');

udpServer.on('error', (err) => console.error('[OSC] UDPエラー:', err));

udpServer.on('message', (buffer) => {
  let address = '/unknown', args = [], frame = Date.now(), players = [], parseMode = 'unknown', parseError = null;
  try {
    if (isOscBundle(buffer)) {
      const messages = parseOscBundle(buffer);
      address = '/bundle';
      const interpreted = interpretTuioBundle(messages);
      frame = interpreted.frame;
      players = interpreted.players;
      parseMode = interpreted.parseMode;
      parseError = interpreted.parseError;
    } else {
      const parsed = parseOscMessage(buffer);
      address = parsed.address;
      args = parsed.args;
      const interpreted = interpretArgs(address, args);
      frame = interpreted.frame;
      players = interpreted.players;
      parseMode = interpreted.parseMode;
      parseError = interpreted.parseError;
    }
  } catch (e) {
    parseError = e instanceof Error ? e.message : String(e);
  }

  const payload = {
    frame, players, address, args,
    argCount: args.length, parseMode, parseError,
    receivedAt: Date.now(),
    rawPreview: `${address} [${args.slice(0, 8).join(', ')}${args.length > 8 ? ', ...' : ''}]`,
  };

  broadcast(payload);

  if (players.length > 0) {
    process.stdout.write(`\r[OSC] ${address}  players=${players.length}  x=${players.map(p => p.x.toFixed(3)).join(',')}   `);
  }
});

udpServer.bind(OSC_PORT, '0.0.0.0', () => {
  console.log(`[OSC] UDP待受け起動   → udp://0.0.0.0:${OSC_PORT}`);
  console.log('');
  console.log('準備完了！Chromeで以下を開いてください:');
  console.log('  http://localhost:5173/');
  console.log('');
  console.log('TouchDesignerのOSC送信先:');
  console.log(`  アドレス: localhost  ポート: ${OSC_PORT}`);
});
