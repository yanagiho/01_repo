export type SensorPlayer = {
    id: number;
    x: number;
    y: number;
};

export type SensorDebugInfo = {
    oscReceived: boolean;
    lastReceivedAt: number;
    frame: number;
    lastOscAddress: string;
    argCount: number;
    argsPreview: string;
    parseMode: "touches" | "mangacatch_players" | "unknown";
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
    parseMode: "touches" | "mangacatch_players" | "unknown";
    parseError: string | null;
    receivedAt: number;
    rawPreview: string;
};

type PersonCountListener = (count: number) => void;
type PlayerXListener = (normalizedX: number) => void;
type DebugListener = (debug: SensorDebugInfo) => void;

function clamp01(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(1, value));
}

function formatNum(value: number): string {
    if (!Number.isFinite(value)) {
        return "NaN";
    }
    return value.toFixed(3);
}

export class SensorManager {
    private static instance: SensorManager | null = null;

    public static getInstance(): SensorManager {
        if (!SensorManager.instance) {
            SensorManager.instance = new SensorManager();
        }
        return SensorManager.instance;
    }

    private started = true;
    private personCount = 1;
    private playerXNormalized = 0.5;
    private lastSensorAt = 0;

    private personCountListeners = new Set<PersonCountListener>();
    private playerXListeners = new Set<PlayerXListener>();
    private debugListeners = new Set<DebugListener>();

    private debugInfo: SensorDebugInfo = {
        oscReceived: false,
        lastReceivedAt: 0,
        frame: 0,
        lastOscAddress: "(none)",
        argCount: 0,
        argsPreview: "(none)",
        parseMode: "unknown",
        parseError: null,
        rawPreview: "(none)",
        playerCountRaw: 0,
        playerXRawAvg: 0,
        rawPlayers: "(none)",
        normalizedPlayerX: 0.5,
        usingFallback: true,
    };

    private constructor() {
        if (typeof window !== "undefined") {
            const electronAPI = (window as any).electronAPI;
            if (electronAPI?.onOscData) {
                electronAPI.onOscData((payload: RendererOscPayload) => {
                    this.handleOscPayload(payload);
                });
            }
        }
    }

    public start(): void {
        this.started = true;
    }

    public stop(): void {
        this.started = false;
    }

    public hasFreshSensor(timeoutMs = 1500): boolean {
        return Date.now() - this.lastSensorAt <= timeoutMs;
    }

    public getDebugInfo(): SensorDebugInfo {
        return this.debugInfo;
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

    public onDebugChange(listener: DebugListener): () => void {
        this.debugListeners.add(listener);
        listener(this.debugInfo);

        return () => {
            this.debugListeners.delete(listener);
        };
    }

    public setFallbackPlayerX(normalizedX: number): void {
        if (this.hasFreshSensor()) {
            return;
        }

        this.playerXNormalized = clamp01(normalizedX);
        this.debugInfo = {
            ...this.debugInfo,
            normalizedPlayerX: this.playerXNormalized,
            usingFallback: true,
        };

        this.emitPlayerX();
        this.emitDebug();
    }

    private normalizeRawX(rawX: number): number {
        if (!Number.isFinite(rawX)) {
            return 0.5;
        }

        if (rawX >= 0 && rawX <= 1) {
            return rawX;
        }

        const viewportWidth =
            typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 1920;

        if (rawX >= 0 && rawX <= viewportWidth) {
            return clamp01(rawX / viewportWidth);
        }

        if (rawX >= 0 && rawX <= 10000) {
            return clamp01(rawX / 10000);
        }

        return clamp01(rawX);
    }

    private handleOscPayload(payload: RendererOscPayload): void {
        if (!this.started) {
            return;
        }

        const players = Array.isArray(payload.players) ? payload.players : [];
        const playerCount = players.length;

        const avgXRaw =
            playerCount > 0
                ? players.reduce((sum, player) => sum + Number(player.x || 0), 0) / playerCount
                : 0;

        const normalizedX = this.normalizeRawX(avgXRaw);

        this.personCount = Math.max(1, Math.min(3, playerCount || 1));

        if (playerCount > 0) {
            this.playerXNormalized = normalizedX;
            this.lastSensorAt = payload.receivedAt;
        }

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
                            if (typeof arg === "number") {
                                return Number.isInteger(arg) ? String(arg) : arg.toFixed(4);
                            }
                            if (typeof arg === "string") {
                                return `"${arg}"`;
                            }
                            if (typeof arg === "boolean") {
                                return arg ? "true" : "false";
                            }
                            return "null";
                        })
                        .join(", ")
                    : "(none)",
            parseMode: payload.parseMode,
            parseError: payload.parseError,
            rawPreview: payload.rawPreview,
            playerCountRaw: playerCount,
            playerXRawAvg: avgXRaw,
            rawPlayers:
                playerCount > 0
                    ? players.map((p) => `#${p.id}(${formatNum(p.x)},${formatNum(p.y)})`).join(" ")
                    : "(none)",
            normalizedPlayerX: normalizedX,
            usingFallback: playerCount === 0,
        };

        this.emitPersonCount();

        if (playerCount > 0) {
            this.emitPlayerX();
        }

        this.emitDebug();
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

    private emitDebug(): void {
        for (const listener of this.debugListeners) {
            listener(this.debugInfo);
        }
    }
}

export const sensorManager = SensorManager.getInstance();