// ============================================================
// Base Entity class — shared state for all game objects
// ============================================================

class Entity {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.alive = true;
        this.grounded = false;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    update(dt) { /* subclass override */ }
    render(ctx, cameraX) { /* subclass override */ }

    collidesWith(other) {
        const a = this.getBounds();
        const b = other.getBounds();
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
    }
}
