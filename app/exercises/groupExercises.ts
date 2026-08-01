import type { ExerciseWithPattern } from '../../db/library';

export type GroupedExercises = Record<string, Record<string, ExerciseWithPattern[]>>;

export function groupExercisesByCategory(exercises: ExerciseWithPattern[]): GroupedExercises {
  const groups: GroupedExercises = {};
  for (const ex of exercises) {
    if (!groups[ex.category]) {
      groups[ex.category] = {};
    }
    if (!groups[ex.category][ex.movementPatternName]) {
      groups[ex.category][ex.movementPatternName] = [];
    }
    groups[ex.category][ex.movementPatternName].push(ex);
  }
  return groups;
}
