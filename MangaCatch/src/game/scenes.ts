// MangaCatch/src/game/scenes.ts
export type SceneType =
    | "TITLE"
    | "TUTORIAL_VIDEO"
    | "GAME"
    | "RESULT"
    | "RECOMMEND"
    | "PHOTO"
    | "RANKING";

const DURATIONS: Partial<Record<SceneType, number>> = {
    RESULT: 4.0,
    RECOMMEND: 6.0,
    PHOTO: 10.0,
    RANKING: 8.0,
};

export class SceneManager {
    public currentScene: SceneType = "TITLE";
    public stateTimer = 0;

    public score = 0;
    public catchCounts: Record<string, number> = {};
    public bestCharId: string | null = null;

    // ★タイトルはクリック(将来センサー入力)でのみ開始
    public triggerStart() {
        if (this.currentScene === "TITLE") {
            this.transitionTo("TUTORIAL_VIDEO");
        }
    }

    public finishTutorialVideo() {
        if (this.currentScene === "TUTORIAL_VIDEO") {
            this.transitionTo("GAME");
        }
    }

    public finishGame(score: number, counts: Record<string, number>) {
        this.score = score;
        this.catchCounts = counts;
        // bestCharId はあなたの既存実装に合わせてここでは触らない（後で必要なら戻す）
        this.transitionTo("RESULT");
    }

    public update(dt: number) {
        this.stateTimer += dt;

        // GAME / TUTORIAL_VIDEO は外部トリガで遷移する
        if (this.currentScene === "GAME" || this.currentScene === "TUTORIAL_VIDEO") return;

        const dur = DURATIONS[this.currentScene];
        if (dur != null && this.stateTimer >= dur) {
            this.nextScene();
        }
    }

    private nextScene() {
        switch (this.currentScene) {
            case "RESULT":
                this.transitionTo("RECOMMEND");
                break;
            case "RECOMMEND":
                this.transitionTo("PHOTO");
                break;
            case "PHOTO":
                this.transitionTo("RANKING");
                break;
            case "RANKING":
                this.transitionTo("TITLE");
                break;
            default:
                break;
        }
    }

    private transitionTo(next: SceneType) {
        this.currentScene = next;
        this.stateTimer = 0;

        if (next === "GAME") {
            this.score = 0;
            this.catchCounts = {};
            this.bestCharId = null;
        }
    }
}