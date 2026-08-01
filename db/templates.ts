import { SQLiteDatabase } from 'expo-sqlite';
import { Program, WorkoutTemplate, TemplateExercise } from '../types';

// Programs

export async function createProgram(
  db: SQLiteDatabase,
  name: string,
  description?: string
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO programs (name, description) VALUES (?, ?)',
    name,
    description ?? null
  );
  return result.lastInsertRowId;
}

export async function getPrograms(db: SQLiteDatabase): Promise<Program[]> {
  return db.getAllAsync<Program>(
    'SELECT id, name, description, created_at AS createdAt FROM programs ORDER BY created_at DESC'
  );
}

export async function getProgramById(db: SQLiteDatabase, id: number): Promise<Program | null> {
  return db.getFirstAsync<Program>(
    'SELECT id, name, description, created_at AS createdAt FROM programs WHERE id = ?',
    id
  );
}

export async function updateProgram(
  db: SQLiteDatabase,
  id: number,
  name: string,
  description?: string
): Promise<void> {
  await db.runAsync(
    'UPDATE programs SET name = ?, description = ? WHERE id = ?',
    name,
    description ?? null,
    id
  );
}

export async function deleteProgram(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM programs WHERE id = ?', id);
}

// Workout Templates

export async function createWorkoutTemplate(
  db: SQLiteDatabase,
  programId: number,
  name: string,
  orderIndex: number = 0
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO workout_templates (program_id, name, order_index) VALUES (?, ?, ?)',
    programId,
    name,
    orderIndex
  );
  return result.lastInsertRowId;
}

export async function getWorkoutTemplates(
  db: SQLiteDatabase,
  programId: number
): Promise<WorkoutTemplate[]> {
  return db.getAllAsync<WorkoutTemplate>(
    'SELECT id, program_id AS programId, name, order_index AS orderIndex FROM workout_templates WHERE program_id = ? ORDER BY order_index',
    programId
  );
}

export async function getWorkoutTemplateById(
  db: SQLiteDatabase,
  id: number
): Promise<WorkoutTemplate | null> {
  return db.getFirstAsync<WorkoutTemplate>(
    'SELECT id, program_id AS programId, name, order_index AS orderIndex FROM workout_templates WHERE id = ?',
    id
  );
}

export async function updateWorkoutTemplate(
  db: SQLiteDatabase,
  id: number,
  name: string,
  orderIndex: number
): Promise<void> {
  await db.runAsync(
    'UPDATE workout_templates SET name = ?, order_index = ? WHERE id = ?',
    name,
    orderIndex,
    id
  );
}

export async function deleteWorkoutTemplate(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM workout_templates WHERE id = ?', id);
}

// Template Exercises

export async function createTemplateExercise(
  db: SQLiteDatabase,
  workoutTemplateId: number,
  exerciseId: number,
  orderIndex: number = 0,
  targetSets: number = 3,
  targetRepsMin: number = 8,
  targetRepsMax: number = 12
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO template_exercises (workout_template_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max) VALUES (?, ?, ?, ?, ?, ?)',
    workoutTemplateId,
    exerciseId,
    orderIndex,
    targetSets,
    targetRepsMin,
    targetRepsMax
  );
  return result.lastInsertRowId;
}

export async function getTemplateExercises(
  db: SQLiteDatabase,
  workoutTemplateId: number
): Promise<TemplateExercise[]> {
  return db.getAllAsync<TemplateExercise>(
    'SELECT id, workout_template_id AS workoutTemplateId, exercise_id AS exerciseId, order_index AS orderIndex, target_sets AS targetSets, target_reps_min AS targetRepsMin, target_reps_max AS targetRepsMax FROM template_exercises WHERE workout_template_id = ? ORDER BY order_index',
    workoutTemplateId
  );
}

export async function getTemplateExerciseById(
  db: SQLiteDatabase,
  id: number
): Promise<TemplateExercise | null> {
  return db.getFirstAsync<TemplateExercise>(
    'SELECT id, workout_template_id AS workoutTemplateId, exercise_id AS exerciseId, order_index AS orderIndex, target_sets AS targetSets, target_reps_min AS targetRepsMin, target_reps_max AS targetRepsMax FROM template_exercises WHERE id = ?',
    id
  );
}

export async function updateTemplateExercise(
  db: SQLiteDatabase,
  id: number,
  orderIndex: number,
  targetSets: number,
  targetRepsMin: number,
  targetRepsMax: number
): Promise<void> {
  await db.runAsync(
    'UPDATE template_exercises SET order_index = ?, target_sets = ?, target_reps_min = ?, target_reps_max = ? WHERE id = ?',
    orderIndex,
    targetSets,
    targetRepsMin,
    targetRepsMax,
    id
  );
}

export async function deleteTemplateExercise(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM template_exercises WHERE id = ?', id);
}
