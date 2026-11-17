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

        // Gradient sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        skyGrad.addColorStop(0, '#5C94FC');
        skyGrad.addColorStop(0.6, '#87CEFB');
        skyGrad.addColorStop(1, '#B0E0FF');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Distant mountains (parallax layer 0)
        this._drawMountains(ctx, camX);

        // Clouds (parallax layer 1)
        this._drawClouds(ctx, camX);

        // Hills background (parallax layer 2)
        this._drawHills(ctx, camX);

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

    _drawMountains(ctx, camX) {
        ctx.fillStyle = '#6B8FC8';
        const mountains = [
            { x: 100, w: 200, h: 100 },
            { x: 500, w: 280, h: 130 },
            { x: 900, w: 180, h: 90 },
            { x: 1300, w: 300, h: 120 },
            { x: 1800, w: 220, h: 110 },
        ];
        for (const m of mountains) {
            const mx = ((m.x - camX * 0.05) % 2200 + 2200) % 2200 - 200;
            ctx.beginPath();
            ctx.moveTo(mx, GAME_HEIGHT - 32);
            ctx.lineTo(mx + m.w / 2, GAME_HEIGHT - 32 - m.h);
            ctx.lineTo(mx + m.w, GAME_HEIGHT - 32);
            ctx.closePath();
            ctx.fill();
        }
    }

    _drawClouds(ctx, camX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        const cloudPositions = [
            { x: 100, y: 60, s: 1.0 },
            { x: 400, y: 40, s: 1.2 },
            { x: 700, y: 70, s: 0.8 },
            { x: 1100, y: 50, s: 1.1 },
            { x: 1500, y: 35, s: 0.9 },
            { x: 1900, y: 65, s: 1.0 },
        ];
        for (const c of cloudPositions) {
            const sx = ((c.x - camX * 0.2) % 2200 + 2200) % 2200 - 100;
            const sy = c.y;
            const s = c.s;
            // Fluffy cloud shape
            ctx.beginPath();
            ctx.arc(sx, sy, 15 * s, 0, Math.PI * 2);
            ctx.arc(sx + 18 * s, sy - 8 * s, 18 * s, 0, Math.PI * 2);
            ctx.arc(sx + 38 * s, sy - 4 * s, 16 * s, 0, Math.PI * 2);
            ctx.arc(sx + 55 * s, sy + 2 * s, 12 * s, 0, Math.PI * 2);
            ctx.arc(sx + 20 * s, sy + 5 * s, 14 * s, 0, Math.PI * 2);
            ctx.arc(sx + 40 * s, sy + 4 * s, 13 * s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawHills(ctx, camX) {
        const hillColors = ['#00A800', '#009800', '#00B800'];
        const hills = [{ x: 50, r: 40 }, { x: 350, r: 60 }, { x: 750, r: 45 }, { x: 1100, r: 55 }, { x: 1500, r: 38 }, { x: 1900, r: 50 }];

        // Back layer (darker, smaller)
        ctx.fillStyle = '#007A00';
        for (const h of hills) {
            const hx = ((h.x - camX * 0.1) % 2100 + 2100) % 2100 - 100;
            ctx.beginPath();
            ctx.arc(hx, GAME_HEIGHT - 32, h.r * 0.6, Math.PI, 0);
            ctx.fill();
        }

        // Front layer
        for (let i = 0; i < hills.length; i++) {
            const h = hills[i];
            const hx = ((h.x - camX * 0.15) % 2100 + 2100) % 2100 - 100;
            ctx.fillStyle = hillColors[i % hillColors.length];
            ctx.beginPath();
            ctx.arc(hx, GAME_HEIGHT - 32, h.r, Math.PI, 0);
            ctx.fill();

            // Hill highlight
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.beginPath();
            ctx.ellipse(hx - h.r * 0.2, GAME_HEIGHT - 32 - h.r * 0.4, h.r * 0.3, h.r * 0.2, -0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawMenuScreen(ctx) {
        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Title box
        const bx = GAME_WIDTH / 2 - 160, by = GAME_HEIGHT / 2 - 100, bw = 320, bh = 160;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = 'rgba(255,215,0,0.1)';
        ctx.fillRect(bx, by, bw, 3);

        // Title
        ctx.fillStyle = '#E52521';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUPER MARIO', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('CLONE', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 15);

        // Blinking start text
        if (Math.floor(performance.now() / 600) % 2 === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px monospace';
            ctx.fillText('Press SPACE to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25);
        }

        // Controls
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '12px monospace';
        ctx.fillText('Arrow Keys / WASD / Z to Move  |  SPACE / W to Jump', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55);
    }

    _drawGameOverScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const bx = GAME_WIDTH / 2 - 120, by = GAME_HEIGHT / 2 - 70, bw = 240, bh = 140;
        ctx.fillStyle = 'rgba(20,0,0,0.8)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#E52521';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.fillStyle = '#E52521';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 15);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`Score: ${this.state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25);

        if (Math.floor(performance.now() / 600) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '14px monospace';
            ctx.fillText('Press SPACE', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55);
        }
    }

    _drawWinScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const bx = GAME_WIDTH / 2 - 140, by = GAME_HEIGHT / 2 - 80, bw = 280, bh = 160;
        ctx.fillStyle = 'rgba(20,15,0,0.8)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = 'rgba(255,215,0,0.08)';
        ctx.fillRect(bx, by, bw, 3);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 25);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`Score: ${this.state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15);
        ctx.fillText(`Coins: ${this.state.coins}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);

        if (Math.floor(performance.now() / 600) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '14px monospace';
            ctx.fillText('Press SPACE', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);
        }
    }
}
