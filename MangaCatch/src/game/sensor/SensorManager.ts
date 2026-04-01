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

// 光の輪スムージング係数（0=動かない, 1=即時追従）
// 小さいほど滑らかだが遅延が増える。0.25 ≒ 4〜5フレームで収束
const SMOOTHING_ALPHA = 0.25;

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
  private playerXsNormalized: number[] = [];
  private stableXs: number[] = []; // スムージング済み安定位置
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

  /**
   * 最近傍マッチング + EMAスムージングで安定した位置配列を返す。
   * - センサーの配列順入れ替わりによるリング飛びを防ぐ
   * - 指数移動平均でガタつきを抑える
   */
  /**
   * skipNew=true のとき、新規参加プレイヤー（増加分）をこのフレームに追加しない。
   * Hokuyoは新規検出の初フレームでx=0を送るため、途中参加時もチラつきを防ぐ。
   */
  private stabilizePositions(incoming: number[], skipNew = false): number[] {
    const n = incoming.length;
    if (n === 0) return [];

    // 初回 or 前フレームが0人: 安定位置をそのまま初期化（スムージングなし）
    // x≈0 はHokuyoの初期フレームアーティファクト → フィルターして次フレームまで待機
    if (this.stableXs.length === 0) {
      const valid = incoming.filter(x => x > 0.01);
      return valid;
    }

    const prev = this.stableXs;
    const usedIncoming = new Array(n).fill(false);
    const result: number[] = [];

    // 既存の安定位置それぞれを、最近傍のincoming位置にマッチ
    const k = Math.min(prev.length, n);
    for (let i = 0; i < k; i++) {
      let bestDist = Infinity;
      let bestJ = -1;
      for (let j = 0; j < n; j++) {
        if (!usedIncoming[j]) {
          const d = Math.abs(incoming[j] - prev[i]);
          if (d < bestDist) { bestDist = d; bestJ = j; }
        }
      }
      usedIncoming[bestJ] = true;
      // EMAスムージング: 前の安定位置とincomingを混ぜる
      result.push(prev[i] * (1 - SMOOTHING_ALPHA) + incoming[bestJ] * SMOOTHING_ALPHA);
    }

    // 新たに参加したプレイヤー（増加分）
    // skipNew=false のときのみ追加（初フレームはスキップしてチラつきを防ぐ）
    // さらに x≈0（左端）の位置はHokuyoの誤検知/初期フレームと判断してスキップ
    if (!skipNew) {
      for (let j = 0; j < n; j++) {
        if (!usedIncoming[j] && incoming[j] > 0.01) result.push(incoming[j]);
      }
    }

    return result;
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
        // 継続検出中: 最近傍マッチング + EMAスムージングで安定位置を更新
        // プレイヤー増加フレームは新規分をスキップ（Hokuyoの初フレームx=0チラつき防止）
        const isIncrease = playerCount > this.prevPlayerCount;
        this.stableXs = this.stabilizePositions(normalizedXs, isIncrease);
        this.playerXNormalized = normalizedX;
        this.playerXsNormalized = this.stableXs;
      } else {
        // 0→N の初フレームは位置をクリア（Hokuyoの初フレームx=0/x=0.5チラつき防止）
        // stableXs は空配列のまま → 光の輪は次フレームから正位置で表示
        this.playerXsNormalized = [];
      }
      this.lastSensorAt = payload.receivedAt;
    } else if (this.playerXsNormalized.length !== 0) {
      // playerCount=0 になったら安定位置・playerXs を空配列にリセット
      this.stableXs = [];
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