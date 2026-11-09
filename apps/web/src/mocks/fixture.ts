import type {
  Continent,
  DataSourceResponse,
  MedalGapResponse,
  MedalResponse,
  NationStandingResponse,
  SearchHitResponse,
  SportEventResponse,
  UndatedEventResponse,
} from '@joj/shared';

/**
 * Les données de la fausse API, en mémoire. Les handlers les lisent et les modifient comme la
 * vraie base ; `resetFixture()` (appelé après chaque test par `mockControl.reset()`) les remet
 * dans cet état, pour qu'un test ne dépende jamais de ce qu'un autre a créé ou supprimé.
 * Chaque ressource de l'API y ajoute sa liste, avec ses valeurs de départ.
 */
export const sprintFinal: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000001',
  sport: 'athletisme',
  name: '100 m hommes, finale',
  startsAt: '2026-11-08T18:32:00.000Z',
  hasStartTime: true,
  status: 'finished',
  ranking: [
    {
      rank: 1,
      nationCode: 'ng',
      nationName: 'Nigeria',
      competitor: 'Gift Bright',
      performance: '10,28 s',
      mention: null,
    },
    {
      rank: 2,
      nationCode: 'cn',
      nationName: 'Chine',
      competitor: 'Hangyu Zhang',
      performance: '10,31 s',
      mention: null,
    },
    {
      rank: null,
      nationCode: 'fr',
      nationName: 'France',
      competitor: 'Athlète Disqualifié',
      performance: null,
      mention: 'disqualified',
    },
    {
      rank: null,
      nationCode: 'br',
      nationName: 'Brésil',
      competitor: 'Athlète Abandon',
      performance: null,
      mention: 'did-not-finish',
    },
  ],
};

export const longJump: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000002',
  sport: 'athletisme',
  name: 'Saut en longueur femmes, finale',
  startsAt: '2026-11-08T19:00:00.000Z',
  hasStartTime: true,
  status: 'in-progress',
  ranking: [],
};

export const futsalSemiFinal: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000003',
  sport: 'futsal',
  name: 'Hommes, demi-finale',
  startsAt: '2026-11-08T20:30:00.000Z',
  hasStartTime: true,
  status: 'scheduled',
  ranking: [],
};

export interface FixtureParticipant {
  eventId: string;
  nationCode: string;
  competitor: string;
}

export const judoFinal: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000004',
  sport: 'judo',
  name: '-60 kg hommes, finale',
  startsAt: '2026-11-07T17:00:00.000Z',
  hasStartTime: true,
  status: 'scheduled',
  ranking: [],
};

const SWIMMING_ID = '0199f5c2-0000-7000-8000-000000000005';
const JUDO_LATER_ID = '0199f5c2-0000-7000-8000-000000000006';
const NATION_SPRINT_ID = '0199f5c2-0000-7000-8000-000000000007';
const NATION_ROAD_ID = '0199f5c2-0000-7000-8000-000000000008';
const NATION_FUTSAL_ID = '0199f5c2-0000-7000-8000-000000000009';

/** Le 9 novembre illustre le calendrier, le 10 novembre le suivi d'une nation. */
const followingDays: SportEventResponse[] = [
  {
    id: SWIMMING_ID,
    sport: 'natation',
    name: '100 m nage libre femmes, finale',
    startsAt: '2026-11-09T18:00:00.000Z',
    hasStartTime: true,
    status: 'scheduled',
    ranking: [],
  },
  {
    id: JUDO_LATER_ID,
    sport: 'judo',
    name: '+73 kg femmes, finale',
    startsAt: '2026-11-09T10:00:00.000Z',
    hasStartTime: true,
    status: 'scheduled',
    ranking: [],
  },
  {
    id: NATION_SPRINT_ID,
    sport: 'athletisme',
    name: '100 m hommes, finale',
    startsAt: '2026-11-10T09:00:00.000Z',
    hasStartTime: true,
    status: 'finished',
    ranking: [
      {
        rank: 1,
        nationCode: 'ng',
        nationName: 'Nigeria',
        competitor: 'Gift Bright',
        performance: '10,28 s',
        mention: null,
      },
      {
        rank: 2,
        nationCode: 'sn',
        nationName: 'Sénégal',
        competitor: 'Awa Diop',
        performance: '10,31 s',
        mention: null,
      },
    ],
  },
  {
    id: NATION_ROAD_ID,
    sport: 'cyclisme-sur-route',
    name: 'Course en ligne femmes',
    startsAt: '2026-11-10T10:00:00.000Z',
    hasStartTime: true,
    status: 'finished',
    ranking: [
      {
        rank: 1,
        nationCode: 'no',
        nationName: 'Norvège',
        competitor: 'Cycliste Norvège',
        performance: '2 h 10',
        mention: null,
      },
    ],
  },
  {
    id: NATION_FUTSAL_ID,
    sport: 'futsal',
    name: 'Hommes, finale',
    startsAt: '2026-11-10T20:30:00.000Z',
    hasStartTime: true,
    status: 'scheduled',
    ranking: [],
  },
];

/** Les participants du 10 novembre, y compris ceux d'une épreuve qui n'a pas encore de classement. */
const participants: FixtureParticipant[] = [
  { eventId: NATION_SPRINT_ID, nationCode: 'ng', competitor: 'Gift Bright' },
  { eventId: NATION_SPRINT_ID, nationCode: 'sn', competitor: 'Awa Diop' },
  { eventId: NATION_ROAD_ID, nationCode: 'no', competitor: 'Cycliste Norvège' },
  { eventId: NATION_FUTSAL_ID, nationCode: 'sn', competitor: 'Équipe du Sénégal' },
];

/** Une épreuve terminée plus ancienne, qui reste hors des trois derniers résultats. */
const olderFinal: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000010',
  sport: 'boxe',
  name: 'Ancienne finale',
  startsAt: '2026-11-06T10:00:00.000Z',
  hasStartTime: true,
  status: 'finished',
  ranking: [],
};

/** Les éléments que la recherche sait trouver, déjà calculés comme le classement. */
const searchHits: SearchHitResponse[] = [
  { kind: 'nation', label: 'Sénégal', date: null, sport: null, nation: 'sn' },
  { kind: 'sport', label: 'Natation', date: null, sport: 'natation', nation: null },
  {
    kind: 'event',
    label: '100 m hommes, finale',
    date: '2026-11-08',
    sport: 'athletisme',
    nation: null,
  },
  { kind: 'athlete', label: 'Gift Bright', date: '2026-11-08', sport: 'athletisme', nation: 'ng' },
];

/** Le classement est déjà calculé : c'est l'API qui en porte les règles, testées de son côté. */
const nationStandings: NationStandingResponse[] = [
  standing(1, 'cn', 'Chine', 'asie', [4, 0, 0]),
  standing(2, 'ke', 'Kenya', 'afrique', [3, 2, 0]),
  standing(3, 'sn', 'Sénégal', 'afrique', [3, 1, 2]),
  standing(4, 'ma', 'Maroc', 'afrique', [3, 1, 1]),
  standing(5, 'br', 'Brésil', 'ameriques', [1, 0, 0]),
  standing(6, 'tv', 'Tuvalu', 'oceanie', [0, 0, 0]),
];

function standing(
  rank: number,
  nationCode: string,
  nationName: string,
  continent: Continent,
  [gold, silver, bronze]: [number, number, number],
): NationStandingResponse {
  return {
    rank,
    nationCode,
    nationName,
    continent,
    gold,
    silver,
    bronze,
    total: gold + silver + bronze,
  };
}

const SPRINT_EVENT_ID = '0199f5c2-0000-7000-8000-000000000011';
const HANDBALL_EVENT_ID = '0199f5c2-0000-7000-8000-000000000012';

/** Triées comme l'API : par sport, puis par heure d'épreuve, puis par rang. */
const medals: MedalResponse[] = [
  {
    id: '0199f5c2-0000-7000-8000-000000000021',
    type: 'gold',
    sport: 'athletisme',
    eventId: SPRINT_EVENT_ID,
    eventName: '100 m hommes',
    competitor: 'Gift Bright',
    nationCode: 'ng',
    nationName: 'Nigeria',
  },
  {
    id: '0199f5c2-0000-7000-8000-000000000022',
    type: 'silver',
    sport: 'athletisme',
    eventId: SPRINT_EVENT_ID,
    eventName: '100 m hommes',
    competitor: 'Hangyu Zhang',
    nationCode: 'cn',
    nationName: 'Chine',
  },
  {
    id: '0199f5c2-0000-7000-8000-000000000023',
    type: 'bronze',
    sport: 'athletisme',
    eventId: SPRINT_EVENT_ID,
    eventName: '100 m hommes',
    competitor: 'Szymon Dolega',
    nationCode: 'pl',
    nationName: 'Pologne',
  },
  {
    id: '0199f5c2-0000-7000-8000-000000000024',
    type: 'gold',
    sport: 'beach-handball',
    eventId: HANDBALL_EVENT_ID,
    eventName: 'Femmes, finale',
    competitor: 'Équipe du Brésil',
    nationCode: 'br',
    nationName: 'Brésil',
  },
];

const initial = (): {
  sportEvents: SportEventResponse[];
  nationStandings: NationStandingResponse[];
  medals: MedalResponse[];
  participants: FixtureParticipant[];
  searchHits: SearchHitResponse[];
  dataSource: DataSourceResponse;
  medalGaps: MedalGapResponse[];
  undatedEvents: UndatedEventResponse[];
} => ({
  sportEvents: [
    { ...futsalSemiFinal },
    { ...longJump },
    { ...sprintFinal },
    { ...judoFinal },
    ...followingDays.map((event) => ({ ...event })),
    { ...olderFinal },
  ],
  searchHits: searchHits.map((hit) => ({ ...hit })),
  dataSource: {
    name: 'Wikipédia',
    license: 'CC BY-SA',
    url: 'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
    extractedOn: '2026-11-08',
  },
  medalGaps: [],
  undatedEvents: [],
  participants: participants.map((participant) => ({ ...participant })),
  nationStandings: nationStandings.map((line) => ({ ...line })),
  medals: medals.map((medal) => ({ ...medal })),
});

export const fixture = initial();

export function resetFixture(): void {
  Object.assign(fixture, initial());
}
