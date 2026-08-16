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
});
