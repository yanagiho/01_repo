import { PlayerState, OSCPayload } from '../types/game';
import { PLAYER_LEAVE_TIMEOUT_MS, SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants/game';

/**
 * プレイヤ管理クラス
 * 参加順ロック（Participation Order Lock）を制御
 */
export class PlayerManager {
    private static instance: PlayerManager;
    private players: PlayerState[] = [
        { id: 1, active: false, x: -1, y: -1, score: 0, lastDetectedTime: 0 },
        { id: 2, active: false, x: -1, y: -1, score: 0, lastDetectedTime: 0 },
        { id: 3, active: false, x: -1, y: -1, score: 0, lastDetectedTime: 0 },
    ];

    // センサー側のIDとゲーム側のRingIndexのマップ
    private sensorMap: Map<number, number> = new Map();

    private constructor() { }

    public static getInstance(): PlayerManager {
        if (!PlayerManager.instance) {
            PlayerManager.instance = new PlayerManager();
        }
        return PlayerManager.instance;
    }

    /**
     * 信号の反映
     * @param sensorData { id: number, x: number, y: number }[]
     */
    public updateFromSensors(sensorData: { id: number, x: number, y: number }[]) {
        const now = Date.now();

        // 1. 既存のセンサーIDの更新
        sensorData.forEach(s => {
            let ringIndex = this.sensorMap.get(s.id);

            // 新規参加
            if (ringIndex === undefined) {
                // 空いているスロットを探す
                const freeSlot = this.players.find(p => !p.active);
                if (freeSlot) {
                    ringIndex = freeSlot.id;
                    this.sensorMap.set(s.id, ringIndex);
                    console.log(`[PlayerManager] Player joined: SensorID=${s.id} -> RingID=${ringIndex}`);
                }
            }

            // 値の更新
            if (ringIndex !== undefined) {
                const player = this.players[ringIndex - 1];
                player.active = true;
                player.x = s.x * SCREEN_WIDTH;
                player.y = s.y * SCREEN_HEIGHT;
                player.lastDetectedTime = now;
            }
        });

        // 2. タイムアウト判定
        this.players.forEach(p => {
            if (p.active && now - p.lastDetectedTime > PLAYER_LEAVE_TIMEOUT_MS) {
                p.active = false;
                p.x = -1;
                p.y = -1;
                // マップから削除
                for (let [sId, rId] of this.sensorMap.entries()) {
                    if (rId === p.id) {
                        this.sensorMap.delete(sId);
                        console.log(`[PlayerManager] Player left: SensorID=${sId} -> RingID=${rId}`);
                        break;
                    }
                }
            }
        });
    }

    public getPlayers(): PlayerState[] {
        return this.players;
    }

    public resetScores() {
        this.players.forEach(p => p.score = 0);
    }
}
