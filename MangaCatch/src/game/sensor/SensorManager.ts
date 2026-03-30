export type SensorPlayer = {
  id: number;
  x: number;
  y: number;
};

// センサーの実際の検出範囲（端まで届かない場合はここで調整）
// 例: センサーが 0.05〜0.95 の範囲しか出力しない場合は SENSOR_X_MIN=0.05, MAX=0.95
const SENSOR_X_MIN = 0.0;
const SENSOR_X_MAX = 1.0;
const MAX_PLAYERS = 3;

export type SensorDebugInfo = {
  oscReceived: boolean;
  lastReceivedAt: number;
  frame: number;
  lastOscAddress: string;
  argCount: number;
  argsPreview: string;
  parseMode: 'touches' | 'mangacatch_players' | 'unknown';
  parseError: string | null;
  rawPreview: string;
  playerCountRaw: number;
  playerXRawAvg: number;
  rawPlayers: string;
  normalizedPlayerX: number;
  usingFallback: boolean;
};

type RendererOscPayload = {
  frame: number;
  players: SensorPlayer[];
  address: string;
  args: Array<number | string | boolean | null>;
  argCount: number;
  parseMode: 'touches' | 'mangacatch_players' | 'unknown';
  parseError: string | null;
  receivedAt: number;
  rawPreview: string;
};

type PersonCountListener = (count: number) => void;
type PlayerXListener = (normalizedX: number) => void;
type PlayerXsListener = (normalizedXs: number[]) => void;
type DebugListener = (debug: SensorDebugInfo) => void;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function formatNum(value: number): string {
  if (!Number.isFinite(value)) {
    return 'NaN';
  }
  return value.toFixed(3);
}

class SensorManager {
  private personCount = 0;
  private prevPlayerCount = 0; // 直前フレームのプレイヤー数（初フレーム左端チラつき防止用）
  private playerXNormalized = 0.5;
  private playerXsNormalized: number[] = [0.5];
  private lastSensorAt = 0;

  private personCountListeners = new Set<PersonCountListener>();
  private playerXListeners = new Set<PlayerXListener>();
  private playerXsListeners = new Set<PlayerXsListener>();
  private debugListeners = new Set<DebugListener>();

  private debugInfo: SensorDebugInfo = {
    oscReceived: false,
    lastReceivedAt: 0,
    frame: 0,
    lastOscAddress: '(none)',
    argCount: 0,
    argsPreview: '(none)',
    parseMode: 'unknown',
    parseError: null,
    rawPreview: '(none)',
    playerCountRaw: 0,
    playerXRawAvg: 0,
    rawPlayers: '(none)',
    normalizedPlayerX: 0.5,
    usingFallback: true,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.onOscData) {
        // Electron IPC経由 (Windows/Mac本番環境)
        electronAPI.onOscData((payload: RendererOscPayload) => {
          this.handleOscPayload(payload);
        });
      } else {
        // WebSocket経由 (ChromeBook開発環境: osc-bridge.mjsと連携)
        this.connectWebSocket();
      }
    }
  }

  private connectWebSocket(): void {
    const WS_URL = 'ws://localhost:8765';
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('[SensorManager] WebSocket接続OK:', WS_URL);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data) as RendererOscPayload;
            this.handleOscPayload(payload);
          } catch {
            // ignore parse error
          }
        };

        ws.onclose = () => {
          // 3秒後に再接続
          setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        setTimeout(connect, 3000);
      }
    };

    connect();
  }

  private normalizeRawX(rawX: number): number {
    if (!Number.isFinite(rawX)) {
      return 0.5;
    }

    let raw01: number;

    if (rawX >= 0 && rawX <= 1) {
      raw01 = rawX;
    } else {
      const viewportWidth =
        typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1920;

      if (rawX >= 0 && rawX <= viewportWidth) {
        raw01 = rawX / viewportWidth;
      } else if (rawX >= 0 && rawX <= 10000) {
        raw01 = rawX / 10000;
      } else {
        raw01 = rawX;
      }
    }

    // センサーの実際の検出範囲を画面端から端にリマップ
    const range = SENSOR_X_MAX - SENSOR_X_MIN;
    if (range > 0) {
      raw01 = (raw01 - SENSOR_X_MIN) / range;
    }

    return clamp01(raw01);
  }

  private emitPersonCount(): void {
    for (const listener of this.personCountListeners) {
      listener(this.personCount);
    }
  }

  private emitPlayerX(): void {
    for (const listener of this.playerXListeners) {
      listener(this.playerXNormalized);
    }
  }

  private emitPlayerXs(): void {
    for (const listener of this.playerXsListeners) {
      listener(this.playerXsNormalized);
    }
  }

  private emitDebug(): void {
    for (const listener of this.debugListeners) {
      listener(this.debugInfo);
    }
  }

  private handleOscPayload(payload: RendererOscPayload): void {
    const players = Array.isArray(payload.players) ? payload.players : [];
    const playerCount = players.length;

    const avgXRaw =
      playerCount > 0
        ? players.reduce((sum, player) => sum + Number(player.x || 0), 0) / playerCount
        : 0;

    const normalizedX = this.normalizeRawX(avgXRaw);

    // 最大MAX_PLAYERS人分の個別プレイヤー位置を正規化
    const normalizedXs = players
      .slice(0, MAX_PLAYERS)
      .map((p) => this.normalizeRawX(Number(p.x || 0)));

    this.personCount = playerCount;

    if (playerCount > 0) {
      if (this.prevPlayerCount > 0) {
        // 継続検出中: 位置を正常に更新
        this.playerXNormalized = normalizedX;
        this.playerXsNormalized = normalizedXs;
      }
      // 0→N の初フレームは位置更新をスキップ（Hokuyoの初フレームx=0チラつき防止）
      // playerXsNormalized は空配列のまま → 光の輪は次フレームから正位置で表示
      this.lastSensorAt = payload.receivedAt;
    } else if (this.playerXsNormalized.length !== 0) {
      // playerCount=0 になったら playerXs を空配列に縮める
      this.playerXsNormalized = [];
    }

    this.prevPlayerCount = playerCount;

    this.debugInfo = {
      oscReceived: true,
      lastReceivedAt: payload.receivedAt,
      frame: payload.frame,
      lastOscAddress: payload.address,
      argCount: payload.argCount,
      argsPreview:
        payload.args.length > 0
          ? payload.args
            .slice(0, 16)
            .map((arg) => {
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
            })
            .join(', ')
          : '(none)',
      parseMode: payload.parseMode,
      parseError: payload.parseError,
      rawPreview: payload.rawPreview,
      playerCountRaw: playerCount,
      playerXRawAvg: avgXRaw,
      rawPlayers:
        playerCount > 0
          ? players.map((p) => `#${p.id}(${formatNum(p.x)},${formatNum(p.y)})`).join(' ')
          : '(none)',
      normalizedPlayerX: normalizedX,
      usingFallback: playerCount === 0,
    };

    this.emitPersonCount();
    this.emitPlayerXs();

    if (playerCount > 0) {
      this.emitPlayerX();
    }

    this.emitDebug();
  }

  public onPersonCountChange(listener: PersonCountListener): () => void {
    this.personCountListeners.add(listener);
    listener(this.personCount);

    return () => {
      this.personCountListeners.delete(listener);
    };
  }

  public onPlayerXChange(listener: PlayerXListener): () => void {
    this.playerXListeners.add(listener);
    listener(this.playerXNormalized);

    return () => {
      this.playerXListeners.delete(listener);
    };
  }

  public onPlayerXsChange(listener: PlayerXsListener): () => void {
    this.playerXsListeners.add(listener);
    listener(this.playerXsNormalized);

    return () => {
      this.playerXsListeners.delete(listener);
    };
  }

  public onDebugChange(listener: DebugListener): () => void {
    this.debugListeners.add(listener);
    listener(this.debugInfo);

    return () => {
      this.debugListeners.delete(listener);
    };
  }

  public hasFreshSensor(timeoutMs = 1500): boolean {
    return Date.now() - this.lastSensorAt <= timeoutMs;
  }

  public setFallbackPlayerX(normalizedX: number): void {
    if (this.hasFreshSensor()) {
      return;
    }

    this.playerXNormalized = clamp01(normalizedX);
    this.playerXsNormalized = [this.playerXNormalized];

    this.debugInfo = {
      ...this.debugInfo,
      normalizedPlayerX: this.playerXNormalized,
      usingFallback: true,
    };

    this.emitPlayerX();
    this.emitPlayerXs();
    this.emitDebug();
  }

  public getDebugInfo(): SensorDebugInfo {
    return this.debugInfo;
  }
}

export const sensorManager = new SensorManager();