import { SQLiteDatabase } from 'expo-sqlite';
import { MovementPattern, Exercise } from '../types';

// Movement Patterns

export async function createMovementPattern(
  db: SQLiteDatabase,
  name: string,
  category: string,
  parentId: number | null = null
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO movement_patterns (name, category, parent_id) VALUES (?, ?, ?)',
    name,
    category,
    parentId
  );
  return result.lastInsertRowId;
}

export async function getMovementPatterns(db: SQLiteDatabase): Promise<MovementPattern[]> {
  return db.getAllAsync<MovementPattern>(
    'SELECT id, name, parent_id AS parentId, category FROM movement_patterns ORDER BY id'
  );
}

export async function getMovementPatternById(
  db: SQLiteDatabase,
  id: number
): Promise<MovementPattern | null> {
  return db.getFirstAsync<MovementPattern>(
    'SELECT id, name, parent_id AS parentId, category FROM movement_patterns WHERE id = ?',
    id
  );
}

export async function updateMovementPattern(
  db: SQLiteDatabase,
  id: number,
  name: string,
  category: string,
  parentId: number | null
): Promise<void> {
  await db.runAsync(
    'UPDATE movement_patterns SET name = ?, category = ?, parent_id = ? WHERE id = ?',
    name,
    category,
    parentId,
    id
  );
}

export async function deleteMovementPattern(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM movement_patterns WHERE id = ?', id);
}

// Exercises

export async function createExercise(
  db: SQLiteDatabase,
  name: string,
  movementPatternId: number,
  muscleGroups: string,
  equipment: string,
  difficulty: string
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO exercises (name, movement_pattern_id, muscle_groups, equipment, difficulty) VALUES (?, ?, ?, ?, ?)',
    name,
    movementPatternId,
    muscleGroups,
    equipment,
    difficulty
  );
  return result.lastInsertRowId;
}

export async function getExercises(db: SQLiteDatabase): Promise<Exercise[]> {
  return db.getAllAsync<Exercise>(
    'SELECT id, name, movement_pattern_id AS movementPatternId, muscle_groups AS muscleGroups, equipment, difficulty FROM exercises ORDER BY name'
  );
}

export async function getExerciseById(db: SQLiteDatabase, id: number): Promise<Exercise | null> {
  return db.getFirstAsync<Exercise>(
    'SELECT id, name, movement_pattern_id AS movementPatternId, muscle_groups AS muscleGroups, equipment, difficulty FROM exercises WHERE id = ?',
    id
  );
}

export async function getExercisesByMovementPattern(
  db: SQLiteDatabase,
  movementPatternId: number
): Promise<Exercise[]> {
  return db.getAllAsync<Exercise>(
    'SELECT id, name, movement_pattern_id AS movementPatternId, muscle_groups AS muscleGroups, equipment, difficulty FROM exercises WHERE movement_pattern_id = ? ORDER BY name',
    movementPatternId
  );
}

export async function updateExercise(
  db: SQLiteDatabase,
  id: number,
  name: string,
  movementPatternId: number,
  muscleGroups: string,
  equipment: string,
  difficulty: string
): Promise<void> {
  await db.runAsync(
    'UPDATE exercises SET name = ?, movement_pattern_id = ?, muscle_groups = ?, equipment = ?, difficulty = ? WHERE id = ?',
    name,
    movementPatternId,
    muscleGroups,
    equipment,
    difficulty,
    id
  );
}

export async function deleteExercise(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM exercises WHERE id = ?', id);
}

export interface ExerciseWithPattern extends Exercise {
  movementPatternName: string;
  patternParentId: number | null;
  category: string;
}

export async function getExercisesWithMovementPattern(
  db: SQLiteDatabase
): Promise<ExerciseWithPattern[]> {
  return db.getAllAsync<ExerciseWithPattern>(
    `SELECT e.id, e.name, e.movement_pattern_id AS movementPatternId,
            e.muscle_groups AS muscleGroups, e.equipment, e.difficulty,
            mp.name AS movementPatternName, mp.parent_id AS patternParentId,
            mp.category
     FROM exercises e
     JOIN movement_patterns mp ON e.movement_pattern_id = mp.id
     ORDER BY mp.category, mp.name, e.name`
  );
}

// Exercise Alternatives

export async function createExerciseAlternative(
  db: SQLiteDatabase,
  exerciseId: number,
  alternativeExerciseId: number
): Promise<void> {
  await db.runAsync(
    'INSERT INTO exercise_alternatives (exercise_id, alternative_exercise_id) VALUES (?, ?)',
    exerciseId,
    alternativeExerciseId
  );
}

export async function getExerciseAlternatives(
  db: SQLiteDatabase,
  exerciseId: number
): Promise<Exercise[]> {
  return db.getAllAsync<Exercise>(
    `SELECT e.id, e.name, e.movement_pattern_id AS movementPatternId, e.muscle_groups AS muscleGroups, e.equipment, e.difficulty
     FROM exercises e
     INNER JOIN exercise_alternatives ea ON ea.alternative_exercise_id = e.id
     WHERE ea.exercise_id = ?`,
    exerciseId
  );
}

export async function deleteExerciseAlternative(
  db: SQLiteDatabase,
  exerciseId: number,
  alternativeExerciseId: number
): Promise<void> {
  await db.runAsync(
    'DELETE FROM exercise_alternatives WHERE exercise_id = ? AND alternative_exercise_id = ?',
    exerciseId,
    alternativeExerciseId
  );
}

export async function getExerciseAlternativesWithPattern(
  db: SQLiteDatabase,
  exerciseId: number
): Promise<ExerciseWithPattern[]> {
  return db.getAllAsync<ExerciseWithPattern>(
    `SELECT e.id, e.name, e.movement_pattern_id AS movementPatternId,
            e.muscle_groups AS muscleGroups, e.equipment, e.difficulty,
            mp.name AS movementPatternName, mp.parent_id AS patternParentId,
            mp.category
     FROM exercises e
     JOIN exercise_alternatives ea ON ea.alternative_exercise_id = e.id
     JOIN movement_patterns mp ON e.movement_pattern_id = mp.id
     WHERE ea.exercise_id = ?`,
    exerciseId
  );
}
