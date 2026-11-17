// ============================================================
// HUDRenderer — score, coins, world, timer display
// ============================================================

class HUDRenderer {
    constructor(ctx) { this.ctx = ctx; }

    draw(mario, timeLeft) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, GAME_WIDTH, 36);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';

        ctx.fillText('MARIO', 30, 14);
        ctx.fillText(String(mario.score).padStart(6, '0'), 30, 30);

        ctx.fillText('★ x' + String(mario.coins).padStart(2, '0'), 200, 24);

        ctx.textAlign = 'center';
        ctx.fillText('WORLD', GAME_WIDTH / 2 + 60, 14);
        ctx.fillText('1-1', GAME_WIDTH / 2 + 60, 30);

        ctx.textAlign = 'right';
        ctx.fillText('TIME', GAME_WIDTH - 30, 14);
        ctx.fillText(String(Math.max(0, timeLeft)), GAME_WIDTH - 30, 30);

        ctx.textAlign = 'left';
        ctx.fillText('LIVES: ' + mario.lives, GAME_WIDTH / 2, GAME_HEIGHT - 10);
    }
}
