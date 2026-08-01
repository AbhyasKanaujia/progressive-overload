import { getDatabase, resetDatabase } from './init';
import * as sessions from './sessions';
import * as templates from './templates';
import * as library from './library';

jest.mock('expo-sqlite');

describe('sessions CRUD', () => {
  let db: Awaited<ReturnType<typeof getDatabase>>;
  let programId: number;
  let templateId: number;
  let exerciseId: number;

  beforeEach(async () => {
    resetDatabase();
    db = await getDatabase();
    programId = await templates.createProgram(db, 'Test Program');
    templateId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
    const patternId = await library.createMovementPattern(db, 'Push', 'Push');
    exerciseId = await library.createExercise(
      db,
      'Test Bench Press',
      patternId,
      'Chest',
      'Barbell',
      'Intermediate'
    );
  });

  describe('workout sessions', () => {
    it('creates and retrieves a session', async () => {
      const id = await sessions.createWorkoutSession(db, {
        workoutTemplateId: templateId,
        programId,
        notes: 'Felt good',
        completed: true,
      });
      expect(id).toBeGreaterThan(0);

      const session = await sessions.getWorkoutSessionById(db, id);
      expect(session).toMatchObject({
        workoutTemplateId: templateId,
        programId,
        notes: 'Felt good',
        completed: 1,
      });
      expect(session?.performedAt).toBeTruthy();
    });

    it('lists sessions', async () => {
      await sessions.createWorkoutSession(db, { notes: 'A' });
      await sessions.createWorkoutSession(db, { notes: 'B' });
      const list = await sessions.getWorkoutSessions(db);
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('updates a session', async () => {
      const id = await sessions.createWorkoutSession(db, { notes: 'Old' });
      await sessions.updateWorkoutSession(db, id, { notes: 'New', completed: true });
      const updated = await sessions.getWorkoutSessionById(db, id);
      expect(updated).toMatchObject({ notes: 'New', completed: 1 });
    });

    it('deletes a session', async () => {
      const id = await sessions.createWorkoutSession(db, {});
      await sessions.deleteWorkoutSession(db, id);
      const deleted = await sessions.getWorkoutSessionById(db, id);
      expect(deleted).toBeNull();
    });
  });

  describe('session exercises', () => {
    let sessionId: number;

    beforeEach(async () => {
      sessionId = await sessions.createWorkoutSession(db, {});
    });

    it('creates and retrieves a session exercise', async () => {
      const id = await sessions.createSessionExercise(db, sessionId, exerciseId, 0);
      expect(id).toBeGreaterThan(0);

      const se = await sessions.getSessionExerciseById(db, id);
      expect(se).toMatchObject({ workoutSessionId: sessionId, exerciseId, orderIndex: 0 });
    });

    it('cascades delete with session', async () => {
      const seId = await sessions.createSessionExercise(db, sessionId, exerciseId, 0);
      await sessions.deleteWorkoutSession(db, sessionId);
      const deleted = await sessions.getSessionExerciseById(db, seId);
      expect(deleted).toBeNull();
    });

    it('updates order index', async () => {
      const id = await sessions.createSessionExercise(db, sessionId, exerciseId, 0);
      await sessions.updateSessionExercise(db, id, 2);
      const updated = await sessions.getSessionExerciseById(db, id);
      expect(updated?.orderIndex).toBe(2);
    });
  });

  describe('set logs', () => {
    let sessionId: number;
    let sessionExerciseId: number;

    beforeEach(async () => {
      sessionId = await sessions.createWorkoutSession(db, {});
      sessionExerciseId = await sessions.createSessionExercise(db, sessionId, exerciseId, 0);
    });

    it('creates and retrieves a set log', async () => {
      const id = await sessions.createSetLog(db, {
        sessionExerciseId,
        setNumber: 1,
        targetWeight: 60,
        targetReps: 10,
        performedWeight: 60,
        performedReps: 10,
        rir: 2,
        completed: true,
      });
      expect(id).toBeGreaterThan(0);

      const log = await sessions.getSetLogById(db, id);
      expect(log).toMatchObject({
        sessionExerciseId,
        setNumber: 1,
        targetWeight: 60,
        targetReps: 10,
        performedWeight: 60,
        performedReps: 10,
        rir: 2,
        completed: 1,
      });
      expect(log?.createdAt).toBeTruthy();
    });

    it('cascades delete with session exercise', async () => {
      const logId = await sessions.createSetLog(db, { sessionExerciseId, setNumber: 1 });
      await sessions.deleteSessionExercise(db, sessionExerciseId);
      const deleted = await sessions.getSetLogById(db, logId);
      expect(deleted).toBeNull();
    });

    it('updates a set log', async () => {
      const id = await sessions.createSetLog(db, {
        sessionExerciseId,
        setNumber: 1,
        performedWeight: 50,
        performedReps: 8,
        rir: 3,
        completed: false,
      });
      await sessions.updateSetLog(db, id, {
        performedWeight: 55,
        performedReps: 9,
        rir: 2,
        completed: true,
      });
      const updated = await sessions.getSetLogById(db, id);
      expect(updated).toMatchObject({
        performedWeight: 55,
        performedReps: 9,
        rir: 2,
        completed: 1,
      });
    });

    it('does not cascade delete when template is deleted', async () => {
      const sessionId2 = await sessions.createWorkoutSession(db, {
        workoutTemplateId: templateId,
        programId,
      });
      const seId2 = await sessions.createSessionExercise(db, sessionId2, exerciseId, 0);
      const logId = await sessions.createSetLog(db, { sessionExerciseId: seId2, setNumber: 1 });

      await templates.deleteWorkoutTemplate(db, templateId);
      const log = await sessions.getSetLogById(db, logId);
      expect(log).not.toBeNull();
    });
  });
});
