import { describe, it, expect } from 'vitest';
import { KarmaSystem } from '../src/lib/KarmaSystem';

describe('KarmaSystem', () => {
    it('should clamp karma at +100', () => {
        expect(KarmaSystem.update(90, 20)).toBe(100);
    });

    it('should clamp karma at -100', () => {
        expect(KarmaSystem.update(-90, -20)).toBe(-100);
    });

    it('should return correct alignment', () => {
        expect(KarmaSystem.getAlignment(60)).toBe('angel');
        expect(KarmaSystem.getAlignment(0)).toBe('ghost');
        expect(KarmaSystem.getAlignment(-60)).toBe('demon');
    });

    it('should return correct color hex', () => {
        expect(KarmaSystem.getColor(60)).toBe('#00f0ff');
    });
});
