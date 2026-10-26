import { describe, expect, it } from 'vitest';
import { InMemoryDisciplineRepository } from './testing/in-memory-discipline.repository';
import { CreateDiscipline } from './use-cases/create-discipline';
import { ListDisciplines } from './use-cases/list-disciplines';

function setup() {
  const disciplines = new InMemoryDisciplineRepository();
  return {
    createDiscipline: new CreateDiscipline(disciplines),
    listDisciplines: new ListDisciplines(disciplines),
  };
}

describe('disciplines (application layer)', () => {
  it('AS1: creates a discipline and finds it in the list', async () => {
    const { createDiscipline, listDisciplines } = setup();
    const created = await createDiscipline.execute({ name: 'Lutte', category: 'sports-de-combat' });

    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await listDisciplines.execute()).toEqual([created]);
  });

  it('AS2: rejects a discipline without a name', async () => {
    const { createDiscipline, listDisciplines } = setup();
    await expect(
      createDiscipline.execute({ name: ' ', category: 'athletisme' }),
    ).rejects.toMatchObject({ code: 'DISCIPLINE_NAME_REQUIRED' });
    expect(await listDisciplines.execute()).toEqual([]);
  });

  it('AS4: rejects a name already taken', async () => {
    const { createDiscipline } = setup();
    await createDiscipline.execute({ name: 'Lutte', category: 'sports-de-combat' });
    await expect(
      createDiscipline.execute({ name: 'Lutte', category: 'athletisme' }),
    ).rejects.toMatchObject({ code: 'DISCIPLINE_NAME_TAKEN', kind: 'CONFLICT' });
  });

  it('AS5: lists disciplines sorted by name', async () => {
    const { createDiscipline, listDisciplines } = setup();
    for (const name of ['Natation', 'Basketball 3x3', 'Lutte']) {
      await createDiscipline.execute({ name, category: 'athletisme' });
    }
    const names = (await listDisciplines.execute()).map((discipline) => discipline.name);
    expect(names).toEqual(['Basketball 3x3', 'Lutte', 'Natation']);
  });
});
