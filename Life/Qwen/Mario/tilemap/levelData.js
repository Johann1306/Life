// ============================================================
// Level 1-1 layout data — imitating Super Mario Bros original SMB1 1-1
// Ground surface is at row 8 (y = 256px), matching SMB1's ~66% ground ratio
// ============================================================

const T = {
    EMPTY: 0, GROUND: 1, PLATFORM: 2, PIPE_LEFT: 3, PIPE_RIGHT: 4,
    QUESTION_COIN: 5, BRICK: 6, PIPE_TOP: 7, FLAG_POLE: 8, FLAG_TOP: 9,
    BLOCKED_BLOCK: 10, HARD_BLOCK: 11,
};

// Build a 220-col x 15-row grid: sky rows 0-4, ground rows 5-14
function buildDefaultGrid() {
    const grid = [];
    for (let r = 0; r < LEVEL_HEIGHT_TILES; r++) {
        if (r >= 8) {
            grid.push(Array(LEVEL_WIDTH_TILES).fill(T.GROUND));
        } else {
            grid.push(Array(LEVEL_WIDTH_TILES).fill(T.EMPTY));
        }
    }
    return grid;
}

function applyLevelFeatures(grid) {
    // --- Ground gaps (row 8 only — surface pits) ---
    const gaps = [[10,13],[28,30],[63,67]];
    for (const [s, e] of gaps) {
        for (let c = s; c <= e; c++) grid[8][c] = T.EMPTY;
    }

    // --- Floating platforms (row 5 = 3 tiles above ground) ---
    for (let c = 10; c <= 13; c++) grid[5][c] = T.PLATFORM;
    for (let c = 28; c <= 30; c++) grid[5][c] = T.PLATFORM;
    for (let c = 63; c <= 67; c++) grid[5][c] = T.PLATFORM;

    // --- Brick wall cols 37-43 at row 7 (after gap 2) ---
    for (let c = 37; c <= 43; c++) grid[7][c] = T.BRICK;

    // --- Floating brick row at row 4 cols 49-52 ---
    for (let c = 49; c <= 52; c++) grid[4][c] = T.BRICK;

    // --- Question blocks ---
    grid[7][22] = T.QUESTION_COIN;   // above pipe 1 (mushroom)
    grid[7][43] = T.QUESTION_COIN;   // above brick wall end
    grid[4][55] = T.QUESTION_COIN;   // floating high near pipe 2
    grid[5][65] = T.QUESTION_COIN;   // on floating platform above gap 3
    grid[7][120] = T.QUESTION_COIN;  // at staircase base
    grid[3][155] = T.QUESTION_COIN;  // floating high above inverted stairs

    // --- Pipes ---
    // Pipe 1: col 22-23, height 3 (top at row 9)
    grid[9][22] = T.PIPE_TOP; grid[9][23] = T.PIPE_TOP;
    grid[10][22] = T.PIPE_LEFT; grid[10][23] = T.PIPE_RIGHT;
    grid[11][22] = T.PIPE_LEFT; grid[11][23] = T.PIPE_RIGHT;

    // Pipe 2: col 57-58, height 2 (top at row 10)
    grid[10][57] = T.PIPE_TOP; grid[10][58] = T.PIPE_TOP;
    grid[11][57] = T.PIPE_LEFT; grid[11][58] = T.PIPE_RIGHT;

    // --- Staircase cols 120-127, ascending (rows 8-5) ---
    for (let r = 8; r >= 5; r--) {
        const colStart = 120 + (8 - r);
        for (let c = colStart; c <= 127; c++) grid[r][c] = T.HARD_BLOCK;
    }

    // --- Inverted staircase cols 132-139, descending (rows 5-8) ---
    for (let r = 5; r <= 8; r++) {
        const colStart = 132 + (r - 5);
        for (let c = colStart; c <= 139; c++) grid[r][c] = T.HARD_BLOCK;
    }

    // --- Brick platform above staircase ---
    for (let c = 120; c <= 127; c++) grid[9][c] = T.BRICK;

    // --- Flag pole at col 195, rows 4-13 ---
    for (let r = 4; r <= 13; r++) {
        if (r === 4) grid[r][195] = T.FLAG_TOP;
        else grid[r][195] = T.FLAG_POLE;
    }

    // --- Castle decoration at col 186-192 rows 9-14 ---
    for (let r = 9; r <= 14; r++) {
        for (let c = 186; c <= 192; c++) grid[r][c] = T.HARD_BLOCK;
    }
}

const LEVEL_GRID = buildDefaultGrid();
applyLevelFeatures(LEVEL_GRID);

// Entity spawn positions (pixel coords) — ground surface is at row 8 = y=256
const GROUND_Y = 256;
const ENTITY_SPAWNS = [
    { type: 'goomba', x: 250,  y: GROUND_Y - 28 },   // col 8 (ground before gap 1)
    { type: 'goomba', x: 550,  y: GROUND_Y - 28 },   // col 17 (ground after gap 1)
    { type: 'goomba', x: 850,  y: GROUND_Y - 28 },   // col 27 (ground before gap 2)
    { type: 'goomba', x: 1200, y: GROUND_Y - 28 },   // col 38 (ground after brick wall)
    { type: 'goomba', x: 1500, y: GROUND_Y - 28 },   // col 47 (ground after floating platform)
    { type: 'goomba', x: 1850, y: GROUND_Y - 28 },   // col 58 (before pipe 2)
    { type: 'goomba', x: 2200, y: GROUND_Y - 28 },   // col 69 (after gap 3)
    { type: 'goomba', x: 2600, y: GROUND_Y - 28 },   // col 81 (mid-level ground)
    { type: 'goomba', x: 3000, y: GROUND_Y - 28 },   // col 94 (past mid)
    { type: 'goomba', x: 3400, y: GROUND_Y - 28 },   // col 106 (approaching stairs)
    { type: 'goomba', x: 4000, y: GROUND_Y - 28 },   // col 125 (after stairs)
    { type: 'goomba', x: 4600, y: GROUND_Y - 28 },   // col 144 (after inverted stairs)
];

const FLAG_POLE_DATA = { tileX: 195, tileY: 4 };
