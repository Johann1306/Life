// ============================================================
// TileRenderer - draw visible tiles from tile map
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
                        this._drawGround(ctx, sx, sy, row, col, tileMap);
                        break;
                    case T.PLATFORM:
                        this._drawPlatform(ctx, sx, sy, row, tileMap);
                        break;
                    case T.BRICK:
                        this._drawBrick(ctx, sx, sy, col, row);
                        break;
                    case T.QUESTION_COIN:
                        this._drawQuestionBlock(ctx, sx, sy, col, row);
                        break;
                    case T.BLOCKED_BLOCK:
                        this._drawBlockedBlock(ctx, sx, sy);
                        break;
                    case T.HARD_BLOCK:
                        this._drawHardBlock(ctx, sx, sy, col, row, tileMap);
                        break;
                    case T.PIPE_LEFT:
                        this._drawPipeLeft(ctx, sx, sy, row, col, tileMap);
                        break;
                    case T.PIPE_RIGHT:
                        this._drawPipeRight(ctx, sx, sy, row, col, tileMap);
                        break;
                    case T.PIPE_TOP:
                        this._drawPipeTop(ctx, sx, sy, col, row, tileMap);
                        break;
                    case T.FLAG_POLE:
                        this.renderer.drawRect(sx + 14, sy, 4, TILE_SIZE, '#808080');
                        this.renderer.drawRect(sx + 14, sy, 1, TILE_SIZE, '#A0A0A0');
                        break;
                    case T.FLAG_TOP:
                        this.renderer.drawRect(sx + 14, sy, 4, TILE_SIZE, '#808080');
                        this.renderer.drawRect(sx + 14, sy, 1, TILE_SIZE, '#A0A0A0');
                        break;
                }
            }
        }
    }

    _drawGround(ctx, sx, sy, row, col, tileMap) {
        const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE_SIZE);
        grad.addColorStop(0, '#C84C09');
        grad.addColorStop(1, '#A0400A');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        if (row === 8) {
            const grassGrad = ctx.createLinearGradient(sx, sy, sx, sy + 8);
            grassGrad.addColorStop(0, '#00D800');
            grassGrad.addColorStop(0.5, '#00A800');
            grassGrad.addColorStop(1, '#008800');
            ctx.fillStyle = grassGrad;
            ctx.fillRect(sx, sy, TILE_SIZE, 8);

            // Grass tufts
            ctx.fillStyle = '#00E800';
            for (let i = 0; i < 3; i++) {
                const tx = sx + 4 + i * 10;
                ctx.fillRect(tx, sy - 2, 3, 4);
                ctx.fillRect(tx + 2, sy - 3, 2, 3);
            }
        }

        // Ground texture dots
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        const seed = (col * 7 + row * 13) % 5;
        if (seed < 2) {
            const dx = (col * 17 + row * 23) % 24 + 4;
            const dy = (col * 31 + row * 11) % 20 + 12;
            ctx.fillRect(sx + dx, sy + dy, 2, 2);
        }

        // Edge highlight/shadow
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(sx, sy, TILE_SIZE, 1);
        ctx.fillRect(sx, sy, 1, TILE_SIZE);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(sx, sy + TILE_SIZE - 1, TILE_SIZE, 1);
        ctx.fillRect(sx + TILE_SIZE - 1, sy, 1, TILE_SIZE);
    }

    _drawPlatform(ctx, sx, sy, row, tileMap) {
        const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE_SIZE / 2);
        grad.addColorStop(0, '#C84C09');
        grad.addColorStop(1, '#A0400A');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE / 2);

        const grassGrad = ctx.createLinearGradient(sx, sy, sx, sy + 6);
        grassGrad.addColorStop(0, '#00D800');
        grassGrad.addColorStop(1, '#008800');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(sx, sy, TILE_SIZE, 6);

        ctx.fillStyle = '#00E800';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(sx + 4 + i * 10, sy - 2, 3, 4);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(sx, sy, TILE_SIZE, 1);
        ctx.fillRect(sx, sy, 1, TILE_SIZE / 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(sx, sy + TILE_SIZE / 2 - 1, TILE_SIZE, 1);
    }

    _drawBrick(ctx, sx, sy, col, row) {
        ctx.fillStyle = '#C85A1C';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#8B3000';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, TILE_SIZE - 1, TILE_SIZE / 2 - 1);
        ctx.strokeRect(sx + 0.5, sy + TILE_SIZE / 2 + 0.5, TILE_SIZE - 1, TILE_SIZE / 2 - 1);
        ctx.strokeRect(sx + TILE_SIZE / 4 + 0.5, sy + 0.5, TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1);
        ctx.strokeRect(sx + TILE_SIZE / 8 + 0.5, sy + TILE_SIZE / 2 + 0.5, TILE_SIZE / 2 - 1, TILE_SIZE / 2 - 1);

        ctx.fillStyle = 'rgba(255,200,100,0.15)';
        ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(sx + 1, sy + TILE_SIZE - 3, TILE_SIZE - 2, 2);
    }

    _drawQuestionBlock(ctx, sx, sy, col, row) {
        const shimmer = Math.sin(col * 0.5 + row * 0.3) * 0.1 + 0.9;

        const grad = ctx.createLinearGradient(sx, sy, sx + TILE_SIZE, sy + TILE_SIZE);
        grad.addColorStop(0, `rgba(255,220,50,${shimmer})`);
        grad.addColorStop(0.5, `rgba(255,184,0,${shimmer})`);
        grad.addColorStop(1, `rgba(218,165,32,${shimmer})`);
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, 2);
        ctx.fillRect(sx + 2, sy + 2, 2, TILE_SIZE - 4);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(sx + 2, sy + TILE_SIZE - 4, TILE_SIZE - 4, 2);
        ctx.fillRect(sx + TILE_SIZE - 4, sy + 2, 2, TILE_SIZE - 4);

        ctx.fillStyle = '#5C2E00';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2 + 1);

        ctx.fillStyle = '#B8860B';
        ctx.fillRect(sx + 2, sy + 2, 3, 3);
        ctx.fillRect(sx + TILE_SIZE - 5, sy + 2, 3, 3);
        ctx.fillRect(sx + 2, sy + TILE_SIZE - 5, 3, 3);
        ctx.fillRect(sx + TILE_SIZE - 5, sy + TILE_SIZE - 5, 3, 3);
    }

    _drawBlockedBlock(ctx, sx, sy) {
        ctx.fillStyle = '#6B5B3A';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#4A3F2A';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);

        ctx.beginPath();
        ctx.moveTo(sx + 8, sy + 4);
        ctx.lineTo(sx + 20, sy + 24);
        ctx.moveTo(sx + 24, sy + 4);
        ctx.lineTo(sx + 8, sy + 24);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, 2);
    }

    _drawHardBlock(ctx, sx, sy, col, row, tileMap) {
        const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE_SIZE);
        grad.addColorStop(0, '#909090');
        grad.addColorStop(1, '#707070');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#606060';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.strokeRect(sx + 6, sy + 6, TILE_SIZE - 12, TILE_SIZE / 2 - 4);
        ctx.strokeRect(sx + 10, sy + TILE_SIZE / 2 + 2, TILE_SIZE - 18, TILE_SIZE / 2 - 6);

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, 2);
        ctx.fillRect(sx + 1, sy + 1, 2, TILE_SIZE - 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(sx + 1, sy + TILE_SIZE - 3, TILE_SIZE - 2, 2);
        ctx.fillRect(sx + TILE_SIZE - 3, sy + 1, 2, TILE_SIZE - 2);
    }

    _drawPipeLeft(ctx, sx, sy, row, col, tileMap) {
        const grad = ctx.createLinearGradient(sx, sy, sx + TILE_SIZE, sy);
        grad.addColorStop(0, '#007A00');
        grad.addColorStop(0.3, '#00C800');
        grad.addColorStop(0.7, '#00A800');
        grad.addColorStop(1, '#006800');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(sx + 2, sy, 4, TILE_SIZE);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(sx + TILE_SIZE - 4, sy, 4, TILE_SIZE);

        if (row > 0 && tileMap.getTile(col, row - 1) === T.PIPE_TOP) {
            ctx.fillStyle = '#005800';
            ctx.fillRect(sx, sy, TILE_SIZE, 2);
        }
    }

    _drawPipeRight(ctx, sx, sy, row, col, tileMap) {
        const grad = ctx.createLinearGradient(sx, sy, sx + TILE_SIZE, sy);
        grad.addColorStop(0, '#008A00');
        grad.addColorStop(0.4, '#00C800');
        grad.addColorStop(0.8, '#00A800');
        grad.addColorStop(1, '#005800');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(sx + 2, sy, 4, TILE_SIZE);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(sx + TILE_SIZE - 4, sy, 4, TILE_SIZE);

        if (row > 0 && tileMap.getTile(col, row - 1) === T.PIPE_TOP) {
            ctx.fillStyle = '#005800';
            ctx.fillRect(sx, sy, TILE_SIZE, 2);
        }
    }

    _drawPipeTop(ctx, sx, sy, col, row, tileMap) {
        const grad = ctx.createLinearGradient(sx - 4, sy, sx + TILE_SIZE + 4, sy);
        grad.addColorStop(0, '#006800');
        grad.addColorStop(0.2, '#00C800');
        grad.addColorStop(0.5, '#00E800');
        grad.addColorStop(0.8, '#00A800');
        grad.addColorStop(1, '#005800');
        ctx.fillStyle = grad;
        ctx.fillRect(sx - 4, sy, TILE_SIZE + 8, TILE_SIZE);

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(sx - 2, sy + 2, 6, TILE_SIZE - 4);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(sx + TILE_SIZE + 2, sy + 2, 4, TILE_SIZE - 4);

        ctx.fillStyle = '#005800';
        ctx.fillRect(sx - 4, sy + TILE_SIZE - 2, TILE_SIZE + 8, 2);
    }
}
