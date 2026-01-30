
export class InputManager {
    constructor() {
        // Player 1 Ring coordinates (Normalized 0.0 - 1.0)
        // Initialize at center
        this.player1 = { x: 0.5, y: 0.5, active: true };

        // Screen dimensions for normalization
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;

        this.init();
    }

    init() {
        window.addEventListener('resize', () => {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
        });

        // Mouse move handler
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e.clientX, e.clientY);
        });

        // Touch handler (basic support for touch screens)
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.handleMouseMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });
    }

    handleMouseMove(clientX, clientY) {
        // Normalize coordinates
        let nx = clientX / this.screenWidth;
        let ny = clientY / this.screenHeight;

        // Clamp
        nx = Math.max(0, Math.min(1, nx));
        ny = Math.max(0, Math.min(1, ny));

        this.player1.x = nx;
        this.player1.y = ny;
    }

    /**
     * Get player positions.
     * Returns an array of players to be compatible with future multi-player OSC.
     * For Milestone 1, only returns Player 1 (Mouse).
     */
    getPlayers() {
        // ID 1 reserved for Player 1
        return [
            { id: 1, x: this.player1.x, y: this.player1.y, active: true }
        ];
    }
}
