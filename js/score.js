
export class ScoreManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.totalScore = 0;
        this.raritySum = 0;

        // Track items collected for result screen
        // Key: type_id, Value: { count, scoreSum, raritySum, data }
        this.history = new Map();

        // Individual player scores (for Multi-player future proofing)
        this.playerScores = {
            1: 0, 2: 0, 3: 0
        };
    }

    addScore(playerId, itemData) {
        // Validation
        if (!itemData) return;

        const score = itemData.score || 0;
        const rarityPoint = itemData.rarity_point || 0;
        const typeId = itemData.type_id;

        // Update Total
        this.totalScore += score;
        this.raritySum += rarityPoint;

        // Update Individual Player Score
        if (this.playerScores[playerId] !== undefined) {
            this.playerScores[playerId] += score;
        }

        // Update History
        if (!this.history.has(typeId)) {
            this.history.set(typeId, {
                count: 0,
                scoreSum: 0,
                raritySum: 0,
                data: itemData
            });
        }

        const entry = this.history.get(typeId);
        entry.count++;
        entry.scoreSum += score;
        entry.raritySum += rarityPoint;
    }

    getSummary() {
        return {
            totalScore: this.totalScore,
            raritySum: this.raritySum,
            history: Array.from(this.history.values()), // Convert Map to Array
            playerScores: { ...this.playerScores }
        };
    }
}
