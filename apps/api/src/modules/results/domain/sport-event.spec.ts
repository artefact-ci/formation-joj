import type { SportEventStatus } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { type RankingEntry, SportEvent } from './sport-event';

function entry(overrides: Partial<RankingEntry> & Pick<RankingEntry, 'competitor'>): RankingEntry {
  return {
    rank: null,
    nationCode: 'ke',
    nationName: 'Kenya',
    performance: null,
    mention: null,
    ...overrides,
  };
}

function sportEvent(status: SportEventStatus, entries: RankingEntry[]): SportEvent {
  return SportEvent.restore({
    id: '6f1f3c1e-8f0a-4f3b-9a55-0d1d7a1c2b10',
    sport: 'athletisme',
    name: '100 m hommes, finale',
    startsAt: new Date('2026-11-08T18:32:00.000Z'),
    hasStartTime: true,
    status,
    awardsMedals: true,
    entries,
  });
}

const gold = entry({ competitor: 'Gift Bright', rank: 1, performance: '10,28 s' });
const silver = entry({
  competitor: 'Hangyu Zhang',
  rank: 2,
  performance: '10,31 s',
  nationCode: 'cn',
  nationName: 'Chine',
});
const disqualified = entry({ competitor: 'Athlète DQ', mention: 'disqualified' });
const didNotFinish = entry({ competitor: 'Athlète DNF', mention: 'did-not-finish' });

describe('SportEvent', () => {
  it('001-AS3: a finished event lists its competitors from first to last', () => {
    const event = sportEvent('finished', [silver, gold]);

    expect(event.ranking).toEqual([gold, silver]);
  });

  it.each<SportEventStatus>(['scheduled', 'in-progress'])(
    '001-AS4: a %s event has no ranking, even when entries exist',
    (status) => {
      const event = sportEvent(status, [gold, silver]);

      expect(event.ranking).toEqual([]);
    },
  );

  it('001-AS5: competitors with a mention have no rank and come after the ranked ones', () => {
    const event = sportEvent('finished', [disqualified, silver, didNotFinish, gold]);

    expect(event.ranking).toEqual([gold, silver, disqualified, didNotFinish]);
    expect(event.ranking.slice(2).map(({ rank, performance }) => ({ rank, performance }))).toEqual([
      { rank: null, performance: null },
      { rank: null, performance: null },
    ]);
  });

  it('003-AS5: says whether a nation takes part, even without a rank yet', () => {
    const event = sportEvent('scheduled', [entry({ competitor: 'Awa Diop', nationCode: 'sn' })]);

    expect(event.hasParticipantFrom('sn')).toBe(true);
    expect(event.hasParticipantFrom('ke')).toBe(false);
  });

  it('003-AS6: gives the athletes of a nation with their event, time and status', () => {
    const event = sportEvent('scheduled', [
      entry({ competitor: 'Awa Diop', nationCode: 'sn' }),
      entry({ competitor: 'Gift Bright', nationCode: 'ke' }),
    ]);

    expect(event.athletesOf('sn')).toEqual([
      {
        competitor: 'Awa Diop',
        eventId: event.id,
        eventName: '100 m hommes, finale',
        sport: 'athletisme',
        startsAt: new Date('2026-11-08T18:32:00.000Z'),
        hasStartTime: true,
        status: 'scheduled',
      },
    ]);
  });

  it('003-AS6: leaves a participant without result out of the ranking of a finished event', () => {
    const event = sportEvent('finished', [gold, entry({ competitor: 'Sans résultat' })]);

    expect(event.ranking).toEqual([gold]);
  });
});
