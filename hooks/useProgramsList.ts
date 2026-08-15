import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '../db/init';
import {
  createProgram,
  deleteProgram,
  getProgramCounts,
  getPrograms,
  updateProgram,
} from '../db/templates';
import { Program } from '../types';

export type ProgramListItem = Program & {
  workoutCount: number;
  exerciseCount: number;
};

export function useProgramsList() {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDatabase();
      const [list, counts] = await Promise.all([getPrograms(db), getProgramCounts(db)]);
      const countsById = new Map(counts.map((c) => [c.programId, c]));
      setPrograms(
        list.map((program) => ({
          ...program,
          workoutCount: countsById.get(program.id)?.workoutCount ?? 0,
          exerciseCount: countsById.get(program.id)?.exerciseCount ?? 0,
        }))
      );
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addProgram = useCallback(async (name: string, description?: string) => {
    const db = await getDatabase();
    const id = await createProgram(db, name, description);
    return id;
  }, []);

  const editProgram = useCallback(async (id: number, name: string, description?: string) => {
    const db = await getDatabase();
    await updateProgram(db, id, name, description);
  }, []);

  const removeProgram = useCallback(async (id: number) => {
    const db = await getDatabase();
    await deleteProgram(db, id);
  }, []);

  return { programs, loading, error, refresh, addProgram, editProgram, removeProgram };
}
