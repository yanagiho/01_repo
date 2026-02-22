import { getCharacterById, getEnabledCharacters, type CharacterData } from "../constants/master";

export type SceneType =
    | "BOOT"
    | "TITLE"
    | "TUTORIAL"
    | "GAME"
    | "RESULT"
    | "RECOMMEND"
    | "PHOTO"
    | "RANKING";

const SCENE_DURATIONS: Partial<Record<SceneType, number>> = {
    BOOT: 1,
    TUTORIAL: 5,
    GAME: 30,
    RESULT: 5,
    RECOMMEND: 6,
    PHOTO: 10,
    RANKING: 8,
};

export class SceneManager {
    public currentScene: SceneType = "TITLE";
    public score: number = 0;
    public stateTimer: number = 0;

    public catchCounts: Record<string, number> = {};
    public bestCharacter: CharacterData | null = null;

    public constructor() {
        this.reset();
    }

    public reset() {
        this.currentScene = "TITLE";
        this.score = 0;
        this.stateTimer = 0;
        this.catchCounts = {};
        this.bestCharacter = null;
    }

    public triggerStart() {
        if (this.currentScene === "TITLE") this.transitionTo("TUTORIAL");
    }

    public update(deltaTime: number) {
        this.stateTimer += deltaTime;
        const duration = SCENE_DURATIONS[this.currentScene];
        if (duration && this.stateTimer >= duration) {
            this.nextScene();
        }
    }

    private nextScene() {
        switch (this.currentScene) {
            case "BOOT":
                this.transitionTo("TITLE");
                break;
            case "TITLE":
                break;
            case "TUTORIAL":
                this.transitionTo("GAME");
                break;
            case "GAME":
                this.calculateBestCharacter();
                this.transitionTo("RESULT");
                break;
            case "RESULT":
                this.transitionTo("RECOMMEND");
                break;
            case "RECOMMEND":
                this.transitionTo("PHOTO");
                break;
            case "PHOTO":
                this.saveRanking();
                this.transitionTo("RANKING");
                break;
            case "RANKING":
                this.transitionTo("TITLE");
                break;
            default:
                this.transitionTo("TITLE");
                break;
        }
    }

    private transitionTo(next: SceneType) {
        this.currentScene = next;
        this.stateTimer = 0;

        if (next === "GAME") {
            this.score = 0;
            this.catchCounts = {};
            this.bestCharacter = null;
        }

        console.log(`Scene: ${next}`);
    }

    private calculateBestCharacter() {
        let maxCount = -1;
        let bestId = "";

        Object.keys(this.catchCounts).forEach((id) => {
            if (this.catchCounts[id] > maxCount) {
                maxCount = this.catchCounts[id];
                bestId = id;
            }
        });

        // 0個なら enabled の中から選ぶ（No.10を除外）
        if (bestId === "") {
            const pool = getEnabledCharacters();
            bestId = pool[Math.floor(Math.random() * pool.length)].id;
        }

        this.bestCharacter = getCharacterById(bestId) || null;
    }

    private saveRanking() {
        const today = new Date().toLocaleDateString();
        const key = `mangacatch_ranking_${today}`;

        const rawData = localStorage.getItem(key);
        let ranking: number[] = rawData ? JSON.parse(rawData) : [];

        ranking.push(this.score);
        ranking.sort((a, b) => b - a);
        ranking = ranking.slice(0, 30);

        localStorage.setItem(key, JSON.stringify(ranking));
    }
}