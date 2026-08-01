import { getDatabase, resetDatabase } from './init';

jest.mock('expo-sqlite');

describe('database initialization', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('creates all tables on first open', async () => {
    const db = await getDatabase();
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    );
    const names = tables.map((t) => t.name);
    expect(names).toContain('movement_patterns');
    expect(names).toContain('exercises');
    expect(names).toContain('exercise_alternatives');
    expect(names).toContain('programs');
    expect(names).toContain('workout_templates');
    expect(names).toContain('template_exercises');
    expect(names).toContain('workout_sessions');
    expect(names).toContain('session_exercises');
    expect(names).toContain('set_logs');
    expect(names).toContain('schema_migrations');
  });

  it('seeds movement patterns on first open', async () => {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM movement_patterns'
    );
    expect(count?.count).toBeGreaterThan(0);
  });

  it('seeds exercises on first open', async () => {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );
    expect(count?.count).toBeGreaterThan(0);
  });

  it('drops old prototype tables if they exist', async () => {
    const db = await getDatabase();
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    );
    const names = tables.map((t) => t.name);
    expect(names).not.toContain('splits');
    expect(names).not.toContain('workout_exercises');
  });

  it('records schema version after init', async () => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_migrations WHERE id = 1'
    );
    expect(row?.version).toBe(1);
  });

  it('does not re-seed on subsequent opens', async () => {
    const db1 = await getDatabase();
    const count1 = await db1.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );

    resetDatabase();
    const db2 = await getDatabase();
    const count2 = await db2.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM exercises'
    );

    expect(count2?.count).toBe(count1?.count);
  });
});
