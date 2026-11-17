// ============================================================
// TileRenderer — draw visible tiles from tile map
// ============================================================

class TileRenderer {
    constructor(ctx) { this.renderer = new SpriteRenderer(ctx); }

    drawVisible(tileMap, cameraX, canvasWidth) {
        const startCol = Math.floor(cameraX / TILE_SIZE) - 1;
        const endCol = startCol + Math.ceil(canvasWidth / TILE_SIZE) + 2;
        const ctx = this.renderer.ctx;

        for (let col = startCol; col <= endCol; col++) {
            for (let row = 0; row < tileMap.rows; row++) {
                const tile = tileMap.getTile(col, row);
                if (tile === T.EMPTY) continue;
                const sx = col * TILE_SIZE - cameraX;
                const sy = row * TILE_SIZE;

                switch (tile) {
                    case T.GROUND:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#C84C09');
                        // Only draw green top edge on the first ground row (row 8)
                        if (row === 8) {
                            this.renderer.drawRect(sx, sy, TILE_SIZE, 4, '#00A800');
                        }
                        break;
                    case T.PLATFORM:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE / 2, '#C84C09');
                        this.renderer.drawRect(sx, sy, TILE_SIZE, 3, '#00A800');
                        break;
                    case T.BRICK:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#B75020');
                        ctx.strokeStyle = '#8B3000';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE / 2 - 1);
                        ctx.strokeRect(sx + 9, sy + TILE_SIZE / 2, TILE_SIZE / 2 - 10, TILE_SIZE / 2 - 2);
                        break;
                    case T.QUESTION_COIN:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#FFB800');
                        ctx.fillStyle = '#8B4513';
                        ctx.font = 'bold 20px monospace';
                        ctx.fillText('?', sx + 10, sy + 24);
                        break;
                    case T.BLOCKED_BLOCK:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#8B6914');
                        break;
                    case T.HARD_BLOCK:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#808080');
                        ctx.strokeStyle = '#606060';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                        break;
                    case T.PIPE_LEFT:
                    case T.PIPE_RIGHT:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#00A800');
                        ctx.strokeStyle = '#007A00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                        break;
                    case T.PIPE_TOP:
                        this.renderer.drawRect(sx, sy, TILE_SIZE, TILE_SIZE, '#00A800');
                        ctx.strokeStyle = '#007A00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                        break;
                    case T.FLAG_POLE:
                        this.renderer.drawRect(sx + 14, sy, 4, TILE_SIZE, '#808080');
                        break;
                    case T.FLAG_TOP:
                        this.renderer.drawRect(sx + 14, sy, 4, TILE_SIZE, '#808080');
                        break;
                }
            }
        }
    }
}
