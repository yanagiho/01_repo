import type { ISensorProvider } from './ISensorProvider';

/**
 * HokuyoSensorProvider — OSC通信 (TouchDesigner経由) 版
 *
 * 実際の OSC 受信は electron/main.ts の node-osc Server (ポート 10000) が担い、
 * IPC (osc-data チャネル) でレンダラープロセスに転送されます。
 *
 * このクラスはレンダラー側で window.electronAPI.onOscData() を通じてデータを受け取り、
 * ISensorProvider インターフェースに準じた形でゲーム側に提供します。
 */

interface OscPlayerSignal {
    x: number;
    y: number;
    id: number;
}

interface OscPayload {
    frame: number;
    players: OscPlayerSignal[];
}

export class HokuyoSensorProvider implements ISensorProvider {
    private callback: ((count: number) => void) | null = null;
    private isRunning: boolean = false;
    private detectedCount: number = 0;
    private unsubscribeOsc: (() => void) | null = null;

    // デバウンス用
    private lastCount: number = 0;
    private stableCount: number = 0;
    private stableStartTime: number = 0;
    private readonly DEBOUNCE_TIME = 500; // 0.5秒

    constructor() {
        console.log('[HokuyoSensor] Initialized (OSC via TouchDesigner mode)');
    }

    /**
     * OSC データの購読を開始する
     */
    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('[HokuyoSensor] Starting OSC listener via Electron IPC...');

        const electronAPI = (window as any)?.electronAPI;
        if (!electronAPI?.onOscData) {
            console.warn('[HokuyoSensor] electronAPI.onOscData is not available. Running outside Electron?');
            return;
        }

        this.unsubscribeOsc = electronAPI.onOscData((payload: OscPayload) => {
            this.handleOscPayload(payload);
        });

        console.log('[HokuyoSensor] OSC listener started. Waiting for data on port 10000...');
    }

    /**
     * OSC データの購読を停止する
     */
    public stop(): void {
        if (this.unsubscribeOsc) {
            this.unsubscribeOsc();
            this.unsubscribeOsc = null;
        }
        this.isRunning = false;
        console.log('[HokuyoSensor] Stopped.');
    }

    /**
     * 人数変更イベントを購読する
     */
    public onPersonCountChange(callback: (count: number) => void): void {
        this.callback = callback;
    }

    /**
     * 現在の検知人数を取得する
     */
    public getDetectedCount(): number {
        return this.detectedCount;
    }

    /**
     * Electron IPC 経由で受け取った OSC ペイロードを処理する
     */
    private handleOscPayload(payload: OscPayload): void {
        if (!this.isRunning) return;

        // ログ出力 — TouchDesigner からのデータ確認用
        console.log('OSC Data:', payload);

        const players = Array.isArray(payload?.players) ? payload.players : [];
        const count = players.length;

        // デバウンス付きでカウントを更新
        this.updateCount(count);
    }

    /**
     * デバウンス処理付き人数更新
     * 一定時間同じ値が続いた場合のみ確定する
     */
    private updateCount(currentCount: number): void {
        const now = Date.now();

        if (currentCount === this.lastCount) {
            // 変化なし — 安定時間をチェック
            if (now - this.stableStartTime >= this.DEBOUNCE_TIME) {
                if (this.stableCount !== currentCount) {
                    this.stableCount = currentCount;
                    this.detectedCount = currentCount;
                    console.log(`[HokuyoSensor] Count updated: ${this.stableCount}`);
                    if (this.callback) this.callback(this.stableCount);
                }
            }
        } else {
            // 変化あり — タイマーリセット
            this.lastCount = currentCount;
            this.stableStartTime = now;
        }
    }
}
