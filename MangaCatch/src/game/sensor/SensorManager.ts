type OscPlayerSignal = {
  x: number;
  y: number;
  id: number;
};

type OscPayload = {
  frame: number;
  players: OscPlayerSignal[];
};

type PersonCountListener = (count: number) => void;
type PlayerXListener = (x: number) => void;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export class SensorManager {
  private static instance: SensorManager | null = null;

  private started = false;
  private unsubscribeOsc: (() => void) | null = null;

  private personCountListeners = new Set<PersonCountListener>();
  private playerXListeners = new Set<PlayerXListener>();

  private lastPlayerX =
    typeof window !== "undefined" ? window.innerWidth / 2 : 960;

  private lastPersonCount = 0;

  static getInstance(): SensorManager {
    if (!SensorManager.instance) {
      SensorManager.instance = new SensorManager();
    }
    return SensorManager.instance;
  }

  start() {
    if (this.started) return;
    this.started = true;

    const electronAPI = (window as any)?.electronAPI;
    if (!electronAPI?.onOscData) {
      return;
    }

    this.unsubscribeOsc = electronAPI.onOscData((payload: OscPayload) => {
      this.handleOscPayload(payload);
    });
  }

  stop() {
    if (this.unsubscribeOsc) {
      this.unsubscribeOsc();
      this.unsubscribeOsc = null;
    }
    this.started = false;
  }

  onPersonCountChange(listener: PersonCountListener) {
    this.personCountListeners.add(listener);
    listener(this.lastPersonCount);

    return () => {
      this.personCountListeners.delete(listener);
    };
  }

  onPlayerXChange(listener: PlayerXListener) {
    this.playerXListeners.add(listener);
    listener(this.lastPlayerX);

    return () => {
      this.playerXListeners.delete(listener);
    };
  }

  private emitPersonCount(count: number) {
    this.lastPersonCount = count;
    for (const listener of this.personCountListeners) {
      listener(count);
    }
  }

  private emitPlayerX(x: number) {
    this.lastPlayerX = x;
    for (const listener of this.playerXListeners) {
      listener(x);
    }
  }

  private handleOscPayload(payload: OscPayload) {
    const players = Array.isArray(payload?.players) ? payload.players : [];
    const count = players.length;

    this.emitPersonCount(count);

    if (count <= 0) {
      return;
    }

    const avgRawX =
      players.reduce((sum, p) => sum + (Number.isFinite(p.x) ? p.x : 0), 0) /
      count;

    const screenX = this.toScreenX(avgRawX);
    this.emitPlayerX(screenX);
  }

  private toScreenX(rawX: number) {
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;

    if (!Number.isFinite(rawX)) {
      return this.lastPlayerX;
    }

    if (rawX >= 0 && rawX <= 1.5) {
      return clamp(rawX, 0, 1) * screenWidth;
    }

    return clamp(rawX, 0, screenWidth);
  }
}