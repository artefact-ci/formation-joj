import { normalizeSearchText } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { findSearchHits, type SearchCatalog } from './search-hit';

const catalog: SearchCatalog = {
  nations: [
    { code: 'sn', name: 'Sénégal' },
    { code: 'ke', name: 'Kenya' },
  ],
  events: [
    {
      sport: 'athletisme',
      name: '100 m hommes, finale',
      startsAt: new Date('2026-11-08T18:32:00.000Z'),
      participants: [
        { competitor: 'Gift Bright', nationCode: 'ke' },
        { competitor: 'Équipe du Sénégal', nationCode: 'sn' },
      ],
    },
  ],
};

describe('findSearchHits', () => {
  it('004-AS4: finds a nation, without accents or capitals', () => {
    expect(findSearchHits('SENEGAL', catalog)[0]).toEqual({
      kind: 'nation',
      label: 'Sénégal',
      date: null,
      sport: null,
      nation: 'sn',
    });
  });

  it('004-AS4: finds a sport by its French name', () => {
    expect(findSearchHits('natation', catalog)).toEqual([
      { kind: 'sport', label: 'Natation', date: null, sport: 'natation', nation: null },
    ]);
  });

  it('004-AS4: finds an event, with its day and its sport', () => {
    expect(findSearchHits('100 m', catalog)).toEqual([
      {
        kind: 'event',
        label: '100 m hommes, finale',
        date: '2026-11-08',
        sport: 'athletisme',
        nation: null,
      },
    ]);
  });

  it('004-AS4: finds an athlete, with the day, the sport and the nation', () => {
    expect(findSearchHits('bright', catalog)).toEqual([
      {
        kind: 'athlete',
        label: 'Gift Bright',
        date: '2026-11-08',
        sport: 'athletisme',
        nation: 'ke',
      },
    ]);
  });

  it('004-AS4: gives the nations first, then the sports, the events and the athletes', () => {
    expect(findSearchHits('senegal', catalog).map((hit) => hit.kind)).toEqual([
      'nation',
      'athlete',
    ]);
  });

  it('004-AS4: finds nothing for an unknown text', () => {
    expect(findSearchHits('zzz', catalog)).toEqual([]);
  });

  it('004-AS4: removes accents and capitals from a text', () => {
    expect(normalizeSearchText('  Équipe du SÉNÉGAL ')).toBe('equipe du senegal');
  });

  it('005-AS3: finds an event and an athlete without a known day', () => {
    const hits = findSearchHits('boxeur', {
      nations: [],
      events: [
        {
          sport: 'boxe',
          name: '-51 kg hommes',
          startsAt: null,
          participants: [{ competitor: 'Boxeur', nationCode: 'kz' }],
        },
      ],
    });

    expect(hits).toEqual([
      { kind: 'athlete', label: 'Boxeur', date: null, sport: 'boxe', nation: 'kz' },
    ]);
  });
});
