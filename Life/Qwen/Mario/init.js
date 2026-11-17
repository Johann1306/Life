// ============================================================
// Bootstrap — create objects, wire together, start loop
// ============================================================

(function() {
    // 1. Build TileMap
    const tileMap = new TileMap(LEVEL_GRID);

    // 2. Create Mario at spawn position (col 2, row 11)
    const mario = new Mario(64, 352);

    // 3. Save original Goomba positions for reset
    ENTITY_SPAWNS.forEach((s, i) => { s._origX = s.x; });
    const goombas = ENTITY_SPAWNS.map(s => {
        const g = new Goomba(s.x, s.y);
        g._origX = s.x;
        return g;
    });

    // 4. Create flagpole
    const flagPole = new FlagPole(FLAG_POLE_DATA.tileX, FLAG_POLE_DATA.tileY);

    // 5. Initialize game loop
    const canvas = document.getElementById('gameCanvas');
    const game = new GameLoop(canvas);
    game.init(tileMap, mario, goombas, flagPole);

    // 6. Start!
    game.start();
})();
