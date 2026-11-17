// ============================================================
// FlagPole — win condition trigger at level end
// ============================================================

class FlagPole {
    constructor(tileX, tileY) {
        this.x = tileX * TILE_SIZE;
        this.y = tileY * TILE_SIZE;
        this.height = 10 * TILE_SIZE;
        this.reached = false;
    }

    checkCollision(mario) {
        if (this.reached) return 'done';
        const m = mario.getBounds();
        const pLeft = this.x, pRight = this.x + 8;
        const pTop = this.y, pBottom = this.y + this.height;

        if (m.x + m.w > pLeft && m.x < pRight && m.y + m.h > pTop && m.y < pBottom) {
            this.reached = true;
            return 'win';
        }
        return null;
    }

    render(ctx, cameraX) {
        const ctx2 = ctx;
        const sx = this.x - cameraX;
        // Pole
        ctx2.fillStyle = '#808080';
        ctx2.fillRect(sx + 14, this.y, 4, this.height);
        // Ball on top
        ctx2.fillStyle = '#00A800';
        ctx2.beginPath();
        ctx2.arc(sx + 16, this.y, 6, 0, Math.PI * 2);
        ctx2.fill();
        // Flag
        if (!this.reached) {
            ctx2.fillStyle = '#E52521';
            ctx2.fillRect(sx + 18, this.y + 4, 16, 12);
        }
        // Base
        ctx2.fillStyle = '#00A800';
        ctx2.fillRect(sx, this.y + this.height - 16, 32, 16);
    }
}
