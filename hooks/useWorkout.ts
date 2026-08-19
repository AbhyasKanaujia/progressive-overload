import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '../db/init';
import {
  getProgramById,
  getWorkoutTemplateById,
  getTemplateExercisesWithDetails,
  reorderTemplateExercises,
  TemplateExerciseWithDetails,
} from '../db/templates';
import { Program, WorkoutTemplate } from '../types';

export function useWorkout(workoutId: number) {
  const [program, setProgram] = useState<Program | null>(null);
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);
  const [exercises, setExercises] = useState<TemplateExerciseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const doFetch = useCallback(async () => {
    const db = await getDatabase();
    const w = await getWorkoutTemplateById(db, workoutId);
    if (!w) {
      return { program: null, workout: null, exercises: [] };
    }
    const [p, exerciseList] = await Promise.all([
      getProgramById(db, w.programId),
      getTemplateExercisesWithDetails(db, workoutId),
    ]);
    return { program: p, workout: w, exercises: exerciseList };
  }, [workoutId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { program: p, workout: w, exercises: e } = await doFetch();
      setProgram(p);
      setWorkout(w);
      setExercises(e);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [doFetch]);

  const reload = useCallback(async () => {
    try {
      const { program: p, workout: w, exercises: e } = await doFetch();
      setProgram(p);
      setWorkout(w);
      setExercises(e);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, [doFetch]);

  useEffect(() => {
    if (Number.isNaN(workoutId)) {
      setLoading(false);
      return;
    }
    load();
  }, [workoutId, load]);

  const reorderExercises = useCallback(
    async (orderedIds: number[]) => {
      const db = await getDatabase();
      await reorderTemplateExercises(db, workoutId, orderedIds);
    },
    [workoutId]
  );

  return {
    program,
    workout,
    exercises,
    loading,
    error,
    reload,
    reorderExercises,
  };
}
