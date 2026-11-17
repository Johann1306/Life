// ============================================================
// Mario — player character: movement, jumping, animations
// ============================================================

class Mario extends Entity {
    constructor(x, y) {
        super(x, y, 24, 32, 'mario');
        this.facing = 'right';
        this.state = 'small';          // small | large | invincible
        this.animFrame = 0;
        this.animTimer = 0;
        this.invincibleTimer = 0;
        this.dead = false;
        this.winAnim = false;
        this.winX = 0;
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
    }

    update(input, tileMap) {
        if (this.dead || this.winAnim) return this._winWalk();

        // Horizontal movement
        if (input.isPressed(ACTION_NAMES.LEFT)) {
            this.vx -= MARIO_ACCEL;
            this.facing = 'left';
        } else if (input.isPressed(ACTION_NAMES.RIGHT)) {
            this.vx += MARIO_ACCEL;
            this.facing = 'right';
        } else {
            if (this.vx > 0) this.vx = Math.max(0, this.vx - MARIO_DECEL);
            else if (this.vx < 0) this.vx = Math.min(0, this.vx + MARIO_DECEL);
        }
        if (Math.abs(this.vx) > MARIO_SPEED) this.vx = Math.sign(this.vx) * MARIO_SPEED;

        // Gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        // Jump trigger
        if (this.grounded && input.consumeJump()) {
            this.vy = MARIO_JUMP;
            this.grounded = false;
        }

        // Variable jump height (cut short on release)
        if (!input.isPressed(ACTION_NAMES.JUMP) && this.vy < MIN_JUMP_VELOCITY) {
            this.vy = MIN_JUMP_VELOCITY;
        }

        // Resolve X then Y separately
        this.x += this.vx;
        resolveX(this, tileMap);

        this.y += this.vy;
        this.grounded = false;
        const yResult = resolveY(this, tileMap);
        if (yResult.hitBlockCol !== null) {
            // Trigger block hit — handled by GameLoop
        }

        if (this.x < 0) { this.x = 0; this.vx = 0; }
        if (this.y > GAME_HEIGHT + TILE_SIZE * 2) this.dead = true;

        // Animation
        this.animTimer++;
        if (this.animTimer >= 6) { this.animTimer = 0; this.animFrame++; }
        if (this.state === 'invincible') {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) this.state = 'large';
        }
    }

    _winWalk() {
        if (this.winAnim) {
            if (!this._winPhase) this._winPhase = 0;
            if (this._winPhase === 0) {
                // Slide down pole handled by GameLoop
            } else if (this._winPhase === 1) {
                this.x += 2;
                this.grounded = true;
            }
        }
    }

    die()       { this.dead = true; }
    stompFromBelow() { this.vy = MARIO_JUMP * 0.6; }
}
