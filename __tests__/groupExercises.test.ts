import { groupExercisesByCategory } from '../app/exercises/groupExercises';
import type { ExerciseWithPattern } from '../db/library';

function makeExercise(overrides: Partial<ExerciseWithPattern>): ExerciseWithPattern {
  return {
    id: 1,
    name: 'Bench Press',
    movementPatternId: 1,
    muscleGroups: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    movementPatternName: 'Horizontal Push',
    patternParentId: null,
    category: 'Push',
    ...overrides,
  };
}

describe('groupExercisesByCategory', () => {
  it('groups exercises by category and movement pattern', () => {
    const exercises: ExerciseWithPattern[] = [
      makeExercise({
        id: 1,
        name: 'Bench Press',
        category: 'Push',
        movementPatternName: 'Horizontal Push',
      }),
      makeExercise({
        id: 2,
        name: 'Overhead Press',
        category: 'Push',
        movementPatternName: 'Vertical Push',
      }),
      makeExercise({
        id: 3,
        name: 'Pull-up',
        category: 'Pull',
        movementPatternName: 'Vertical Pull',
      }),
    ];

    const grouped = groupExercisesByCategory(exercises);

    expect(Object.keys(grouped)).toEqual(['Push', 'Pull']);
    expect(grouped.Push['Horizontal Push']).toHaveLength(1);
    expect(grouped.Push['Horizontal Push'][0].name).toBe('Bench Press');
    expect(grouped.Push['Vertical Push']).toHaveLength(1);
    expect(grouped.Push['Vertical Push'][0].name).toBe('Overhead Press');
    expect(grouped.Pull['Vertical Pull']).toHaveLength(1);
    expect(grouped.Pull['Vertical Pull'][0].name).toBe('Pull-up');
  });

  it('returns empty object for empty input', () => {
    expect(groupExercisesByCategory([])).toEqual({});
  });

  it('places multiple exercises in the same group', () => {
    const exercises: ExerciseWithPattern[] = [
      makeExercise({
        id: 1,
        name: 'Bench Press',
        category: 'Push',
        movementPatternName: 'Horizontal Push',
      }),
      makeExercise({
        id: 2,
        name: 'DB Press',
        category: 'Push',
        movementPatternName: 'Horizontal Push',
      }),
    ];

    const grouped = groupExercisesByCategory(exercises);

    expect(grouped.Push['Horizontal Push']).toHaveLength(2);
    expect(grouped.Push['Horizontal Push'][0].name).toBe('Bench Press');
    expect(grouped.Push['Horizontal Push'][1].name).toBe('DB Press');
  });
});
