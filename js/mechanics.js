// js/mechanics.js
export class GameMechanics {
    constructor(manifest) {
        this.manifest = manifest;
        this.coolingDown = false;
        this.cooldownTime = 600; // ms
        this.lastTriggerTime = 0;
    }

    checkInteraction(ring, zone) {
        const now = Date.now();
        if (now - this.lastTriggerTime < this.cooldownTime) {
            return null;
        }

        if (ring.y >= zone.y_start && ring.y <= zone.y_end) {
            this.lastTriggerTime = now;
            return this.dropItem();
        }
        return null;
    }

    dropItem() {
        if (!this.manifest || !this.manifest.types) return null;

        // ★ 画像欠損typeを除外（AssetManagerがpreload後に付与）
        const rawTypes = this.manifest.types;
        const types = rawTypes.filter((t) => !t._charMissing);

        // 全部欠損ならrawに戻す（ただしこの場合はAssets側でプレースホルダ表示になる）
        const pool = types.length > 0 ? types : rawTypes;

        const totalWeight = pool.reduce((sum, item) => sum + (item.weight || 0), 0);
        let random = Math.random() * totalWeight;

        for (const item of pool) {
            if (random < (item.weight || 0)) return item;
            random -= (item.weight || 0);
        }

        return pool[pool.length - 1] || null;
    }
}