// ============================================================
// Game State Machine — menu / playing / dead / win / gameover
// ============================================================

class GameState {
    constructor() {
        this.state = 'menu';
        this.score = 0;
        this.coins = 0;
        this.time = 400;
        this.timerAccumulator = 0;
        this.lives = 3;
        this.deathTimer = 0;
        this.winTimer = 0;
        this.flagScore = 0;
    }

    update(dt) {
        switch (this.state) {
            case 'playing':
                this.timerAccumulator++;
                if (this.timerAccumulator >= 60) {
                    this.timerAccumulator = 0;
                    this.time--;
                    if (this.time <= 0) { this.state = 'dead'; this.deathTimer = 0; }
                }
                break;
            case 'dead':
                this.deathTimer++;
                if (this.deathTimer > 120) {
                    if (this.lives > 0) this._restartLevel();
                    else this.state = 'gameover';
                }
                break;
            case 'win':
                this.winTimer++;
                this.flagScore += FLAG_SCORE;
                if (this.winTimer > 180) {
                    this.score += this.flagScore;
                    this.state = 'gameover';
                }
                break;
        }
    }

    addCoin()       { this.coins++; this.score += COIN_SCORE; }
    collectMushroom(mario) { if (mario.state === 'small') mario.state = 'large'; this.score += MUSHROOM_SCORE; }

    handleMarioVsGoomba(mario, goomba) {
        if (goomba.squished || !goomba.alive) return;
        if (mario.vy > 0 && mario.y + mario.height - 8 < goomba.y + goomba.height / 2) {
            mario.vy = MARIO_JUMP * 0.6;
            goomba.stomp();
            this.score += STOMP_SCORE;
        } else if (mario.state === 'large') {
            mario.state = 'invincible';
            mario.invincibleTimer = INVINCIBLE_FRAMES;
        } else {
            mario.die();
            this.state = 'dead';
            this.deathTimer = 0;
        }
    }

    collectCoin(mario)   { this.coins++; this.score += COIN_SCORE; }
    _restartLevel()      { this.lives--; this.state = 'playing'; this.time = 400; this.timerAccumulator = 0; }
    triggerWin()         { this.state = 'win'; this.winTimer = 0; this.flagScore = 0; }
    triggerDeath()       { this.state = 'dead'; this.deathTimer = 0; }
    goToMenu()           { this.state = 'menu'; this.score = 0; this.coins = 0; this.lives = 3; }
}
