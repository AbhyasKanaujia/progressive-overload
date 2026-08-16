import { SQLiteDatabase } from 'expo-sqlite';
import { Program, WorkoutTemplate, TemplateExercise, WorkoutType } from '../types';

async function reorderRows(
  db: SQLiteDatabase,
  table: 'workout_templates' | 'template_exercises',
  parentColumn: 'program_id' | 'workout_template_id',
  parentId: number,
  orderedIds: number[]
): Promise<void> {
  const existing = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM ${table} WHERE ${parentColumn} = ?`,
    parentId
  );
  const existingIds = new Set(existing.map((row) => row.id));
  const providedIds = new Set(orderedIds);
  if (
    existingIds.size !== providedIds.size ||
    [...existingIds].some((id) => !providedIds.has(id))
  ) {
    throw new Error(`reorder must include every ${table} row for ${parentColumn} ${parentId}`);
  }

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync(
        `UPDATE ${table} SET order_index = ? WHERE id = ? AND ${parentColumn} = ?`,
        i,
        orderedIds[i],
        parentId
      );
    }
  });
}

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

export interface ProgramCounts {
  programId: number;
  workoutCount: number;
  exerciseCount: number;
}

export async function getProgramCounts(db: SQLiteDatabase): Promise<ProgramCounts[]> {
  return db.getAllAsync<ProgramCounts>(
    `SELECT p.id AS programId,
            COUNT(DISTINCT wt.id) AS workoutCount,
            COUNT(te.id) AS exerciseCount
     FROM programs p
     LEFT JOIN workout_templates wt ON wt.program_id = p.id
     LEFT JOIN template_exercises te ON te.workout_template_id = wt.id
     GROUP BY p.id`
  );
}

// Workout Templates

export async function createWorkoutTemplate(
  db: SQLiteDatabase,
  programId: number,
  name: string,
  orderIndex: number = 0,
  description?: string,
  workoutType?: WorkoutType
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO workout_templates (program_id, name, order_index, description, workout_type) VALUES (?, ?, ?, ?, ?)',
    programId,
    name,
    orderIndex,
    description ?? null,
    workoutType ?? null
  );
  return result.lastInsertRowId;
}

export async function getWorkoutTemplates(
  db: SQLiteDatabase,
  programId: number
): Promise<WorkoutTemplate[]> {
  return db.getAllAsync<WorkoutTemplate>(
    'SELECT id, program_id AS programId, name, order_index AS orderIndex, description, workout_type AS workoutType FROM workout_templates WHERE program_id = ? ORDER BY order_index',
    programId
  );
}

export async function getWorkoutTemplateById(
  db: SQLiteDatabase,
  id: number
): Promise<WorkoutTemplate | null> {
  return db.getFirstAsync<WorkoutTemplate>(
    'SELECT id, program_id AS programId, name, order_index AS orderIndex, description, workout_type AS workoutType FROM workout_templates WHERE id = ?',
    id
  );
}

export async function updateWorkoutTemplate(
  db: SQLiteDatabase,
  id: number,
  name: string,
  orderIndex: number,
  description?: string,
  workoutType?: WorkoutType
): Promise<void> {
  await db.runAsync(
    'UPDATE workout_templates SET name = ?, order_index = ?, description = ?, workout_type = ? WHERE id = ?',
    name,
    orderIndex,
    description ?? null,
    workoutType ?? null,
    id
  );
}

export async function deleteWorkoutTemplate(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM workout_templates WHERE id = ?', id);
}

export async function reorderWorkoutTemplates(
  db: SQLiteDatabase,
  programId: number,
  orderedIds: number[]
): Promise<void> {
  await reorderRows(db, 'workout_templates', 'program_id', programId, orderedIds);
}

export interface WorkoutTemplateCounts {
  workoutTemplateId: number;
  exerciseCount: number;
}

export async function getWorkoutTemplateCounts(
  db: SQLiteDatabase,
  programId: number
): Promise<WorkoutTemplateCounts[]> {
  return db.getAllAsync<WorkoutTemplateCounts>(
    `SELECT wt.id AS workoutTemplateId,
            COUNT(te.id) AS exerciseCount
     FROM workout_templates wt
     LEFT JOIN template_exercises te ON te.workout_template_id = wt.id
     WHERE wt.program_id = ?
     GROUP BY wt.id`,
    programId
  );
}

// Template Exercises

export async function createTemplateExercise(
  db: SQLiteDatabase,
  workoutTemplateId: number,
  exerciseId: number,
  orderIndex: number = 0,
  targetSets: number = 3,
  targetRepsMin: number = 8,
  targetRepsMax: number = 12,
  rest?: string,
  notes?: string
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO template_exercises (workout_template_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, rest, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    workoutTemplateId,
    exerciseId,
    orderIndex,
    targetSets,
    targetRepsMin,
    targetRepsMax,
    rest ?? null,
    notes ?? null
  );
  return result.lastInsertRowId;
}

export async function getTemplateExercises(
  db: SQLiteDatabase,
  workoutTemplateId: number
): Promise<TemplateExercise[]> {
  return db.getAllAsync<TemplateExercise>(
    'SELECT id, workout_template_id AS workoutTemplateId, exercise_id AS exerciseId, order_index AS orderIndex, target_sets AS targetSets, target_reps_min AS targetRepsMin, target_reps_max AS targetRepsMax, rest, notes FROM template_exercises WHERE workout_template_id = ? ORDER BY order_index',
    workoutTemplateId
  );
}

export async function getTemplateExerciseById(
  db: SQLiteDatabase,
  id: number
): Promise<TemplateExercise | null> {
  return db.getFirstAsync<TemplateExercise>(
    'SELECT id, workout_template_id AS workoutTemplateId, exercise_id AS exerciseId, order_index AS orderIndex, target_sets AS targetSets, target_reps_min AS targetRepsMin, target_reps_max AS targetRepsMax, rest, notes FROM template_exercises WHERE id = ?',
    id
  );
}

export async function updateTemplateExercise(
  db: SQLiteDatabase,
  id: number,
  orderIndex: number,
  targetSets: number,
  targetRepsMin: number,
  targetRepsMax: number,
  rest?: string,
  notes?: string
): Promise<void> {
  await db.runAsync(
    'UPDATE template_exercises SET order_index = ?, target_sets = ?, target_reps_min = ?, target_reps_max = ?, rest = ?, notes = ? WHERE id = ?',
    orderIndex,
    targetSets,
    targetRepsMin,
    targetRepsMax,
    rest ?? null,
    notes ?? null,
    id
  );
}

export async function deleteTemplateExercise(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM template_exercises WHERE id = ?', id);
}

export async function reorderTemplateExercises(
  db: SQLiteDatabase,
  workoutTemplateId: number,
  orderedIds: number[]
): Promise<void> {
  await reorderRows(db, 'template_exercises', 'workout_template_id', workoutTemplateId, orderedIds);
}

export interface TemplateExerciseWithDetails extends TemplateExercise {
  exerciseName: string;
  equipment: string;
}

export async function getTemplateExercisesWithDetails(
  db: SQLiteDatabase,
  workoutTemplateId: number
): Promise<TemplateExerciseWithDetails[]> {
  return db.getAllAsync<TemplateExerciseWithDetails>(
    `SELECT te.id, te.workout_template_id AS workoutTemplateId, te.exercise_id AS exerciseId,
            te.order_index AS orderIndex, te.target_sets AS targetSets,
            te.target_reps_min AS targetRepsMin, te.target_reps_max AS targetRepsMax,
            te.rest, te.notes,
            e.name AS exerciseName, e.equipment
     FROM template_exercises te
     JOIN exercises e ON te.exercise_id = e.id
     WHERE te.workout_template_id = ?
     ORDER BY te.order_index`,
    workoutTemplateId
  );
}
