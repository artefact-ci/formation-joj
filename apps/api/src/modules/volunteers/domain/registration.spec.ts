import { describe, expect, it } from 'vitest';
import { Registration } from './registration';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const register = (name: string, email: string) =>
  Registration.create({
    id: '0199f5c2-0000-7000-8000-000000000101',
    slotId: '0199f5c2-0000-7000-8000-000000000010',
    name,
    email,
    now: NOW,
  });

describe('Registration', () => {
  it('001-AS4: registers a volunteer with a trimmed name and email', () => {
    expect(register('  Awa Diop ', ' awa@joj.sn ')).toMatchObject({
      name: 'Awa Diop',
      email: 'awa@joj.sn',
      registeredAt: NOW,
    });
  });

  it.each(['', '   '])('001-AS8: rejects a volunteer without a name (%j)', (name) => {
    expect(() => register(name, 'awa@joj.sn')).toThrow(
      expect.objectContaining({ code: 'VOLUNTEER_NAME_REQUIRED', kind: 'VALIDATION' }),
    );
  });

  it.each(['', 'awa', 'awa@', '@joj.sn', 'awa joj@sn'])(
    '001-AS8: rejects a malformed email (%j)',
    (email) => {
      expect(() => register('Awa', email)).toThrow(
        expect.objectContaining({ code: 'VOLUNTEER_EMAIL_INVALID', kind: 'VALIDATION' }),
      );
    },
  );
});
