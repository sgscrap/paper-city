import { describe, it, expect } from 'vitest';
import { StatEngine } from '../src/lib/StatEngine';

describe('StatEngine', () => {
    it('should clamp stats at 100 max', () => {
        expect(StatEngine.calculateChange(95, 10)).toBe(100);
    });

    it('should clamp stats at 0 min', () => {
        expect(StatEngine.calculateChange(5, -10)).toBe(0);
    });

    it('should add stats normally within bounds', () => {
        expect(StatEngine.calculateChange(50, 10)).toBe(60);
    });

    it('should identify capped stats', () => {
        expect(StatEngine.isCapped(100)).toBe(true);
        expect(StatEngine.isCapped(99)).toBe(false);
    });
});
