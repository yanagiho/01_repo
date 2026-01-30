
export class RankingManager {
    constructor() {
        this.storageKey = 'mangacatch_ranking_daily';
        this.maxEntries = 30; // Daily Top 30
    }

    saveScore(scoreData) {
        /*
            scoreData expected structure:
            {
                totalScore: number,
                raritySum: number,
                timestamp: number (Date.now())
            }
        */
        const ranking = this.getRanking();

        // Add new entry
        ranking.push({
            ...scoreData,
            timestamp: Date.now()
        });

        // Sort: rarity_sum DESC -> achieved_at ASC
        ranking.sort((a, b) => {
            // Priority 1: Rarity Sum (Desc)
            if (b.raritySum !== a.raritySum) {
                return b.raritySum - a.raritySum;
            }
            // Priority 2: Timestamp (Asc) - Earlier is better
            return a.timestamp - b.timestamp;
        });

        // Keep Top N
        const topN = ranking.slice(0, this.maxEntries);

        localStorage.setItem(this.storageKey, JSON.stringify(topN));
    }

    getRanking() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to load ranking", e);
            return [];
        }
    }

    // For debugging/testing
    clearRanking() {
        localStorage.removeItem(this.storageKey);
    }
}
