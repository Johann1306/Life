// ============================================================
// ScorePopup — floating "+100" text animation
// ============================================================

class ScorePopup {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.life = 40;
    }

    update() { this.y -= 1; this.life--; }
    isDead() { return this.life <= 0; }

    render(ctx, cameraX) {
        const alpha = Math.min(1, this.life / 20);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(this.text, this.x - cameraX, this.y);
        ctx.globalAlpha = 1;
    }
}
