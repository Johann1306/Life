// ============================================================
// Collision detection & resolution — entity vs tilemap + entity vs entity
// ============================================================

function checkAABB(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Resolve X-axis collision against tile map. */
function resolveX(entity, tileMap) {
    const left   = Math.floor(entity.x / TILE_SIZE);
    const right  = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
    const top    = Math.floor(entity.y / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);

    let hitWall = false;
    if (entity.vx > 0) {
        for (let row = top; row <= bottom; row++) {
            if (tileMap.isSolid(right, row)) {
                entity.x = right * TILE_SIZE - entity.width;
                entity.vx = 0;
                hitWall = true;
                return hitWall;
            }
        }
    } else if (entity.vx < 0) {
        for (let row = top; row <= bottom; row++) {
            if (tileMap.isSolid(left, row)) {
                entity.x = (left + 1) * TILE_SIZE;
                entity.vx = 0;
                hitWall = true;
                return hitWall;
            }
        }
    }
    return hitWall;
}

/** Resolve Y-axis collision against tile map. Returns { grounded, hitBlockCol }. */
function resolveY(entity, tileMap) {
    let grounded = false;
    const left   = Math.floor(entity.x / TILE_SIZE);
    const right  = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
    const top    = Math.floor(entity.y / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);

    if (entity.vy > 0) {
        for (let col = left; col <= right; col++) {
            if (tileMap.isSolid(col, bottom)) {
                entity.y = bottom * TILE_SIZE - entity.height;
                entity.vy = 0;
                entity.grounded = true;
                grounded = true;
            }
        }
    } else if (entity.vy < 0) {
        for (let col = left; col <= right; col++) {
            if (tileMap.isSolid(col, top)) {
                entity.y = (top + 1) * TILE_SIZE;
                entity.vy = 0;
                entity.grounded = false;
                return { grounded: false, hitBlockCol: col };
            }
        }
    }
    return { grounded, hitBlockCol: null };
}

/** Determine collision side between two entities. */
function getCollisionSide(a, b) {
    const overlapL = (a.x + a.w) - b.x;
    const overlapR = (b.x + b.w) - a.x;
    const overlapT = (a.y + a.h) - b.y;
    const overlapB = (b.y + b.h) - a.y;
    const minX = Math.min(overlapL, overlapR);
    const minY = Math.min(overlapT, overlapB);
    if (minX < minY) return overlapL < overlapR ? 'right' : 'left';
    return overlapT < overlapB ? 'bottom' : 'top';
}
