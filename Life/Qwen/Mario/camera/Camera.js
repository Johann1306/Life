// ============================================================
// Camera — smooth follow + level-bound clamping
// ============================================================

class Camera {
    constructor(levelWidth) {
        this.x = 0;
        this.levelWidth = levelWidth;
    }

    follow(targetX, canvasWidth) {
        const target = targetX - canvasWidth / 2 + TILE_SIZE / 2;
        this.x += (target - this.x) * 0.1;
        const maxX = this.levelWidth * TILE_SIZE - canvasWidth;
        if (this.x < 0) this.x = 0;
        if (this.x > maxX) this.x = maxX;
    }

    getOffset() { return this.x; }
}
