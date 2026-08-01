import { SQLiteDatabase } from 'expo-sqlite';
import { WorkoutSession, SessionExercise, SetLog } from '../types';

// Workout Sessions

export async function createWorkoutSession(
  db: SQLiteDatabase,
  params: {
    workoutTemplateId?: number | null;
    programId?: number | null;
    performedAt?: string;
    notes?: string;
    completed?: boolean;
  }
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO workout_sessions
     (workout_template_id, program_id, performed_at, notes, completed)
     VALUES (?, ?, COALESCE(?, datetime('now')), ?, ?)`,
    params.workoutTemplateId ?? null,
    params.programId ?? null,
    params.performedAt ?? null,
    params.notes ?? null,
    (params.completed ?? false) ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function getWorkoutSessions(db: SQLiteDatabase): Promise<WorkoutSession[]> {
  return db.getAllAsync<WorkoutSession>(
    'SELECT id, workout_template_id AS workoutTemplateId, program_id AS programId, performed_at AS performedAt, notes, completed FROM workout_sessions ORDER BY performed_at DESC'
  );
}

export async function getWorkoutSessionById(
  db: SQLiteDatabase,
  id: number
): Promise<WorkoutSession | null> {
  return db.getFirstAsync<WorkoutSession>(
    'SELECT id, workout_template_id AS workoutTemplateId, program_id AS programId, performed_at AS performedAt, notes, completed FROM workout_sessions WHERE id = ?',
    id
  );
}

export async function updateWorkoutSession(
  db: SQLiteDatabase,
  id: number,
  params: {
    workoutTemplateId?: number | null;
    programId?: number | null;
    performedAt?: string;
    notes?: string;
    completed?: boolean;
  }
): Promise<void> {
  await db.runAsync(
    `UPDATE workout_sessions
     SET workout_template_id = ?, program_id = ?, performed_at = COALESCE(?, performed_at), notes = ?, completed = ?
     WHERE id = ?`,
    params.workoutTemplateId ?? null,
    params.programId ?? null,
    params.performedAt ?? null,
    params.notes ?? null,
    (params.completed ?? false) ? 1 : 0,
    id
  );
}

export async function deleteWorkoutSession(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', id);
}

// Session Exercises

export async function createSessionExercise(
  db: SQLiteDatabase,
  workoutSessionId: number,
  exerciseId: number,
  orderIndex: number = 0
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO session_exercises (workout_session_id, exercise_id, order_index) VALUES (?, ?, ?)',
    workoutSessionId,
    exerciseId,
    orderIndex
  );
  return result.lastInsertRowId;
}

export async function getSessionExercises(
  db: SQLiteDatabase,
  workoutSessionId: number
): Promise<SessionExercise[]> {
  return db.getAllAsync<SessionExercise>(
    'SELECT id, workout_session_id AS workoutSessionId, exercise_id AS exerciseId, order_index AS orderIndex FROM session_exercises WHERE workout_session_id = ? ORDER BY order_index',
    workoutSessionId
  );
}

export async function getSessionExerciseById(
  db: SQLiteDatabase,
  id: number
): Promise<SessionExercise | null> {
  return db.getFirstAsync<SessionExercise>(
    'SELECT id, workout_session_id AS workoutSessionId, exercise_id AS exerciseId, order_index AS orderIndex FROM session_exercises WHERE id = ?',
    id
  );
}

export async function updateSessionExercise(
  db: SQLiteDatabase,
  id: number,
  orderIndex: number
): Promise<void> {
  await db.runAsync('UPDATE session_exercises SET order_index = ? WHERE id = ?', orderIndex, id);
}

export async function deleteSessionExercise(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM session_exercises WHERE id = ?', id);
}

// Set Logs

export async function createSetLog(
  db: SQLiteDatabase,
  params: {
    sessionExerciseId: number;
    setNumber: number;
    targetWeight?: number | null;
    targetReps?: number | null;
    performedWeight?: number | null;
    performedReps?: number | null;
    rir?: number | null;
    completed?: boolean;
  }
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO set_logs
     (session_exercise_id, set_number, target_weight, target_reps, performed_weight, performed_reps, rir, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params.sessionExerciseId,
    params.setNumber,
    params.targetWeight ?? null,
    params.targetReps ?? null,
    params.performedWeight ?? null,
    params.performedReps ?? null,
    params.rir ?? null,
    (params.completed ?? false) ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function getSetLogs(db: SQLiteDatabase, sessionExerciseId: number): Promise<SetLog[]> {
  return db.getAllAsync<SetLog>(
    'SELECT id, session_exercise_id AS sessionExerciseId, set_number AS setNumber, target_weight AS targetWeight, target_reps AS targetReps, performed_weight AS performedWeight, performed_reps AS performedReps, rir, completed, created_at AS createdAt FROM set_logs WHERE session_exercise_id = ? ORDER BY set_number',
    sessionExerciseId
  );
}

export async function getSetLogById(db: SQLiteDatabase, id: number): Promise<SetLog | null> {
  return db.getFirstAsync<SetLog>(
    'SELECT id, session_exercise_id AS sessionExerciseId, set_number AS setNumber, target_weight AS targetWeight, target_reps AS targetReps, performed_weight AS performedWeight, performed_reps AS performedReps, rir, completed, created_at AS createdAt FROM set_logs WHERE id = ?',
    id
  );
}

export async function updateSetLog(
  db: SQLiteDatabase,
  id: number,
  params: {
    setNumber?: number;
    targetWeight?: number | null;
    targetReps?: number | null;
    performedWeight?: number | null;
    performedReps?: number | null;
    rir?: number | null;
    completed?: boolean;
  }
): Promise<void> {
  const existing = await getSetLogById(db, id);
  if (!existing) {
    throw new Error(`SetLog ${id} not found`);
  }
  await db.runAsync(
    `UPDATE set_logs
     SET set_number = ?, target_weight = ?, target_reps = ?, performed_weight = ?, performed_reps = ?, rir = ?, completed = ?
     WHERE id = ?`,
    params.setNumber ?? existing.setNumber,
    params.targetWeight ?? existing.targetWeight,
    params.targetReps ?? existing.targetReps,
    params.performedWeight ?? existing.performedWeight,
    params.performedReps ?? existing.performedReps,
    params.rir ?? existing.rir,
    (params.completed ?? existing.completed) ? 1 : 0,
    id
  );
}

export async function deleteSetLog(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM set_logs WHERE id = ?', id);
}
