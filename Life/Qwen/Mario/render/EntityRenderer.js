// ============================================================
// EntityRenderer — dispatch entity drawing by type
// ============================================================

class EntityRenderer {
    constructor(ctx) { this.renderer = new SpriteRenderer(ctx); }

    draw(entity, cameraX) {
        if (!entity.alive && !(entity.squished)) return;
        const sx = entity.x - cameraX;
        const sy = entity.y;

        switch (entity.type) {
            case 'mario':
                this.renderer.drawMario(sx, sy, entity.facing, entity.state, entity.animFrame, entity.grounded);
                break;
            case 'goomba':
                this.renderer.drawGoomba(sx, sy, entity.animFrame, entity.squished);
                break;
            case 'coin':
                this.renderer.drawCoin(sx, sy, entity.animFrame);
                break;
            case 'mushroom':
                this.renderer.drawMushroom(sx, sy);
                break;
        }
    }
}
