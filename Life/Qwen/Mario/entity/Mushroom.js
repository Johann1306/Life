// ============================================================
// Mushroom — power-up emerging from question block
// ============================================================

class Mushroom extends Entity {
    constructor(x, y) {
        super(x, y, 28, 32, 'mushroom');
        this.vx = MUSHROOM_SPEED;
        this.vy = -2;
        this.emerging = true;
        this.startY = y;
    }

    update(tileMap) {
        if (this.emerging) {
            this.y += this.vy;
            if (this.y <= this.startY - TILE_SIZE) {
                this.emerging = false;
                this.vy = 0;
            }
            return;
        }

        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        this.x += this.vx;
        if (resolveX(this, tileMap)) this.vx = -this.vx; // bounce off wall

        this.y += this.vy;
        this.grounded = false;
        resolveY(this, tileMap);

        if (this.y > GAME_HEIGHT + TILE_SIZE) this.alive = false;
    }
}
