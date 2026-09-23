import { generateDailyContracts } from '../../src/data/contracts';

/**
 * The contract registry in src/data/contracts.ts is module-private (the
 * procedure treats raw pool size as a balance lever, not public API). Tests
 * observe it through the public generator: forcing every contract into a
 * daily pool by seeding many offsets and de-duplicating by id.
 */
export const CONTRACTS_TRIGGER_TARGETS: [string, string | undefined][] = (() => {
    const byId = new Map<string, { id: string; objective: { trigger: string; target?: string } }>();
    for (let day = 0; day < 500 && byId.size < 400; day++) {
        for (const offer of generateDailyContracts(day)) {
            byId.set(offer.id, { id: offer.id, objective: offer.objective });
        }
        if (byId.size >= 400) break;
    }
    return [...byId.values()].map((c) => [c.id, c.objective.target] as [string, string | undefined]);
})();
