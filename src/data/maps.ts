export interface Point {
    x: number;
    y: number;
}

export interface BuildingRect {
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
    type: 'building' | 'exit' | 'decoration';
    action?: string; // e.g. 'open_shop', 'open_jobs', 'exit_north'
    target?: string; // For exits
}

export interface MapDef {
    id: string;
    width: number;
    height: number;
    spawn: Point;
    buildings: BuildingRect[];
}

export const MAP_DEFINITIONS: Record<string, MapDef> = {
    'the_block': {
        id: 'the_block',
        width: 800,
        height: 600,
        spawn: { x: 400, y: 300 },
        buildings: [
            { x: 50, y: 50, w: 120, h: 100, label: 'SG FITNESS', type: 'building', action: 'open_gym' },
            { x: 50, y: 200, w: 150, h: 120, label: 'TRADING FLOOR', type: 'building', action: 'open_trading' },
            { x: 600, y: 100, w: 140, h: 140, label: 'MORGAN UNIVERSITY', type: 'building', action: 'open_university' },
            { x: 280, y: 390, w: 190, h: 110, label: 'JOB BOARD', type: 'building', action: 'open_jobs' },
            { x: 570, y: 300, w: 150, h: 80, label: 'YOUR HOME', type: 'building', action: 'open_home' },

            { x: 550, y: 400, w: 180, h: 120, label: 'TOWSON TOWN CENTER', type: 'building', action: 'travel', target: 'towson_mall' },

            // TEST ENEMY
            { x: 100, y: 400, w: 60, h: 60, label: '800 PROJECTS', type: 'building', action: 'fight', target: 'mugger' },

            // Exits
            { x: 350, y: 0, w: 100, h: 20, label: 'TO DT B-MORE', type: 'exit', action: 'travel', target: 'dt_bmore' },
            { x: 350, y: 580, w: 100, h: 20, label: 'TO SLUMS', type: 'exit', action: 'travel', target: 'underground_markets' },
            { x: 660, y: 460, w: 120, h: 24, label: 'TO FOUNDRY ROW', type: 'exit', action: 'travel', target: 'foundry_row' }
        ]
    },
    'underground_markets': {
        id: 'underground_markets',
        width: 800,
        height: 600,
        spawn: { x: 50, y: 300 },
        buildings: [
            { x: 300, y: 200, w: 200, h: 200, label: 'BLACK MARKET', type: 'building', action: 'open_shop_illegal' },
            { x: 550, y: 100, w: 150, h: 120, label: 'SAFEHOUSE', type: 'building', action: 'open_safehouse' },
            { x: 0, y: 300, w: 20, h: 100, label: 'EXIT', type: 'exit', action: 'travel', target: 'the_block' }
        ]
    },
    'dt_bmore': {
        id: 'dt_bmore',
        width: 800,
        height: 600,
        spawn: { x: 400, y: 500 },
        buildings: [
            { x: 100, y: 100, w: 200, h: 150, label: 'HORSESHOE BALTIMORE', type: 'building', action: 'open_casino' },
            { x: 500, y: 100, w: 200, h: 150, label: 'CLUB LUST', type: 'building', action: 'open_club' },
            { x: 300, y: 350, w: 210, h: 120, label: 'CITY HALL', type: 'building', action: 'open_leaderboard' },
            { x: 550, y: 350, w: 190, h: 120, label: 'THE EXCHANGE', type: 'building', action: 'open_economy' },
            { x: 50, y: 350, w: 180, h: 120, label: 'DEEDS OFFICE', type: 'building', action: 'open_deeds_office' },
            { x: 350, y: 580, w: 100, h: 20, label: 'TO THE BLOCK', type: 'exit', action: 'travel', target: 'the_block' }
        ]
    },
    'towson_mall': {
        id: 'towson_mall',
        width: 800,
        height: 600,
        spawn: { x: 400, y: 500 },
        buildings: [
            // Anchor Stores
            { x: 50, y: 50, w: 200, h: 150, label: 'RUNWAY FASHION', type: 'building', action: 'open_shop_clothing' },
            { x: 550, y: 50, w: 200, h: 150, label: 'TECH HAVEN', type: 'building', action: 'open_shop_electronics' },

            // Small Stores
            { x: 50, y: 250, w: 100, h: 100, label: 'GAME STOPPED', type: 'building', action: 'open_arcade' },
            { x: 650, y: 250, w: 100, h: 100, label: 'GNC', type: 'building', action: 'open_shop_gym' },

            // Food Court (Central/Back)
            { x: 300, y: 50, w: 200, h: 100, label: 'FOOD COURT', type: 'building', action: 'open_shop_food' },

            // Decorations
            { x: 350, y: 250, w: 100, h: 100, label: 'FOUNTAIN', type: 'decoration' },

            // Exits
            { x: 350, y: 580, w: 100, h: 20, label: 'EXIT TO BLOCK', type: 'exit', action: 'travel', target: 'the_block' }
        ]
    },
    'foundry_row': {
        id: 'foundry_row',
        width: 800,
        height: 600,
        spawn: { x: 400, y: 452 },
        buildings: [
            // Interactive workshops
            { x: 40, y: 40, w: 180, h: 130, label: 'FOUNDRY PRESS', type: 'building', action: 'open_foundry_press' },
            { x: 280, y: 40, w: 200, h: 140, label: 'SCRAP & SORT', type: 'building', action: 'open_foundry_scrap' },
            { x: 600, y: 40, w: 150, h: 130, label: 'BLOCK 8', type: 'building', action: 'fight', target: 'foundry_skulk' },
            { x: 40, y: 260, w: 160, h: 120, label: 'ALL-FACTIONS COUNTER', type: 'building', action: 'open_economy' },
            { x: 600, y: 260, w: 150, h: 120, label: 'COUNCIL HALL', type: 'building', action: 'open_foundry_council' },
            // Decorations
            { x: 280, y: 240, w: 120, h: 80, label: 'SLAB STACK', type: 'decoration' },
            { x: 430, y: 240, w: 120, h: 80, label: 'FLASHING SIGN', type: 'decoration' },
            // Exits (bidirectional: the_block already exits here)
            { x: 350, y: 0, w: 100, h: 20, label: 'TO THE BLOCK', type: 'exit', action: 'travel', target: 'the_block' },
            { x: 350, y: 580, w: 100, h: 20, label: 'TO TRANSIT', type: 'exit', action: 'travel', target: 'transit_hub' }
        ]
    }
};
