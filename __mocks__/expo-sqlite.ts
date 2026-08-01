const Database = require('better-sqlite3');

interface MockDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(source: string, ...params: any[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: any[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

function normalizeParams(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

function createMockDb(db: any): MockDatabase {
  return {
    execAsync(source: string): Promise<void> {
      return Promise.resolve(db.exec(source));
    },

    runAsync(
      source: string,
      ...params: any[]
    ): Promise<{ lastInsertRowId: number; changes: number }> {
      const normalized = normalizeParams(params);
      const stmt = db.prepare(source);
      const result = stmt.run(...normalized);
      return Promise.resolve({
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: result.changes,
      });
    },

    getFirstAsync<T>(source: string, ...params: any[]): Promise<T | null> {
      const normalized = normalizeParams(params);
      const stmt = db.prepare(source);
      const row = stmt.get(...normalized);
      return Promise.resolve(row ?? null);
    },

    getAllAsync<T>(source: string, ...params: any[]): Promise<T[]> {
      const normalized = normalizeParams(params);
      const stmt = db.prepare(source);
      const rows = stmt.all(...normalized);
      return Promise.resolve(rows);
    },

    async withTransactionAsync(task: () => Promise<void>): Promise<void> {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

export async function openDatabaseAsync(_name: string): Promise<MockDatabase> {
  const db = new Database(':memory:');
  return createMockDb(db);
}
