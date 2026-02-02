import { SceneType } from '../types/game';
import { SCENE_DURATIONS } from '../constants/game';

/**
 * シーン管理クラス
 */
export class SceneManager {
    private static instance: SceneManager;
    private currentScene: SceneType = 'TITLE';
    private sceneStartTime: number = 0;
    private onSceneChange?: (scene: SceneType) => void;

    private constructor() {
        this.sceneStartTime = Date.now();
    }

    public static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager();
        }
        return SceneManager.instance;
    }

    public setCallback(callback: (scene: SceneType) => void) {
        this.onSceneChange = callback;
    }

    public changeScene(scene: SceneType) {
        if (this.currentScene === scene) return;
        this.currentScene = scene;
        this.sceneStartTime = Date.now();
        if (this.onSceneChange) this.onSceneChange(scene);
        console.log(`[SceneManager] Scene changed to: ${scene}`);
    }

    public getCurrentScene(): SceneType {
        return this.currentScene;
    }

    public update() {
        const duration = SCENE_DURATIONS[this.currentScene];
        if (duration === 0) return; // 手動遷移待ち

        const elapsed = (Date.now() - this.sceneStartTime) / 1000;
        if (elapsed >= duration) {
            this.autoNext();
        }
    }

    private autoNext() {
        const flow: SceneType[] = [
            'TITLE',
            'TUTORIAL_VIDEO',
            'COUNTDOWN',
            'PLAY',
            'RESULT',
            'RECOMMEND',
            'PHOTO_TIME',
            'DAILY_RANKING'
        ];

        const currentIndex = flow.indexOf(this.currentScene);
        const nextIndex = (currentIndex + 1) % flow.length;
        this.changeScene(flow[nextIndex]);
    }

    // 外部からのトリガー（例：プレイ開始、設定時間切れ）
    public triggerStart() {
        if (this.currentScene === 'TITLE') {
            this.changeScene('TUTORIAL_VIDEO');
        }
    }
}
