import { describe, it, expect } from 'vitest';
import { CareerSystem } from '../src/lib/CareerSystem';
import { NPCSystem } from '../src/lib/NPCSystem';
import { INITIAL_STATE } from '../src/types';

describe('CareerSystem', () => {
    it('should allow applying for a job if stats are met', () => {
        const stats = { ...INITIAL_STATE.player.stats, power: 100, charisma: 100 }; // Op stats
        const result = CareerSystem.canApply('street_hustler', stats);
        expect(result.allowed).toBe(true);
    });

    it('should block applying if stats are too low', () => {
        const stats = { ...INITIAL_STATE.player.stats, power: 0, aura: 0 };
        const result = CareerSystem.canApply('street_hustler', stats);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Power'); // OR Aura
    });

    it('should process a work shift correctly', () => {
        const stats = { ...INITIAL_STATE.player.stats, will: 50 };
        const result = CareerSystem.workShift('street_hustler', stats);

        expect(result.success).toBe(true);
        expect(result.rewards?.cash).toBe(150);
        expect(result.cost?.will).toBe(20);
    });

    it('should fail work shift if low will', () => {
        const stats = { ...INITIAL_STATE.player.stats, will: 10 };
        const result = CareerSystem.workShift('street_hustler', stats);
        expect(result.success).toBe(false);
    });
});

describe('NPCSystem', () => {
    it('should initialize new NPC state', () => {
        const state = NPCSystem.getOrInitState('npc_tommy', {});
        expect(state.relationship).toBe(0);
    });

    it('should handle interaction changes', () => {
        const result = NPCSystem.interact('gift');
        expect(result.relChange).toBe(10);
        expect(result.karmaChange).toBe(1);
    });
});
