// ============================================================
// HUDRenderer - score, coins, world, timer display
// ============================================================

class HUDRenderer {
    constructor(ctx) { this.ctx = ctx; }

    draw(mario, timeLeft) {
        const ctx = this.ctx;

        // Background bar
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 36);
        bgGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        bgGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, GAME_WIDTH, 36);

        // Bottom border
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(0, 35, GAME_WIDTH, 1);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';

        // MARIO name
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('MARIO', 28, 12);

        // Score
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(String(mario.score).padStart(6, '0'), 28, 30);

        // Coins
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('★', 195, 25);
        ctx.fillStyle = '#fff';
        ctx.fillText('x' + String(mario.coins).padStart(2, '0'), 210, 25);

        // WORLD
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WORLD', GAME_WIDTH / 2 + 60, 12);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('1-1', GAME_WIDTH / 2 + 60, 30);

        // TIME
        ctx.textAlign = 'right';
        ctx.fillStyle = timeLeft <= 100 ? '#FF4444' : '#FFD700';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TIME', GAME_WIDTH - 28, 12);

        ctx.fillStyle = timeLeft <= 100 ? '#FF4444' : '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(String(Math.max(0, timeLeft)), GAME_WIDTH - 28, 30);

        // Lives (bottom center)
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px monospace';
        ctx.fillText('LIVES: ' + mario.lives, GAME_WIDTH / 2 - 20, GAME_HEIGHT - 8);
    }
}
