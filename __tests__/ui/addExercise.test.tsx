import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddExerciseScreen from '../../app/templates/addExercise';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ templateId: '5' }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockGetExercisesWithMovementPattern = jest.fn();
const mockCreateTemplateExercise = jest.fn();
const mockGetTemplateExercises = jest.fn();

jest.mock('../../db/init', () => ({
  getDatabase: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../db/library', () => ({
  getExercisesWithMovementPattern: (...args: unknown[]) =>
    mockGetExercisesWithMovementPattern(...args),
}));

jest.mock('../../db/templates', () => ({
  createTemplateExercise: (...args: unknown[]) => mockCreateTemplateExercise(...args),
  getTemplateExercises: (...args: unknown[]) => mockGetTemplateExercises(...args),
}));

jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({ ready: true, error: null }),
}));

describe('AddExerciseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTemplateExercises.mockResolvedValue([
      {
        id: 1,
        workoutTemplateId: 5,
        exerciseId: 10,
        orderIndex: 0,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      },
    ]);
    mockGetExercisesWithMovementPattern.mockResolvedValue([
      {
        id: 20,
        name: 'Bench Press',
        movementPatternId: 1,
        muscleGroups: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        movementPatternName: 'Horizontal Push',
        patternParentId: null,
        category: 'Push',
      },
      {
        id: 21,
        name: 'Barbell Row',
        movementPatternId: 2,
        muscleGroups: 'Back',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        movementPatternName: 'Horizontal Pull',
        patternParentId: null,
        category: 'Pull',
      },
    ]);
  });

  it('renders grouped exercises', async () => {
    const { getByText } = await render(<AddExerciseScreen />);

    await waitFor(() => {
      expect(getByText('Push')).toBeTruthy();
      expect(getByText('Horizontal Push')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('Pull')).toBeTruthy();
      expect(getByText('Barbell Row')).toBeTruthy();
    });
  });

  it('creates template exercise with defaults and goes back on tap', async () => {
    mockCreateTemplateExercise.mockResolvedValue(99);
    const { getByText } = await render(<AddExerciseScreen />);

    await waitFor(() => {
      expect(getByText('Bench Press')).toBeTruthy();
    });

    fireEvent.press(getByText('Bench Press'));

    await waitFor(() => {
      expect(mockCreateTemplateExercise).toHaveBeenCalledWith(
        expect.anything(),
        5,
        20,
        1, // nextOrderIndex = existing.length (1)
        3,
        8,
        12
      );
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
