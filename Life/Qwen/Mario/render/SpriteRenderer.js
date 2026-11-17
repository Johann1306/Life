// ============================================================
// SpriteRenderer — procedural pixel-art drawing helpers
// ============================================================

class SpriteRenderer {
    constructor(ctx) { this.ctx = ctx; }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }

    // ---- Mario: stylized, animated character ----
    drawMario(x, y, facing, state, frame, grounded, isMoving) {
        const ctx = this.ctx;
        const px = Math.round(x), py = Math.round(y);

        if (state === 'invincible' && Math.floor(frame / 3) % 2 === 0) return;

        // Idle breathing: bob the whole sprite slightly
        let bobY = 0;
        if (grounded && !isMoving) {
            bobY = Math.sin(frame * 0.4) * 1;
        }
        const offY = Math.round(bobY);

        // Walk cycle: slight squash/stretch
        let squashX = 0, squashY = 0;
        if (!grounded) {
            // Stretch while jumping
            squashX = -2;
            squashY = 2;
        } else if (isMoving) {
            const walkPhase = frame % 4;
            squashX = (walkPhase === 1 || walkPhase === 3) ? 1 : -1;
            squashY = (walkPhase === 1 || walkPhase === 3) ? -1 : 1;
        }

        const cx = px + 12; // center X
        const top = py + offY + squashY;

        // Shadow (subtle)
        if (grounded) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(cx, py + 33, 12, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // === LEGS ===
        ctx.fillStyle = '#3B82F6';
        const legBase = py + 26 + offY + squashY;
        if (!grounded) {
            // Jump pose: one leg forward, one back
            ctx.fillRect(px + 2, legBase, 7, 7);
            ctx.fillRect(px + 15, legBase + 2, 7, 5);
            // Shoes
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(px + 1, legBase + 6, 8, 3);
            ctx.fillRect(px + 16, legBase + 6, 8, 3);
        } else {
            const walkPhase = frame % 4;
            if (walkPhase === 0) {
                ctx.fillRect(px + 4, legBase, 6, 7);
                ctx.fillRect(px + 14, legBase, 6, 7);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(px + 3, legBase + 6, 8, 3);
                ctx.fillRect(px + 13, legBase + 6, 8, 3);
            } else if (walkPhase === 1) {
                ctx.fillRect(px + 1, legBase - 1, 7, 7);
                ctx.fillRect(px + 16, legBase + 1, 7, 7);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(px, legBase + 5, 8, 3);
                ctx.fillRect(px + 15, legBase + 5, 8, 3);
            } else if (walkPhase === 2) {
                ctx.fillRect(px + 5, legBase, 6, 7);
                ctx.fillRect(px + 13, legBase, 6, 7);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(px + 4, legBase + 6, 8, 3);
                ctx.fillRect(px + 12, legBase + 6, 8, 3);
            } else {
                ctx.fillRect(px + 2, legBase + 1, 7, 7);
                ctx.fillRect(px + 15, legBase - 1, 7, 7);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(px + 1, legBase + 5, 8, 3);
                ctx.fillRect(px + 14, legBase + 5, 8, 3);
            }
        }

        // === OVERALLS ===
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(px + 4 + squashX, py + 20 + offY + squashY, 16 - squashX * 2, 7);
        // Overall straps
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(px + 5 + squashX, py + 17 + offY + squashY, 4, 5);
        ctx.fillRect(px + 15 - squashX, py + 17 + offY + squashY, 4, 5);
        // Belt & buttons
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(px + 8, py + 23 + offY, 2, 2);
        ctx.fillRect(px + 14, py + 23 + offY, 2, 2);

        // === BODY / SHIRT ===
        ctx.fillStyle = '#E52521';
        ctx.fillRect(px + 4 + squashX, py + 15 + offY, 16 - squashX * 2, 5);

        // === ARMS ===
        ctx.fillStyle = '#E52521';
        if (!grounded) {
            // Arms up while jumping
            ctx.fillRect(px, py + 13 + offY, 5, 8);
            ctx.fillRect(px + 19, py + 11 + offY, 5, 8);
            // Hands
            ctx.fillStyle = '#FDBA65';
            ctx.fillRect(px, py + 12 + offY, 5, 4);
            ctx.fillRect(px + 19, py + 10 + offY, 5, 4);
        } else {
            const walkPhase = frame % 4;
            const armSwing = walkPhase % 2 === 0 ? -2 : 2;
            ctx.fillRect(px + 1 + armSwing, py + 17 + offY, 4, 8);
            ctx.fillRect(px + 19 - armSwing, py + 17 + offY, 4, 8);
            ctx.fillStyle = '#FDBA65';
            ctx.fillRect(px + 1 + armSwing, py + 24 + offY, 4, 3);
            ctx.fillRect(px + 19 - armSwing, py + 24 + offY, 4, 3);
        }

        // === HEAD ===
        const headTop = py + offY + squashY;
        // Hat
        ctx.fillStyle = '#E52521';
        ctx.fillRect(px + 4, headTop, 16, 7);
        // Hat brim (extends in facing direction)
        ctx.fillRect(px + (facing === 'right' ? 10 : 0), headTop + 5, 14, 3);
        // Hat highlight
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(px + 6, headTop + 1, 6, 2);

        // === FACE ===
        ctx.fillStyle = '#FDBA65';
        ctx.fillRect(px + 4, headTop + 9, 16, 9);
        // Face highlight
        ctx.fillStyle = '#FDD9A0';
        ctx.fillRect(px + (facing === 'right' ? 4 : 10), headTop + 9, 4, 3);

        // === EYES ===
        const eyeY = headTop + 11;
        if (facing === 'right') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 12, eyeY, 5, 5);
            ctx.fillRect(px + 17, eyeY, 5, 5);
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(px + 14, eyeY + 1, 3, 3);
            ctx.fillRect(px + 19, eyeY + 1, 3, 3);
            // Eye shine
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 15, eyeY + 1, 1, 1);
            ctx.fillRect(px + 20, eyeY + 1, 1, 1);
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 2, eyeY, 5, 5);
            ctx.fillRect(px + 7, eyeY, 5, 5);
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(px + 2, eyeY + 1, 3, 3);
            ctx.fillRect(px + 7, eyeY + 1, 3, 3);
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 3, eyeY + 1, 1, 1);
            ctx.fillRect(px + 8, eyeY + 1, 1, 1);
        }

        // === MUSTACHE ===
        ctx.fillStyle = '#5C2E00';
        const mustY = headTop + 15;
        if (facing === 'right') {
            ctx.fillRect(px + 8, mustY, 10, 2);
            ctx.fillRect(px + 6, mustY + 1, 6, 1);
            ctx.fillRect(px + 12, mustY + 1, 6, 1);
        } else {
            ctx.fillRect(px + 6, mustY, 10, 2);
            ctx.fillRect(px + 8, mustY + 1, 6, 1);
            ctx.fillRect(px + 2, mustY + 1, 6, 1);
        }

        // === NOSE ===
        ctx.fillStyle = '#FDBA65';
        const noseX = facing === 'right' ? px + 16 : px + 6;
        ctx.fillRect(noseX, mustY - 1, 4, 3);
        ctx.fillStyle = '#FDD9A0';
        ctx.fillRect(noseX + 1, mustY, 2, 1);
    }

    // ---- Goomba: expressive, cute enemy ----
    drawGoomba(x, y, frame, squished) {
        const ctx = this.ctx;
        if (squished) {
            this.drawRect(Math.round(x) + 2, Math.round(y + 20), 24, 8, '#A0522D');
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(Math.round(x) + 6, Math.round(y + 21), 4, 2);
            ctx.fillRect(Math.round(x) + 18, Math.round(y + 21), 4, 2);
            return;
        }

        const px = Math.round(x), py = Math.round(y);
        const cx = px + 14;

        // Body (mushroom shape)
        ctx.fillStyle = '#A0522D';
        // Top dome
        ctx.beginPath();
        ctx.arc(cx, py + 8, 14, Math.PI, 0);
        ctx.fill();
        // Body below
        ctx.fillRect(px + 4, py + 6, 20, 14);
        // Bottom round
        ctx.beginPath();
        ctx.arc(cx, py + 20, 10, 0, Math.PI);
        ctx.fill();

        // Highlight on dome
        ctx.fillStyle = '#C47A4E';
        ctx.beginPath();
        ctx.arc(cx - 4, py + 4, 8, Math.PI, 0);
        ctx.fill();

        // === EYEBROWS (angry) ===
        ctx.fillStyle = '#5C2E00';
        ctx.fillRect(px + 6, py + 4, 6, 2);
        ctx.fillRect(px + 16, py + 4, 6, 2);
        // Angled
        ctx.fillRect(px + 5, py + 3, 3, 2);
        ctx.fillRect(px + 20, py + 3, 3, 2);

        // Eyes (white)
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 7, py + 6, 6, 6);
        ctx.fillRect(px + 15, py + 6, 6, 6);

        // Pupils (look toward movement)
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(px + 9, py + 8, 3, 3);
        ctx.fillRect(px + 17, py + 8, 3, 3);

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 10, py + 8, 1, 1);
        ctx.fillRect(px + 18, py + 8, 1, 1);

        // Mouth
        ctx.fillStyle = '#5C2E00';
        ctx.fillRect(px + 10, py + 16, 8, 2);
        // Teeth
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 11, py + 16, 2, 2);
        ctx.fillRect(px + 15, py + 16, 2, 2);

        // Feet (animate)
        ctx.fillStyle = '#000';
        const footBob = Math.sin(frame * 0.8) * 2;
        if (frame % 2 === 0) {
            ctx.fillRect(px, py + 22 + footBob, 10, 6);
            ctx.fillRect(px + 18, py + 22 - footBob, 10, 6);
        } else {
            ctx.fillRect(px + 1, py + 22 - footBob, 10, 6);
            ctx.fillRect(px + 17, py + 22 + footBob, 10, 6);
        }
        // Foot highlight
        ctx.fillStyle = '#333';
        ctx.fillRect(px + 2, py + 22 + footBob, 6, 1);
        ctx.fillRect(px + 20, py + 22 - footBob, 6, 1);
    }

    // ---- Coin: shiny spinning coin ----
    drawCoin(x, y, frame) {
        const ctx = this.ctx;
        const widths = [16, 12, 4, 12];
        const w = widths[frame % 4];
        const ox = (16 - w) / 2;
        const cx = Math.round(x) + 8;
        const cy = Math.round(y) + 12;

        if (w > 6) {
            // Shiny gold body
            const grad = ctx.createRadialGradient(cx - 2, cy - 3, 1, cx, cy, 12);
            grad.addColorStop(0, '#FFF8DC');
            grad.addColorStop(0.5, '#FFD700');
            grad.addColorStop(1, '#DAA520');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(cx, cy, w / 2, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Inner circle
            if (w > 10) {
                ctx.strokeStyle = '#B8860B';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(cx, cy, w / 2 - 3, 9, 0, 0, Math.PI * 2);
                ctx.stroke();

                // $ symbol
                ctx.fillStyle = '#B8860B';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', cx, cy + 1);
            }

            // Shine highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.ellipse(cx - w / 4 + 2, cy - 5, 2, 4, -0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---- Mushroom: cute power-up ----
    drawMushroom(x, y) {
        const ctx = this.ctx;
        const px = Math.round(x), py = Math.round(y);

        // Stem (tan)
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(px + 6, py + 14, 16, 18);
        // Stem highlight
        ctx.fillStyle = '#FAEBD7';
        ctx.fillRect(px + 8, py + 14, 4, 18);

        // Cap (red dome)
        ctx.fillStyle = '#E52521';
        ctx.beginPath();
        ctx.arc(px + 16, py + 10, 14, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(px + 2, py + 10, 28, 6);

        // Spots (white circles on cap)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px + 10, py + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 22, py + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 16, py + 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cap highlight
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(px + 12, py + 4, 6, Math.PI, 0);
        ctx.fill();

        // Eyes on stem
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(px + 10, py + 20, 3, 3);
        ctx.fillRect(px + 16, py + 20, 3, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 11, py + 20, 1, 1);
        ctx.fillRect(px + 17, py + 20, 1, 1);
    }
}
