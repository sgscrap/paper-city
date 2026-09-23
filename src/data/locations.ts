import { Location } from '@/types';

export const LOCATIONS: Record<string, Location & { neighbors: { north?: string, south?: string, east?: string, west?: string } }> = {
    the_block: {
        id: 'the_block',
        name: 'The Block',
        description: 'Your starting zone. Gritty, familiar, and relatively safe.',
        connectedTo: ['corporate_towers', 'underground_markets', 'transit_hub'],
        neighbors: {
            north: 'corporate_towers',
            south: 'underground_markets',
            east: 'transit_hub'
        },
        actions: ['gym_train', 'studio_work', 'bar_socialize', 'library_study', 'apartment_sleep', 'market_shop']
    },
    corporate_towers: {
        id: 'corporate_towers',
        name: 'Corporate Towers',
        description: 'Glass spires piercing the smog. The upper city where wealth is god.',
        connectedTo: ['the_block', 'political_offices', 'transit_hub'],
        neighbors: {
            south: 'the_block',
            east: 'political_offices',
            west: 'transit_hub'
        },
        actions: ['tech_work', 'ad_agency_work', 'bank_invest', 'penthouse_visit']
    },
    underground_markets: {
        id: 'underground_markets',
        name: 'Underground Markets',
        description: 'The lower city shadows. Illegal deals and fight clubs.',
        connectedTo: ['the_block', 'shadow_hq'],
        neighbors: {
            north: 'the_block'
        },
        actions: ['black_market_shop', 'fight_club_enter', 'hideout_visit']
    },
    political_offices: {
        id: 'political_offices',
        name: 'Civic Center',
        description: 'The seat of power. Coalition HQ and City Hall.',
        connectedTo: ['corporate_towers'],
        neighbors: {
            west: 'corporate_towers'
        },
        actions: ['coalition_visit', 'city_hall_visit', 'police_station_check', 'court_visit']
    },
    transit_hub: {
        id: 'transit_hub',
        name: 'Transit Hub',
        description: 'Gateway to other sectors and expansion zones.',
        connectedTo: ['the_block', 'corporate_towers'],
        neighbors: {
            west: 'the_block',
            north: 'corporate_towers'
        },
        actions: ['train_travel', 'portal_enter']
    },
    towson_mall: {
        id: 'towson_mall',
        name: 'Towson Town Center',
        description: 'A massive shopping complex. The heart of consumerism.',
        connectedTo: ['the_block'],
        neighbors: {
            south: 'the_block'
        },
        actions: ['shop_clothing', 'shop_electronics', 'arcade_play', 'gym_shopping']
    },
    foundry_row: {
        id: 'foundry_row',
        name: 'Foundry Row',
        description: 'Decommissioned printworks turned neutral workshops. Every faction bids for the same machines.',
        connectedTo: ['the_block', 'transit_hub'],
        neighbors: {
            north: 'the_block',
            south: 'transit_hub'
        },
        actions: ['open_foundry_press', 'open_foundry_scrap', 'open_foundry_council']
    },
    the_waterfront: {
        id: 'the_waterfront',
        name: 'The Waterfront',
        description: 'Container cranes and customs seals. Everything the city consumes arrives here, and everything it hides leaves the same way.',
        connectedTo: ['the_block'],
        neighbors: {
            north: 'the_block'
        },
        actions: ['open_dock_manifests', 'open_dock_sort', 'open_customs_house']
    }
};
