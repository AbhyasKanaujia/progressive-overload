import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getDatabase, resetDatabase } from '../db/init';
import * as templates from '../db/templates';
import * as library from '../db/library';
import { useWorkout } from './useWorkout';

jest.mock('expo-sqlite');

describe('useWorkout', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('loads a workout with no exercises', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Push Pull Legs');
    const workoutId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);

    const { result } = await renderHook(() => useWorkout(workoutId));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workout).toMatchObject({ id: workoutId, name: 'Push Day' });
    expect(result.current.program).toMatchObject({ id: programId, name: 'Push Pull Legs' });
    expect(result.current.exercises).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads exercises in order with exercise-library details', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Push Pull Legs');
    const workoutId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
    const patternId = await library.createMovementPattern(db, 'Push', 'Push');
    const benchId = await library.createExercise(
      db,
      'Test Bench Press',
      patternId,
      'Chest',
      'Barbell',
      'Intermediate'
    );
    const flyId = await library.createExercise(
      db,
      'Test Cable Fly',
      patternId,
      'Chest',
      'Cable',
      'Beginner'
    );

    await templates.createTemplateExercise(db, workoutId, benchId, 0, 3, 8, 12, '2-3 min');
    await templates.createTemplateExercise(db, workoutId, flyId, 1, 3, 10, 15);

    const { result } = await renderHook(() => useWorkout(workoutId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.exercises).toHaveLength(2);
    expect(result.current.exercises[0]).toMatchObject({
      exerciseId: benchId,
      exerciseName: 'Test Bench Press',
      equipment: 'Barbell',
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      rest: '2-3 min',
    });
    expect(result.current.exercises[1]).toMatchObject({
      exerciseId: flyId,
      exerciseName: 'Test Cable Fly',
      notes: null,
    });
  });

  it('reorders exercises and reflects the new order after reload', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Push Pull Legs');
    const workoutId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
    const patternId = await library.createMovementPattern(db, 'Push', 'Push');
    const exerciseId = await library.createExercise(
      db,
      'Test Bench Press',
      patternId,
      'Chest',
      'Barbell',
      'Intermediate'
    );

    const aId = await templates.createTemplateExercise(db, workoutId, exerciseId, 0);
    const bId = await templates.createTemplateExercise(db, workoutId, exerciseId, 1);
    const cId = await templates.createTemplateExercise(db, workoutId, exerciseId, 2);

    const { result } = await renderHook(() => useWorkout(workoutId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reorderExercises([cId, aId, bId]);
    });
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.exercises.map((e) => e.id)).toEqual([cId, aId, bId]);
  });

  it('resolves with a null workout (not an error) when the workout does not exist', async () => {
    const { result } = await renderHook(() => useWorkout(999));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workout).toBeNull();
    expect(result.current.program).toBeNull();
    expect(result.current.exercises).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
