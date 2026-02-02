import { OSCPayload } from '../types/game';
import { PlayerManager } from './players';

/**
 * 入力管理クラス
 * OSC受信とマウスフォールバックを統合
 */
export class InputManager {
    private static instance: InputManager;
    private useFallback: boolean = false;
    private lastOscTime: number = 0;

    private constructor() {
        this.setupFallbackListeners();
        this.setupOscListener();
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    private setupOscListener() {
        // @ts-ignore
        if (window.electronAPI && window.electronAPI.onOscData) {
            // @ts-ignore
            window.electronAPI.onOscData((data: number[]) => {
                if (data.length >= 10) {
                    const sensorPlayers = [
                        { x: data[1], y: data[2], id: data[3] },
                        { x: data[4], y: data[5], id: data[6] },
                        { x: data[7], y: data[8], id: data[9] },
                    ].filter(p => p.id > 0);

                    this.lastOscTime = Date.now();
                    this.useFallback = false;
                    PlayerManager.getInstance().updateFromSensors(sensorPlayers);
                }
            });
        }
    }

    private setupFallbackListeners() {
        window.addEventListener('mousemove', (e) => {
            if (Date.now() - this.lastOscTime > 3000) {
                this.useFallback = true;
            }

            if (this.useFallback) {
                // マウス位置を SensorID=999 として渡す
                PlayerManager.getInstance().updateFromSensors([{
                    id: 999,
                    x: e.clientX / window.innerWidth,
                    y: e.clientY / window.innerHeight
                }]);
            }
        });
    }

    public update() {
        // PlayerManagerの定期更新（タイムアウトチェック）を行う
        PlayerManager.getInstance().updateFromSensors([]);
    }
}
