// ============================================================
// Goomba — enemy: patrol, edge detection, squishable
// ============================================================

class Goomba extends Entity {
    constructor(x, y) {
        super(x, y, 28, 28, 'goomba');
        this.vx = -GOOMBA_SPEED;
        this.animFrame = 0;
        this.animTimer = 0;
        this.squishTimer = 0;
        this.squished = false;
    }

    update(tileMap) {
        if (this.squished) {
            this.squishTimer--;
            if (this.squishTimer <= 0) this.alive = false;
            return;
        }

        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        this.x += this.vx;
        resolveX(this, tileMap);
        // Reverse on wall hit
        if (this.vx !== 0 && !this._wasMovingThisFrame) { /* keep direction */ }

        this.y += this.vy;
        this.grounded = false;
        resolveY(this, tileMap);

        // Edge detection: if about to walk off platform, turn around
        const footCol = Math.floor((this.vx > 0 ? this.x + this.width : this.x) / TILE_SIZE);
        const belowRow = Math.floor((this.y + this.height + 2) / TILE_SIZE);
        if (this.grounded && !tileMap.isSolid(footCol, belowRow)) {
            this.vx = -this.vx;
        }

        // Animation
        this.animTimer++;
        if (this.animTimer >= 10) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 2; }
    }

    stomp() {
        this.squished = true;
        this.squishTimer = GOOMBA_SQUISH_DURATION;
        this.vy = -3;
        this.vx = 0;
    }
}
