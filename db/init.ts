import * as SQLite from 'expo-sqlite';

const DB_NAME = 'progressive_overload.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await runMigrations(db);
    await seedData(db);
  }
  return db;
}

export function resetDatabase(): void {
  db = null;
}

// ─── Schema Migrations ───

type Migration = {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

async function getSchemaVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL DEFAULT 0
    )
  `);
  const row = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_migrations WHERE id = 1'
  );
  return row?.version ?? 0;
}

async function setSchemaVersion(database: SQLite.SQLiteDatabase, version: number): Promise<void> {
  await database.runAsync(
    `INSERT INTO schema_migrations (id, version) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET version = excluded.version`,
    version
  );
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Initial 3-layer schema',
    up: async (database) => {
      // Drop old incompatible tables from pre-v1 schema if they exist.
      // This is a breaking change; old workout history from the prototype
      // schema (splits, workouts with split_id, workout_exercises) is not
      // migrated because the data model changed fundamentally.
      await database.execAsync(`
        PRAGMA foreign_keys = OFF;

        DROP TABLE IF EXISTS splits;
        DROP TABLE IF EXISTS workout_exercises;
        DROP TABLE IF EXISTS workouts;
        DROP TABLE IF EXISTS set_logs;
        DROP TABLE IF EXISTS exercises;
        DROP TABLE IF EXISTS programs;

        PRAGMA foreign_keys = ON;
      `);

      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        -- Global Exercise Library

        CREATE TABLE IF NOT EXISTS movement_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          parent_id INTEGER,
          category TEXT NOT NULL,
          FOREIGN KEY (parent_id) REFERENCES movement_patterns(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          movement_pattern_id INTEGER NOT NULL,
          muscle_groups TEXT NOT NULL,
          equipment TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS exercise_alternatives (
          exercise_id INTEGER NOT NULL,
          alternative_exercise_id INTEGER NOT NULL,
          PRIMARY KEY (exercise_id, alternative_exercise_id),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
          FOREIGN KEY (alternative_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );

        -- Program Templates

        CREATE TABLE IF NOT EXISTS programs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workout_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          program_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          order_index INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS template_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_template_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          order_index INTEGER NOT NULL DEFAULT 0,
          target_sets INTEGER NOT NULL DEFAULT 3,
          target_reps_min INTEGER NOT NULL DEFAULT 8,
          target_reps_max INTEGER NOT NULL DEFAULT 12,
          FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );

        -- Workout Sessions

        CREATE TABLE IF NOT EXISTS workout_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_template_id INTEGER,
          program_id INTEGER,
          performed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          completed INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id) ON DELETE SET NULL,
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS session_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_session_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          order_index INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS set_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_exercise_id INTEGER NOT NULL,
          set_number INTEGER NOT NULL,
          target_weight REAL,
          target_reps INTEGER,
          performed_weight REAL,
          performed_reps INTEGER,
          rir INTEGER,
          completed INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE
        );
      `);
    },
  },
  {
    version: 2,
    name: 'Add user settings table',
    up: async (database) => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
    },
  },
  {
    version: 3,
    name: 'Add Programs tab fields',
    up: async (database) => {
      await database.execAsync(`
        ALTER TABLE workout_templates ADD COLUMN description TEXT;
        ALTER TABLE workout_templates ADD COLUMN workout_type TEXT;
        ALTER TABLE template_exercises ADD COLUMN rest TEXT;
        ALTER TABLE template_exercises ADD COLUMN notes TEXT;
      `);
    },
  },
];

async function runMigrations(database: SQLite.SQLiteDatabase) {
  const currentVersion = await getSchemaVersion(database);

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      await migration.up(database);
      await setSchemaVersion(database, migration.version);
    }
  }
}

// ─── Seed Data ───

async function seedData(database: SQLite.SQLiteDatabase) {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM movement_patterns'
  );
  if (existing && existing.count > 0) {
    return;
  }

  // Seed movement patterns
  const push = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Push',
    null,
    'Push'
  );
  const pull = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Pull',
    null,
    'Pull'
  );
  const legs = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Legs',
    null,
    'Legs'
  );
  const core = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Core',
    null,
    'Core'
  );

  const horizontalPush = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Horizontal Push',
    push.lastInsertRowId,
    'Push'
  );
  const verticalPush = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Vertical Push',
    push.lastInsertRowId,
    'Push'
  );
  const horizontalPull = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Horizontal Pull',
    pull.lastInsertRowId,
    'Pull'
  );
  const verticalPull = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Vertical Pull',
    pull.lastInsertRowId,
    'Pull'
  );
  const squat = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Squat',
    legs.lastInsertRowId,
    'Legs'
  );
  const hinge = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Hinge',
    legs.lastInsertRowId,
    'Legs'
  );
  const kneeFlexion = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Knee Flexion',
    legs.lastInsertRowId,
    'Legs'
  );
  const calf = await database.runAsync(
    'INSERT INTO movement_patterns (name, parent_id, category) VALUES (?, ?, ?)',
    'Calf',
    legs.lastInsertRowId,
    'Legs'
  );

  // Seed exercises
  const exercises: Array<{
    name: string;
    patternId: number;
    muscleGroups: string;
    equipment: string;
    difficulty: string;
  }> = [
    {
      name: 'Bench Press',
      patternId: horizontalPush.lastInsertRowId,
      muscleGroups: 'Chest, Triceps, Front Delts',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
    },
    {
      name: 'Machine Chest Press',
      patternId: horizontalPush.lastInsertRowId,
      muscleGroups: 'Chest, Triceps, Front Delts',
      equipment: 'Machine',
      difficulty: 'Beginner',
    },
    {
      name: 'Dumbbell Bench Press',
      patternId: horizontalPush.lastInsertRowId,
      muscleGroups: 'Chest, Triceps, Front Delts',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
    },
    {
      name: 'Weighted Push-up',
      patternId: horizontalPush.lastInsertRowId,
      muscleGroups: 'Chest, Triceps, Front Delts',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
    },
    {
      name: 'Overhead Press',
      patternId: verticalPush.lastInsertRowId,
      muscleGroups: 'Shoulders, Triceps',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
    },
    {
      name: 'Machine Shoulder Press',
      patternId: verticalPush.lastInsertRowId,
      muscleGroups: 'Shoulders, Triceps',
      equipment: 'Machine',
      difficulty: 'Beginner',
    },
    {
      name: 'Barbell Row',
      patternId: horizontalPull.lastInsertRowId,
      muscleGroups: 'Lats, Rhomboids, Rear Delts, Biceps',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
    },
    {
      name: 'Pull-up',
      patternId: verticalPull.lastInsertRowId,
      muscleGroups: 'Lats, Biceps, Rear Delts',
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
    },
    {
      name: 'Lat Pulldown',
      patternId: verticalPull.lastInsertRowId,
      muscleGroups: 'Lats, Biceps, Rear Delts',
      equipment: 'Machine',
      difficulty: 'Beginner',
    },
    {
      name: 'Leg Press',
      patternId: squat.lastInsertRowId,
      muscleGroups: 'Quads, Glutes, Hamstrings',
      equipment: 'Machine',
      difficulty: 'Beginner',
    },
    {
      name: 'Hack Squat',
      patternId: squat.lastInsertRowId,
      muscleGroups: 'Quads, Glutes, Hamstrings',
      equipment: 'Machine',
      difficulty: 'Intermediate',
    },
    {
      name: 'Romanian Deadlift',
      patternId: hinge.lastInsertRowId,
      muscleGroups: 'Hamstrings, Glutes, Lower Back',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
    },
    {
      name: 'Hip Thrust',
      patternId: hinge.lastInsertRowId,
      muscleGroups: 'Glutes, Hamstrings',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
    },
    {
      name: 'Leg Curl',
      patternId: kneeFlexion.lastInsertRowId,
      muscleGroups: 'Hamstrings',
      equipment: 'Machine',
      difficulty: 'Beginner',
    },
    {
      name: 'Standing Calf Raise',
      patternId: calf.lastInsertRowId,
      muscleGroups: 'Calves',
      equipment: 'Machine',
      difficulty: 'Beginner',
    },
    {
      name: 'Crunch',
      patternId: core.lastInsertRowId,
      muscleGroups: 'Abs',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
    },
    {
      name: 'Plank',
      patternId: core.lastInsertRowId,
      muscleGroups: 'Abs, Core',
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
    },
  ];

  for (const ex of exercises) {
    await database.runAsync(
      'INSERT INTO exercises (name, movement_pattern_id, muscle_groups, equipment, difficulty) VALUES (?, ?, ?, ?, ?)',
      ex.name,
      ex.patternId,
      ex.muscleGroups,
      ex.equipment,
      ex.difficulty
    );
  }
}
