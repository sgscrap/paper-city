import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NPCS } from '../src/data/npcs';
import { NPC_SCHEDULES } from '../src/data/npcSchedules';

const projectRoot = path.resolve(__dirname, '..');
const smokeScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'smoke-test.mjs'), 'utf8');
const screenEffects = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'layout', 'ScreenEffects.tsx'), 'utf8');

describe('smoke test marker sync', () => {
    it('markers reference real NPC ids from the game data', () => {
        const markerSection = smokeScript.match(/const NPC_SCHEDULE_MARKERS = \[([\s\S]*?)\];/)?.[1] ?? '';
        const markers = [...markerSection.matchAll(/'([^']+)'/g)].map((m) => m[1]);

        expect(markers.length).toBeGreaterThan(0);
        for (const marker of markers) {
            const isNpcId = Boolean(NPCS[marker]);
            const isVenue = Object.values(NPC_SCHEDULES).some((blocks) =>
                blocks.some((block) => block.location === marker)
            );
            expect(isNpcId || isVenue, `smoke marker '${marker}' matches no NPC or venue`).toBe(true);
        }
    });

    it('expected daypart dialogue text exists in the NPC data', () => {
        const mayor = NPCS['npc_mayor'];
        const morningLines = mayor?.daypartDialogue?.morning ?? [];
        expect(
            morningLines.some((line) => line.startsWith('Morning briefing. Everything is under control')),
            'smoke test expects the mayor morning greeting; update both files together'
        ).toBe(true);
    });

    it('UI marker strings exist in their components', () => {
        expect(fs.readFileSync(path.join(projectRoot, 'src', 'components', 'overlays', 'StreetEncounterOverlay.tsx'), 'utf8'))
            .toContain('STREET ENCOUNTER');
        expect(fs.readFileSync(path.join(projectRoot, 'src', 'components', 'overlays', 'NpcDialogue.tsx'), 'utf8'))
            .toContain('SERVICE USED TODAY');
        expect(fs.readFileSync(path.join(projectRoot, 'src', 'components', 'views', 'NPCList.tsx'), 'utf8'))
            .toContain('Where services are right now');
    });

    it('no legacy noise.png reference remains in ScreenEffects', () => {
        expect(screenEffects).not.toContain('noise.png');
    });

    it('social banner template exposes the __VERSION__ placeholder', () => {
        const banner = fs.readFileSync(path.join(projectRoot, 'docs', 'social-banner.html'), 'utf8');
        expect(banner).toContain('__VERSION__');
    });

    it('release pipeline renders the social preview before publishing', () => {
        const release = fs.readFileSync(path.join(projectRoot, 'scripts', 'release.mjs'), 'utf8');
        expect(release).toContain('scripts/social-preview.mjs');
    });
});
