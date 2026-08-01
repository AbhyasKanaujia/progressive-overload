import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProgramDetailScreen from '../../app/programs/[id]';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: '1' }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockGetProgramById = jest.fn();
const mockGetWorkoutTemplates = jest.fn();
const mockDeleteProgram = jest.fn();
const mockSetUserSetting = jest.fn();

jest.mock('../../db/init', () => ({
  getDatabase: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../db/templates', () => ({
  getProgramById: (...args: unknown[]) => mockGetProgramById(...args),
  getWorkoutTemplates: (...args: unknown[]) => mockGetWorkoutTemplates(...args),
  deleteProgram: (...args: unknown[]) => mockDeleteProgram(...args),
}));

jest.mock('../../db/settings', () => ({
  setUserSetting: (...args: unknown[]) => mockSetUserSetting(...args),
}));

jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({ ready: true, error: null }),
}));

const mockSetActiveProgramId = jest.fn();
let mockActiveProgramId: number | null = null;

jest.mock('../../store', () => ({
  useAppStore: () => ({
    activeProgramId: mockActiveProgramId,
    setActiveProgramId: mockSetActiveProgramId,
  }),
}));

describe('ProgramDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveProgramId = null;
    mockGetProgramById.mockResolvedValue({
      id: 1,
      name: 'Push Pull Legs',
      description: 'My favourite split',
      createdAt: '2026-01-01',
    });
    mockGetWorkoutTemplates.mockResolvedValue([
      { id: 10, programId: 1, name: 'Push Day', orderIndex: 0 },
    ]);
  });

  it('renders program info and templates', async () => {
    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('Push Pull Legs')).toBeTruthy();
      expect(getByText('My favourite split')).toBeTruthy();
      expect(getByText('Push Day')).toBeTruthy();
    });
  });

  it('shows "Set as Active Program" when not active', async () => {
    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('Set as Active Program')).toBeTruthy();
    });
  });

  it('shows "Active Program" when active', async () => {
    mockActiveProgramId = 1;
    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('✓ Active Program')).toBeTruthy();
    });
  });

  it('toggles active program on tap', async () => {
    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('Set as Active Program')).toBeTruthy();
    });

    fireEvent.press(getByText('Set as Active Program'));
    expect(mockSetActiveProgramId).toHaveBeenCalledWith(1);
  });

  it('shows delete confirmation alert', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('Delete Program')).toBeTruthy();
    });

    fireEvent.press(getByText('Delete Program'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Program',
      expect.stringContaining('remove its workout templates'),
      expect.any(Array)
    );
  });

  it('deletes program and navigates back', async () => {
    mockDeleteProgram.mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteButton = buttons?.find((b: { text?: string }) => b.text === 'Delete');
      if (deleteButton?.onPress) {
        deleteButton.onPress();
      }
    });

    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('Delete Program')).toBeTruthy();
    });

    fireEvent.press(getByText('Delete Program'));

    await waitFor(() => {
      expect(mockDeleteProgram).toHaveBeenCalledWith(expect.anything(), 1);
      expect(mockBack).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it('clears active program from DB when deleting active program', async () => {
    mockActiveProgramId = 1;
    mockDeleteProgram.mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const deleteButton = buttons?.find((b: { text?: string }) => b.text === 'Delete');
      if (deleteButton?.onPress) {
        deleteButton.onPress();
      }
    });

    const { getByText } = await render(<ProgramDetailScreen />);

    await waitFor(() => {
      expect(getByText('Delete Program')).toBeTruthy();
    });

    fireEvent.press(getByText('Delete Program'));

    await waitFor(() => {
      expect(mockSetUserSetting).toHaveBeenCalledWith(expect.anything(), 'active_program_id', null);
      expect(mockSetActiveProgramId).toHaveBeenCalledWith(null);
    });

    alertSpy.mockRestore();
  });
});
