import { ClubEvent, FactionId } from '@/types';

export const CLUB_EVENTS: ClubEvent[] = [
    {
        id: 'club_civic_watch',
        title: 'Coalition Watch',
        description: 'Aria asks you to keep a vulnerable guest safe while the room gets rowdy.',
        faction: 'angel',
        minReputation: 2,
        maxHeat: 6,
        minFactionTrust: { angel: 1 },
        energyCost: 8,
        cashCost: 0,
        timeCost: 30,
        rewards: { reputation: 2, heat: -1, factionTrust: { angel: 2 }, xp: 15 }
    },
    {
        id: 'club_afterhours_signal',
        title: 'Afterhours Signal',
        description: 'Echo opens a private channel once your name has earned a little credibility.',
        faction: 'ghost',
        minReputation: 2,
        minHeat: 2,
        minFactionTrust: { ghost: 1 },
        energyCost: 8,
        cashCost: 15,
        timeCost: 35,
        rewards: { reputation: 2, heat: 1, factionTrust: { ghost: 2 }, cash: 45, xp: 20 }
    },
    {
        id: 'club_backroom_test',
        title: 'The Backroom Test',
        description: 'Kane gives you a chance to settle a dispute before it spills onto the dance floor.',
        faction: 'demon',
        minReputation: 2,
        minHeat: 5,
        minFactionTrust: { demon: 1 },
        energyCost: 12,
        cashCost: 25,
        timeCost: 45,
        rewards: { reputation: 3, heat: 3, factionTrust: { demon: 2 }, cash: 70, xp: 25 }
    },
    {
        id: 'club_lockdown',
        title: 'Nightlife Lockdown',
        description: 'Your heat has drawn attention. Survive a coordinated sweep and keep your contacts clear.',
        faction: 'demon',
        minReputation: 5,
        minHeat: 8,
        energyCost: 16,
        cashCost: 40,
        timeCost: 60,
        rewards: { reputation: 4, heat: 5, factionTrust: { demon: 3 }, cash: 120, xp: 40 }
    }
];

export const isClubEventAvailable = (
    event: ClubEvent,
    club: { reputation: number; heat: number; factionTrust: Record<FactionId, number> }
): boolean => {
    if (event.minReputation !== undefined && club.reputation < event.minReputation) return false;
    if (event.minHeat !== undefined && club.heat < event.minHeat) return false;
    if (event.maxHeat !== undefined && club.heat > event.maxHeat) return false;
    return Object.entries(event.minFactionTrust || {}).every(([faction, required]) =>
        (club.factionTrust[faction as FactionId] || 0) >= (required || 0)
    );
};
