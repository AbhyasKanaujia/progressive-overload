import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TemplateDetailScreen from '../../app/templates/[id]';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  useLocalSearchParams: () => ({ id: '5' }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockGetWorkoutTemplateById = jest.fn();
const mockGetTemplateExercisesWithDetails = jest.fn();
const mockUpdateTemplateExercise = jest.fn();
const mockDeleteTemplateExercise = jest.fn();

jest.mock('../../db/init', () => ({
  getDatabase: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../db/templates', () => ({
  getWorkoutTemplateById: (...args: unknown[]) => mockGetWorkoutTemplateById(...args),
  getTemplateExercisesWithDetails: (...args: unknown[]) =>
    mockGetTemplateExercisesWithDetails(...args),
  updateTemplateExercise: (...args: unknown[]) => mockUpdateTemplateExercise(...args),
  deleteTemplateExercise: (...args: unknown[]) => mockDeleteTemplateExercise(...args),
}));

jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({ ready: true, error: null }),
}));

describe('TemplateDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkoutTemplateById.mockResolvedValue({
      id: 5,
      programId: 1,
      name: 'Push Day',
      orderIndex: 0,
    });
    mockGetTemplateExercisesWithDetails.mockResolvedValue([
      {
        id: 100,
        workoutTemplateId: 5,
        exerciseId: 1,
        orderIndex: 0,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        exerciseName: 'Bench Press',
        equipment: 'Barbell',
      },
      {
        id: 101,
        workoutTemplateId: 5,
        exerciseId: 2,
        orderIndex: 1,
        targetSets: 3,
        targetRepsMin: 10,
        targetRepsMax: 15,
        exerciseName: 'Overhead Press',
        equipment: 'Barbell',
      },
    ]);
  });

  it('renders template name and exercises', async () => {
    const { getByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getByText('Push Day')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('Overhead Press')).toBeTruthy();
      expect(getByText('Sets 3 | 8–12 reps')).toBeTruthy();
    });
  });

  it('shows empty state when no exercises', async () => {
    mockGetTemplateExercisesWithDetails.mockResolvedValue([]);
    const { getByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getByText('No exercises in this template yet.')).toBeTruthy();
    });
  });

  it('navigates to add exercise picker', async () => {
    const { getByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getByText('+ Add Exercise')).toBeTruthy();
    });

    fireEvent.press(getByText('+ Add Exercise'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/templates/addExercise',
      params: { templateId: '5' },
    });
  });

  it('deletes exercise after confirmation', async () => {
    mockDeleteTemplateExercise.mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteButton = buttons?.find((b: { text?: string }) => b.text === 'Delete');
      if (deleteButton?.onPress) {
        deleteButton.onPress();
      }
    });

    const { getAllByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getAllByText('✕').length).toBe(2);
    });

    fireEvent.press(getAllByText('✕')[0]);

    await waitFor(() => {
      expect(mockDeleteTemplateExercise).toHaveBeenCalledWith(expect.anything(), 100);
    });

    alertSpy.mockRestore();
  });

  it('moves exercise up by swapping orderIndex', async () => {
    mockUpdateTemplateExercise.mockResolvedValue(undefined);
    const { getAllByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getAllByText('↑').length).toBe(1);
    });

    // Second item has ↑ button (index 1)
    fireEvent.press(getAllByText('↑')[0]);

    await waitFor(() => {
      // Swap: above (100, orderIndex 0) gets current's orderIndex (1)
      expect(mockUpdateTemplateExercise).toHaveBeenCalledWith(expect.anything(), 100, 1, 3, 8, 12);
      // current (101, orderIndex 1) gets above's orderIndex (0)
      expect(mockUpdateTemplateExercise).toHaveBeenCalledWith(expect.anything(), 101, 0, 3, 10, 15);
    });
  });

  it('moves exercise down by swapping orderIndex', async () => {
    mockUpdateTemplateExercise.mockResolvedValue(undefined);
    const { getAllByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getAllByText('↓').length).toBe(1);
    });

    // First item has ↓ button (index 0)
    fireEvent.press(getAllByText('↓')[0]);

    await waitFor(() => {
      // Swap: below (101, orderIndex 1) gets current's orderIndex (0)
      expect(mockUpdateTemplateExercise).toHaveBeenCalledWith(expect.anything(), 101, 0, 3, 10, 15);
      // current (100, orderIndex 0) gets below's orderIndex (1)
      expect(mockUpdateTemplateExercise).toHaveBeenCalledWith(expect.anything(), 100, 1, 3, 8, 12);
    });
  });

  it('opens edit modal on exercise tap and saves changes', async () => {
    mockUpdateTemplateExercise.mockResolvedValue(undefined);
    const { getByText, getAllByText } = await render(<TemplateDetailScreen />);

    await waitFor(() => {
      expect(getByText('Bench Press')).toBeTruthy();
    });

    fireEvent.press(getByText('Bench Press'));

    await waitFor(() => {
      expect(getByText('Edit Exercise')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
    });

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(mockUpdateTemplateExercise).toHaveBeenCalledWith(expect.anything(), 100, 0, 3, 8, 12);
    });
  });
});
