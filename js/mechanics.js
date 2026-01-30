
export class GameMechanics {
    constructor(manifest) {
        this.manifest = manifest;
        this.coolingDown = false;
        this.cooldownTime = 600; // ms
        this.lastTriggerTime = 0;
    }

    /**
     * Check if ring is in Catch Zone and trigger item drop.
     * @param {Object} ring - {x, y, id} normalized coordinates
     * @param {Object} zone - {y_start, y_end} normalized vertical range
     * @returns {Object|null} - Dropped item data or null
     */
    checkInteraction(ring, zone) {
        const now = Date.now();
        if (now - this.lastTriggerTime < this.cooldownTime) {
            return null;
        }

        // Check if ring center is within the Y-zone (Catch Zone)
        // Zone is defined typically as the bottom area, e.g., y > 0.75
        if (ring.y >= zone.y_start && ring.y <= zone.y_end) {
            // Trigger!
            this.lastTriggerTime = now;
            return this.dropItem();
        }

        return null;
    }

    dropItem() {
        if (!this.manifest || !this.manifest.types) return null;

        const types = this.manifest.types;
        // Calculate total weight
        const totalWeight = types.reduce((sum, item) => sum + (item.weight || 0), 0);

        let random = Math.random() * totalWeight;

        for (const item of types) {
            if (random < item.weight) {
                return item;
            }
            random -= item.weight;
        }

        return types[types.length - 1]; // Fallback
    }
}
