// ============================================================
// Tile Map — 2D grid wrapper with query & modification API
// ============================================================

class TileMap {
    constructor(grid) {
        this.grid = grid;
        this.rows = grid.length;
        this.cols = grid[0].length;
    }

    getTile(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return T.EMPTY;
        return this.grid[row][col];
    }

    setTile(col, row, type) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
        this.grid[row][col] = type;
    }

    isSolid(col, row) {
        const t = this.getTile(col, row);
        return t === T.GROUND || t === T.PLATFORM || t === T.PIPE_LEFT ||
               t === T.PIPE_RIGHT || t === T.PIPE_TOP || t === T.BRICK ||
               t === T.QUESTION_COIN || t === T.BLOCKED_BLOCK || t === T.HARD_BLOCK;
    }

    isSolidAtPixel(px, py) {
        return this.isSolid(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE));
    }

    /** Get all non-empty tiles within a column range (for culling). */
    getVisibleTiles(startCol, endCol) {
        const tiles = [];
        for (let col = startCol; col <= endCol; col++) {
            for (let row = 0; row < this.rows; row++) {
                const t = this.getTile(col, row);
                if (t !== T.EMPTY) tiles.push({ col, row, type: t });
            }
        }
        return tiles;
    }
}
