import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getDatabase, resetDatabase } from '../db/init';
import * as templates from '../db/templates';
import * as library from '../db/library';
import { useProgram } from './useProgram';

jest.mock('expo-sqlite');

describe('useProgram', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('loads a program with no workouts', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Upper / Lower Split');

    const { result } = await renderHook(() => useProgram(programId));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.program).toMatchObject({ name: 'Upper / Lower Split' });
    expect(result.current.workouts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads workouts in order with derived exercise counts', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Push Pull Legs');
    const patternId = await library.createMovementPattern(db, 'Push', 'Push');
    const exerciseId = await library.createExercise(
      db,
      'Test Bench Press',
      patternId,
      'Chest',
      'Barbell',
      'Intermediate'
    );

    const pushId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
    const pullId = await templates.createWorkoutTemplate(db, programId, 'Pull Day', 1);
    await templates.createTemplateExercise(db, pushId, exerciseId, 0);
    await templates.createTemplateExercise(db, pushId, exerciseId, 1);

    const { result } = await renderHook(() => useProgram(programId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.workouts).toHaveLength(2);
    expect(result.current.workouts[0]).toMatchObject({
      id: pushId,
      name: 'Push Day',
      exerciseCount: 2,
    });
    expect(result.current.workouts[1]).toMatchObject({
      id: pullId,
      name: 'Pull Day',
      exerciseCount: 0,
    });
  });

  it('reorders workouts and reflects the new order after reload', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Full Body');
    const aId = await templates.createWorkoutTemplate(db, programId, 'A', 0);
    const bId = await templates.createWorkoutTemplate(db, programId, 'B', 1);
    const cId = await templates.createWorkoutTemplate(db, programId, 'C', 2);

    const { result } = await renderHook(() => useProgram(programId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reorderWorkouts([cId, aId, bId]);
    });
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.workouts.map((w) => w.id)).toEqual([cId, aId, bId]);
  });

  it('resolves with a null program (not an error) when the program does not exist', async () => {
    const { result } = await renderHook(() => useProgram(999));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.program).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('adds a workout appended to the end of the order', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Full Body');
    await templates.createWorkoutTemplate(db, programId, 'A', 0);

    const { result } = await renderHook(() => useProgram(programId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let newId: number = -1;
    await act(async () => {
      newId = await result.current.addWorkout('Push Day', 'Chest and triceps');
    });
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.workouts).toHaveLength(2);
    expect(result.current.workouts[1]).toMatchObject({
      id: newId,
      name: 'Push Day',
      description: 'Chest and triceps',
      orderIndex: 1,
    });
  });

  it('appends using the live DB count, not stale in-memory workouts state', async () => {
    // The add-workout screen mounts a fresh useProgram(id) and lets the user
    // submit immediately -- it does not wait for the initial load to finish.
    // addWorkout must therefore read the current count from the DB rather
    // than the hook's in-memory `workouts` state, which can still be [] at
    // that point. Simulate that by adding a workout directly through the db
    // layer (bypassing the hook's state) between mount and the addWorkout
    // call, then confirming addWorkout still accounts for it correctly.
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Full Body');
    await templates.createWorkoutTemplate(db, programId, 'A', 0);

    const { result } = await renderHook(() => useProgram(programId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workouts).toHaveLength(1);

    // A workout created out-of-band (e.g. by a concurrent screen) that this
    // hook instance's `workouts` state does not know about.
    await templates.createWorkoutTemplate(db, programId, 'B', 1);

    let newId: number = -1;
    await act(async () => {
      newId = await result.current.addWorkout('Push Day');
    });

    const created = await templates.getWorkoutTemplateById(db, newId);
    expect(created?.orderIndex).toBe(2);
  });

  it('edits a workout in place', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Full Body');
    const workoutId = await templates.createWorkoutTemplate(db, programId, 'A', 0);

    const { result } = await renderHook(() => useProgram(programId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editWorkout(workoutId, 'Pull Day', 0, 'Back and biceps');
    });
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.workouts[0]).toMatchObject({
      id: workoutId,
      name: 'Pull Day',
      description: 'Back and biceps',
    });
  });

  it('removes a workout', async () => {
    const db = await getDatabase();
    const programId = await templates.createProgram(db, 'Full Body');
    const workoutId = await templates.createWorkoutTemplate(db, programId, 'A', 0);

    const { result } = await renderHook(() => useProgram(programId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeWorkout(workoutId);
    });
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.workouts).toEqual([]);
  });
});
