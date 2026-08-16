import { getDatabase, resetDatabase } from './init';
import * as templates from './templates';
import * as library from './library';

jest.mock('expo-sqlite');

describe('templates CRUD', () => {
  let db: Awaited<ReturnType<typeof getDatabase>>;
  let programId: number;
  let exerciseId: number;

  beforeEach(async () => {
    resetDatabase();
    db = await getDatabase();
    programId = await templates.createProgram(db, 'Test Program', 'A test program');
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

  describe('programs', () => {
    it('creates and retrieves a program', async () => {
      const id = await templates.createProgram(db, 'New Program', 'Description');
      expect(id).toBeGreaterThan(0);

      const program = await templates.getProgramById(db, id);
      expect(program).toMatchObject({ name: 'New Program', description: 'Description' });
      expect(program?.createdAt).toBeTruthy();
    });

    it('lists programs', async () => {
      await templates.createProgram(db, 'P1');
      await templates.createProgram(db, 'P2');
      const programs = await templates.getPrograms(db);
      expect(programs.length).toBeGreaterThanOrEqual(2);
    });

    it('updates a program', async () => {
      await templates.updateProgram(db, programId, 'Updated', 'New desc');
      const updated = await templates.getProgramById(db, programId);
      expect(updated).toMatchObject({ name: 'Updated', description: 'New desc' });
    });

    it('deletes a program', async () => {
      await templates.deleteProgram(db, programId);
      const deleted = await templates.getProgramById(db, programId);
      expect(deleted).toBeNull();
    });

    it('derives workout and exercise counts per program', async () => {
      const otherProgramId = await templates.createProgram(db, 'Empty Program');
      const wtId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
      await templates.createWorkoutTemplate(db, programId, 'Pull Day', 1);
      await templates.createTemplateExercise(db, wtId, exerciseId, 0);
      await templates.createTemplateExercise(db, wtId, exerciseId, 1);

      const counts = await templates.getProgramCounts(db);

      expect(counts).toContainEqual({
        programId,
        workoutCount: 2,
        exerciseCount: 2,
      });
      expect(counts).toContainEqual({
        programId: otherProgramId,
        workoutCount: 0,
        exerciseCount: 0,
      });
    });
  });

  describe('workout templates', () => {
    it('creates and retrieves a workout template', async () => {
      const id = await templates.createWorkoutTemplate(db, programId, 'Push Day', 1);
      expect(id).toBeGreaterThan(0);

      const wt = await templates.getWorkoutTemplateById(db, id);
      expect(wt).toMatchObject({ name: 'Push Day', orderIndex: 1 });
    });

    it('lists templates by program', async () => {
      await templates.createWorkoutTemplate(db, programId, 'A', 0);
      await templates.createWorkoutTemplate(db, programId, 'B', 1);
      const wts = await templates.getWorkoutTemplates(db, programId);
      expect(wts.length).toBe(2);
    });

    it('cascades delete with program', async () => {
      const wtId = await templates.createWorkoutTemplate(db, programId, 'A', 0);
      await templates.deleteProgram(db, programId);
      const deleted = await templates.getWorkoutTemplateById(db, wtId);
      expect(deleted).toBeNull();
    });

    it('round-trips description', async () => {
      const id = await templates.createWorkoutTemplate(
        db,
        programId,
        'Push Day',
        0,
        'Chest and triceps focus'
      );
      const wt = await templates.getWorkoutTemplateById(db, id);
      expect(wt).toMatchObject({
        description: 'Chest and triceps focus',
      });
    });

    it('defaults description to null when omitted', async () => {
      const id = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
      const wt = await templates.getWorkoutTemplateById(db, id);
      expect(wt).toMatchObject({ description: null });
    });

    it('updates description', async () => {
      const id = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
      await templates.updateWorkoutTemplate(db, id, 'Push Day', 0, 'Updated focus');
      const wt = await templates.getWorkoutTemplateById(db, id);
      expect(wt).toMatchObject({ description: 'Updated focus' });
    });

    it('reorders workout templates', async () => {
      const a = await templates.createWorkoutTemplate(db, programId, 'A', 0);
      const b = await templates.createWorkoutTemplate(db, programId, 'B', 1);
      const c = await templates.createWorkoutTemplate(db, programId, 'C', 2);

      await templates.reorderWorkoutTemplates(db, programId, [c, a, b]);

      const ordered = await templates.getWorkoutTemplates(db, programId);
      expect(ordered.map((wt) => wt.id)).toEqual([c, a, b]);
      expect(ordered.map((wt) => wt.orderIndex)).toEqual([0, 1, 2]);
    });

    it('rejects reorder when orderedIds omits an existing workout template', async () => {
      const a = await templates.createWorkoutTemplate(db, programId, 'A', 0);
      await templates.createWorkoutTemplate(db, programId, 'B', 1);

      await expect(templates.reorderWorkoutTemplates(db, programId, [a])).rejects.toThrow();
    });

    it('rejects reorder when orderedIds includes an id from another program', async () => {
      const a = await templates.createWorkoutTemplate(db, programId, 'A', 0);
      const otherProgramId = await templates.createProgram(db, 'Other Program');
      const foreign = await templates.createWorkoutTemplate(db, otherProgramId, 'Foreign', 0);

      await expect(
        templates.reorderWorkoutTemplates(db, programId, [a, foreign])
      ).rejects.toThrow();
    });

    it('leaves order unchanged when reorder is rejected', async () => {
      const a = await templates.createWorkoutTemplate(db, programId, 'A', 0);
      const b = await templates.createWorkoutTemplate(db, programId, 'B', 1);

      await expect(templates.reorderWorkoutTemplates(db, programId, [a])).rejects.toThrow();

      const unchanged = await templates.getWorkoutTemplates(db, programId);
      expect(unchanged.map((wt) => wt.id)).toEqual([a, b]);
      expect(unchanged.map((wt) => wt.orderIndex)).toEqual([0, 1]);
    });

    it('derives exercise counts per workout template', async () => {
      const wtId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
      const emptyId = await templates.createWorkoutTemplate(db, programId, 'Pull Day', 1);
      await templates.createTemplateExercise(db, wtId, exerciseId, 0);
      await templates.createTemplateExercise(db, wtId, exerciseId, 1);

      const counts = await templates.getWorkoutTemplateCounts(db, programId);

      expect(counts).toContainEqual({ workoutTemplateId: wtId, exerciseCount: 2 });
      expect(counts).toContainEqual({ workoutTemplateId: emptyId, exerciseCount: 0 });
    });
  });

  describe('template exercises', () => {
    let templateId: number;

    beforeEach(async () => {
      templateId = await templates.createWorkoutTemplate(db, programId, 'Push Day', 0);
    });

    it('creates and retrieves a template exercise', async () => {
      const id = await templates.createTemplateExercise(db, templateId, exerciseId, 0, 3, 8, 12);
      expect(id).toBeGreaterThan(0);

      const te = await templates.getTemplateExerciseById(db, id);
      expect(te).toMatchObject({
        workoutTemplateId: templateId,
        exerciseId,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      });
    });

    it('cascades delete with workout template', async () => {
      const teId = await templates.createTemplateExercise(db, templateId, exerciseId, 0, 3, 8, 12);
      await templates.deleteWorkoutTemplate(db, templateId);
      const deleted = await templates.getTemplateExerciseById(db, teId);
      expect(deleted).toBeNull();
    });

    it('updates a template exercise', async () => {
      const id = await templates.createTemplateExercise(db, templateId, exerciseId, 0, 3, 8, 12);
      await templates.updateTemplateExercise(db, id, 1, 4, 6, 10);
      const updated = await templates.getTemplateExerciseById(db, id);
      expect(updated).toMatchObject({
        orderIndex: 1,
        targetSets: 4,
        targetRepsMin: 6,
        targetRepsMax: 10,
      });
    });

    it('retrieves template exercises with exercise details', async () => {
      await templates.createTemplateExercise(db, templateId, exerciseId, 0, 3, 8, 12);
      const list = await templates.getTemplateExercisesWithDetails(db, templateId);
      expect(list.length).toBe(1);
      expect(list[0]).toMatchObject({
        exerciseName: 'Test Bench Press',
        equipment: 'Barbell',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      });
    });

    it('round-trips rest and notes', async () => {
      const id = await templates.createTemplateExercise(
        db,
        templateId,
        exerciseId,
        0,
        3,
        8,
        12,
        '2–3 min',
        'Focus on controlled reps'
      );
      const te = await templates.getTemplateExerciseById(db, id);
      expect(te).toMatchObject({ rest: '2–3 min', notes: 'Focus on controlled reps' });
    });

    it('defaults rest and notes to null when omitted', async () => {
      const id = await templates.createTemplateExercise(db, templateId, exerciseId, 0, 3, 8, 12);
      const te = await templates.getTemplateExerciseById(db, id);
      expect(te).toMatchObject({ rest: null, notes: null });
    });

    it('updates rest and notes', async () => {
      const id = await templates.createTemplateExercise(db, templateId, exerciseId, 0, 3, 8, 12);
      await templates.updateTemplateExercise(db, id, 0, 3, 8, 12, '90 sec', 'Slow eccentric');
      const te = await templates.getTemplateExerciseById(db, id);
      expect(te).toMatchObject({ rest: '90 sec', notes: 'Slow eccentric' });
    });

    it('reorders template exercises', async () => {
      const a = await templates.createTemplateExercise(db, templateId, exerciseId, 0);
      const b = await templates.createTemplateExercise(db, templateId, exerciseId, 1);
      const c = await templates.createTemplateExercise(db, templateId, exerciseId, 2);

      await templates.reorderTemplateExercises(db, templateId, [c, a, b]);

      const ordered = await templates.getTemplateExercises(db, templateId);
      expect(ordered.map((te) => te.id)).toEqual([c, a, b]);
      expect(ordered.map((te) => te.orderIndex)).toEqual([0, 1, 2]);
    });

    it('rejects reorder when orderedIds omits an existing template exercise', async () => {
      const a = await templates.createTemplateExercise(db, templateId, exerciseId, 0);
      await templates.createTemplateExercise(db, templateId, exerciseId, 1);

      await expect(templates.reorderTemplateExercises(db, templateId, [a])).rejects.toThrow();
    });

    it('rejects reorder when orderedIds includes an id from another workout template', async () => {
      const a = await templates.createTemplateExercise(db, templateId, exerciseId, 0);
      const otherTemplateId = await templates.createWorkoutTemplate(db, programId, 'Pull Day', 1);
      const foreign = await templates.createTemplateExercise(db, otherTemplateId, exerciseId, 0);

      await expect(
        templates.reorderTemplateExercises(db, templateId, [a, foreign])
      ).rejects.toThrow();
    });

    it('leaves order unchanged when reorder is rejected', async () => {
      const a = await templates.createTemplateExercise(db, templateId, exerciseId, 0);
      const b = await templates.createTemplateExercise(db, templateId, exerciseId, 1);

      await expect(templates.reorderTemplateExercises(db, templateId, [a])).rejects.toThrow();

      const unchanged = await templates.getTemplateExercises(db, templateId);
      expect(unchanged.map((te) => te.id)).toEqual([a, b]);
      expect(unchanged.map((te) => te.orderIndex)).toEqual([0, 1]);
    });
  });
});
