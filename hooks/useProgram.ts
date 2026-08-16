import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '../db/init';
import {
  getProgramById,
  getWorkoutTemplateCounts,
  getWorkoutTemplates,
  reorderWorkoutTemplates,
} from '../db/templates';
import { Program, WorkoutTemplate } from '../types';

export type WorkoutListItem = WorkoutTemplate & {
  exerciseCount: number;
};

export function useProgram(programId: number) {
  const [program, setProgram] = useState<Program | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const doFetch = useCallback(async () => {
    const db = await getDatabase();
    const [p, workoutList, counts] = await Promise.all([
      getProgramById(db, programId),
      getWorkoutTemplates(db, programId),
      getWorkoutTemplateCounts(db, programId),
    ]);
    const countsById = new Map(counts.map((c) => [c.workoutTemplateId, c]));
    return {
      program: p,
      workouts: workoutList.map((workout) => ({
        ...workout,
        exerciseCount: countsById.get(workout.id)?.exerciseCount ?? 0,
      })),
    };
  }, [programId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { program: p, workouts: w } = await doFetch();
      setProgram(p);
      setWorkouts(w);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [doFetch]);

  const reload = useCallback(async () => {
    try {
      const { program: p, workouts: w } = await doFetch();
      setProgram(p);
      setWorkouts(w);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, [doFetch]);

  useEffect(() => {
    if (Number.isNaN(programId)) {
      setLoading(false);
      return;
    }
    load();
  }, [programId, load]);

  const reorderWorkouts = useCallback(
    async (orderedIds: number[]) => {
      const db = await getDatabase();
      await reorderWorkoutTemplates(db, programId, orderedIds);
    },
    [programId]
  );

  return {
    program,
    workouts,
    loading,
    error,
    reload,
    reorderWorkouts,
  };
}
