import initSqlJs from 'sql.js/dist/sql-asm.js';

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function getSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

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

function getLastInsertRowId(db: any): number {
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const row = stmt.getAsObject() as Record<string, any>;
  stmt.free();
  return Number(row.id ?? 0);
}

function getChanges(db: any): number {
  const stmt = db.prepare('SELECT changes() as c');
  stmt.step();
  const row = stmt.getAsObject() as Record<string, any>;
  stmt.free();
  return Number(row.c ?? 0);
}

export async function openDatabaseAsync(_name: string): Promise<MockDatabase> {
  const SQL = await getSQL();
  const db = new SQL.Database();

  return {
    execAsync(source: string): Promise<void> {
      // sql.js exec can run multiple statements; it returns results for SELECTs
      // but we ignore them since execAsync's contract is Promise<void>
      db.exec(source);
      return Promise.resolve();
    },

    runAsync(
      source: string,
      ...params: any[]
    ): Promise<{ lastInsertRowId: number; changes: number }> {
      const normalized = normalizeParams(params);
      db.run(source, normalized);
      return Promise.resolve({
        lastInsertRowId: getLastInsertRowId(db),
        changes: getChanges(db),
      });
    },

    getFirstAsync<T>(source: string, ...params: any[]): Promise<T | null> {
      const normalized = normalizeParams(params);
      const stmt = db.prepare(source);
      stmt.bind(normalized);
      const hasRow = stmt.step();
      if (!hasRow) {
        stmt.free();
        return Promise.resolve(null);
      }
      const row = stmt.getAsObject() as T;
      stmt.free();
      return Promise.resolve(row);
    },

    getAllAsync<T>(source: string, ...params: any[]): Promise<T[]> {
      const normalized = normalizeParams(params);
      const stmt = db.prepare(source);
      stmt.bind(normalized);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      stmt.free();
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
