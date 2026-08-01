import { getDatabase, resetDatabase } from './init';
import * as library from './library';

jest.mock('expo-sqlite');

describe('library CRUD', () => {
  let db: Awaited<ReturnType<typeof getDatabase>>;

  beforeEach(async () => {
    resetDatabase();
    db = await getDatabase();
  });

  describe('movement patterns', () => {
    it('creates and retrieves a movement pattern', async () => {
      const id = await library.createMovementPattern(db, 'Horizontal Push', 'Push');
      expect(id).toBeGreaterThan(0);

      const pattern = await library.getMovementPatternById(db, id);
      expect(pattern).toMatchObject({ name: 'Horizontal Push', category: 'Push', parentId: null });
    });

    it('lists all movement patterns', async () => {
      await library.createMovementPattern(db, 'A', 'Push');
      await library.createMovementPattern(db, 'B', 'Pull');
      const patterns = await library.getMovementPatterns(db);
      expect(patterns.length).toBeGreaterThanOrEqual(2);
    });

    it('updates a movement pattern', async () => {
      const id = await library.createMovementPattern(db, 'Old', 'Push');
      await library.updateMovementPattern(db, id, 'New', 'Pull', null);
      const updated = await library.getMovementPatternById(db, id);
      expect(updated).toMatchObject({ name: 'New', category: 'Pull' });
    });

    it('deletes a movement pattern', async () => {
      const id = await library.createMovementPattern(db, 'Temp', 'Push');
      await library.deleteMovementPattern(db, id);
      const deleted = await library.getMovementPatternById(db, id);
      expect(deleted).toBeNull();
    });
  });

  describe('exercises', () => {
    let patternId: number;

    beforeEach(async () => {
      patternId = await library.createMovementPattern(db, 'Vertical Push', 'Push');
    });

    it('creates and retrieves an exercise', async () => {
      const id = await library.createExercise(
        db,
        'Test Overhead Press',
        patternId,
        'Shoulders, Triceps',
        'Barbell',
        'Intermediate'
      );
      expect(id).toBeGreaterThan(0);

      const exercise = await library.getExerciseById(db, id);
      expect(exercise).toMatchObject({
        name: 'Test Overhead Press',
        movementPatternId: patternId,
        muscleGroups: 'Shoulders, Triceps',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
      });
    });

    it('lists exercises by movement pattern', async () => {
      await library.createExercise(db, 'Ex1', patternId, 'A', 'B', 'Beginner');
      await library.createExercise(db, 'Ex2', patternId, 'C', 'D', 'Advanced');
      const exercises = await library.getExercisesByMovementPattern(db, patternId);
      expect(exercises.length).toBe(2);
    });

    it('updates an exercise', async () => {
      const id = await library.createExercise(db, 'Old', patternId, 'A', 'B', 'Beginner');
      await library.updateExercise(db, id, 'New', patternId, 'C', 'D', 'Advanced');
      const updated = await library.getExerciseById(db, id);
      expect(updated).toMatchObject({
        name: 'New',
        muscleGroups: 'C',
        equipment: 'D',
        difficulty: 'Advanced',
      });
    });

    it('deletes an exercise', async () => {
      const id = await library.createExercise(db, 'Temp', patternId, 'A', 'B', 'Beginner');
      await library.deleteExercise(db, id);
      const deleted = await library.getExerciseById(db, id);
      expect(deleted).toBeNull();
    });
  });

  describe('exercise alternatives', () => {
    let patternId: number;
    let ex1: number;
    let ex2: number;

    beforeEach(async () => {
      patternId = await library.createMovementPattern(db, 'Horizontal Push', 'Push');
      ex1 = await library.createExercise(
        db,
        'Test Bench Press',
        patternId,
        'Chest',
        'Barbell',
        'Intermediate'
      );
      ex2 = await library.createExercise(
        db,
        'DB Bench',
        patternId,
        'Chest',
        'Dumbbell',
        'Intermediate'
      );
    });

    it('creates and retrieves alternatives', async () => {
      await library.createExerciseAlternative(db, ex1, ex2);
      const alternatives = await library.getExerciseAlternatives(db, ex1);
      expect(alternatives).toHaveLength(1);
      expect(alternatives[0].name).toBe('DB Bench');
    });

    it('deletes an alternative', async () => {
      await library.createExerciseAlternative(db, ex1, ex2);
      await library.deleteExerciseAlternative(db, ex1, ex2);
      const alternatives = await library.getExerciseAlternatives(db, ex1);
      expect(alternatives).toHaveLength(0);
    });
  });
});
