import { DAKAR_TIME_ZONE } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { formatEventTime, localTimeZone } from './event-time';

describe('formatEventTime', () => {
  it('003-AS3: gives the time of an event in Dakar and in Paris', () => {
    const startsAt = '2026-11-08T20:30:00.000Z';

    expect(formatEventTime(startsAt, DAKAR_TIME_ZONE)).toBe('20h30');
    expect(formatEventTime(startsAt, 'Europe/Paris')).toBe('21h30');
  });

  it('003-AS3: reads the time zone of the device', () => {
    expect(localTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});
