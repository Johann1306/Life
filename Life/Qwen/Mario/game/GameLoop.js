// ============================================================
// GameLoop — main loop: update + render via requestAnimationFrame
// ============================================================

class GameLoop {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;

        this.input = new InputManager();
        this.state = new GameState();
        this.camera = new Camera(LEVEL_WIDTH_TILES * TILE_SIZE);
        this.tileRenderer = new TileRenderer(this.ctx);
        this.entityRenderer = new EntityRenderer(this.ctx);
        this.hudRenderer = new HUDRenderer(this.ctx);

        this.mario = null;
        this.goombas = [];
        this.coins = [];
        this.mushrooms = [];
        this.popups = [];
        this.flagPole = null;
        this.tileMap = null;

        this._running = false;
        this._lastTime = 0;
    }

    init(tileMap, mario, goombas, flagPole) {
        this.tileMap = tileMap;
        this.mario = mario;
        this.goombas = goombas;
        this.coins = [];
        this.mushrooms = [];
        this.popups = [];
        this.flagPole = flagPole;
    }

    start() {
        if (this._running) return;
        this._running = true;
        this._lastTime = performance.now();
        this._loop(this._lastTime);
    }

    stop() { this._running = false; }

    _loop(timestamp) {
        if (!this._running) return;
        const dt = Math.min((timestamp - this._lastTime) / 16.67, 3);
        this._lastTime = timestamp;

        this._update(dt);
        this._render();

        requestAnimationFrame((t) => this._loop(t));
    }

    _update(dt) {
        switch (this.state.state) {
            case 'menu':
                if (this.input.consumeJump()) { this.state.state = 'playing'; }
                break;

            case 'playing':
                // Mario update
                this.mario.update(this.input, this.tileMap);

                // Camera follow
                this.camera.follow(this.mario.x, GAME_WIDTH);

                // Entity updates
                for (const g of this.goombas) g.update(this.tileMap);
                for (let i = this.coins.length - 1; i >= 0; i--) { this.coins[i].update(); if (this.coins[i].collected) this.coins.splice(i, 1); }
                for (let i = this.mushrooms.length - 1; i >= 0; i--) { this.mushrooms[i].update(this.tileMap); if (!this.mushrooms[i].alive) this.mushrooms.splice(i, 1); }

                // Entity vs entity collisions
                this._checkEntityCollisions();

                // Block hit detection (Mario hits block from below)
                this._checkBlockHits();

                // Flagpole check
                const flagResult = this.flagPole.checkCollision(this.mario);
                if (flagResult === 'win') {
                    this.state.triggerWin();
                    this.mario.winAnim = true;
                    this.mario._winPhase = 0;
                }

                // Game state update
                this.state.update(dt);
                break;

            case 'dead':
                if (this.mario.y < GAME_HEIGHT + TILE_SIZE * 3) {
                    this.mario.vy += GRAVITY;
                    this.mario.y += this.mario.vy;
                }
                break;

            case 'win':
                if (this.mario.winAnim) {
                    if (this.state.winTimer < 60) {
                        this.mario.x = this.flagPole.x + 8;
                        this.mario.y += 2;
                    } else if (this.state.winTimer < 120) {
                        this.mario.grounded = true;
                    }
                }
                break;

            case 'gameover':
                if (this.input.consumeJump()) {
                    // Full reset
                    this.state.score = 0; this.state.coins = 0; this.state.lives = 3;
                    this.mario = new Mario(64, 352);
                    this.goombas.forEach(g => { g.alive = true; g.squished = false; g.x = g._origX || g.x; });
                    this.coins = []; this.mushrooms = []; this.popups = [];
                    this.state.time = 400; this.state.timerAccumulator = 0;
                    this.camera.x = 0;
                    this.state.state = 'playing';
                }
                break;
        }

        // Score popups
        for (let i = this.popups.length - 1; i >= 0; i--) {
            this.popups[i].update();
            if (this.popups[i].isDead()) this.popups.splice(i, 1);
        }

        this.input.resetFrame();
    }

    _checkBlockHits() {
        const left   = Math.floor(this.mario.x / TILE_SIZE);
        const right  = Math.floor((this.mario.x + this.mario.width - 1) / TILE_SIZE);
        const top    = Math.floor(this.mario.y / TILE_SIZE);

        if (this.mario.vy < 0) {
            for (let col = left; col <= right; col++) {
                if (this.tileMap.getTile(col, top) === T.QUESTION_COIN) {
                    this.tileMap.setTile(col, top, T.BLOCKED_BLOCK);
                    this.state.addCoin();
                    const coin = new Coin(col * TILE_SIZE + 8, (top - 1) * TILE_SIZE);
                    this.coins.push(coin);
                    this.popups.push(new ScorePopup(col * TILE_SIZE, (top - 1) * TILE_SIZE, '+200'));

                    // Maybe spawn mushroom from specific block
                    if (col === 92 && top === 5) {
                        const mush = new Mushroom(col * TILE_SIZE, (top - 1) * TILE_SIZE);
                        this.mushrooms.push(mush);
                    }
                } else if (this.tileMap.getTile(col, top) === T.BRICK) {
                    // Break brick if Mario is large
                    if (this.mario.state === 'large') {
                        this.tileMap.setTile(col, top, T.EMPTY);
                        this.popups.push(new ScorePopup(col * TILE_SIZE, (top - 1) * TILE_SIZE, '+50'));
                    }
                }
            }
        }
    }

    _checkEntityCollisions() {
        const mBounds = this.mario.getBounds();

        for (const g of this.goombas) {
            if (!g.alive || g.squished) continue;
            if (checkAABB(mBounds, g.getBounds())) {
                this.state.handleMarioVsGoomba(this.mario, g);
                break;
            }
        }

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const c = this.coins[i];
            if (!c.alive || c.collected) continue;
            if (checkAABB(mBounds, c.getBounds())) {
                this.state.collectCoin(this.mario);
                this.popups.push(new ScorePopup(c.x, c.y, '+200'));
                c.alive = false;
                this.coins.splice(i, 1);
            }
        }

        for (let i = this.mushrooms.length - 1; i >= 0; i--) {
            const m = this.mushrooms[i];
            if (!m.alive) continue;
            if (checkAABB(mBounds, m.getBounds())) {
                this.state.collectMushroom(this.mario);
                this.popups.push(new ScorePopup(m.x, m.y, '+1000'));
                m.alive = false;
                this.mushrooms.splice(i, 1);
            }
        }
    }

    _render() {
        const ctx = this.ctx;
        const camX = this.camera.getOffset();

        // Sky background
        ctx.fillStyle = '#5C94FC';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Clouds (parallax)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const clouds = [
            { x: 100, y: 60, w: 80, h: 30 },
            { x: 400, y: 40, w: 100, h: 35 },
            { x: 700, y: 70, w: 60, h: 25 },
            { x: 1100, y: 50, w: 90, h: 30 },
        ];
        for (const c of clouds) {
            const sx = c.x - camX * 0.3;
            ctx.fillRect(Math.round(sx), Math.round(c.y), c.w, c.h);
            ctx.fillRect(Math.round(sx + 15), Math.round(c.y - 10), c.w - 30, 20);
        }

        // Hills background (parallax layer 2)
        ctx.fillStyle = '#00A800';
        const hills = [{ x: 50, r: 40 }, { x: 350, r: 60 }, { x: 750, r: 45 }];
        for (const h of hills) {
            const hx = h.x - camX * 0.15;
            ctx.beginPath();
            ctx.arc(Math.round(hx), GAME_HEIGHT - 32, h.r, Math.PI, 0);
            ctx.fill();
        }

        // Tiles
        this.tileRenderer.drawVisible(this.tileMap, camX, GAME_WIDTH);

        // Flagpole
        this.flagPole.render(ctx, camX);

        // Entities
        for (const g of this.goombas) this.entityRenderer.draw(g, camX);
        for (const c of this.coins) this.entityRenderer.draw(c, camX);
        for (const m of this.mushrooms) this.entityRenderer.draw(m, camX);
        this.entityRenderer.draw(this.mario, camX);

        // Score popups
        for (const p of this.popups) p.render(ctx, camX);

        // HUD
        this.hudRenderer.draw(this.mario, this.state.time);

        // UI screens
        if (this.state.state === 'menu') this._drawMenuScreen(ctx);
        if (this.state.state === 'gameover' && this.state.winTimer >= 180) this._drawWinScreen(ctx);
        else if (this.state.state === 'gameover') this._drawGameOverScreen(ctx);
    }

    _drawMenuScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUPER MARIO CLONE', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
        ctx.font = '18px monospace';
        ctx.fillText('Press SPACE to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        ctx.fillText('Arrow Keys / WASD / Z to Move  |  SPACE / W / Z to Jump', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    }

    _drawGameOverScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#E52521';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText(`Final Score: ${this.state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        ctx.fillText('Press SPACE for Menu', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    }

    _drawWinScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText(`Score: ${this.state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        ctx.fillText('Press SPACE for Menu', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    }
}
