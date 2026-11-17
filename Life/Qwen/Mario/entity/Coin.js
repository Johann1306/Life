// ============================================================
// Coin — floating coin spawned from question block
// ============================================================

class Coin extends Entity {
    constructor(x, y) {
        super(x, y, 16, 24, 'coin');
        this.vy = -3;
        this.animFrame = 0;
        this.animTimer = 0;
        this.collected = false;
    }

    update() {
        this.y += this.vy;
        this.animTimer++;
        if (this.animTimer >= 4) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
        if (this.y < -TILE_SIZE * 2) this.collected = true;
    }
}
