import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../app/index';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockGetPrograms = jest.fn();
const mockGetProgramById = jest.fn();
const mockGetUserSetting = jest.fn();

jest.mock('../../db/init', () => ({
  getDatabase: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../db/templates', () => ({
  getPrograms: (...args: unknown[]) => mockGetPrograms(...args),
  getProgramById: (...args: unknown[]) => mockGetProgramById(...args),
}));

jest.mock('../../db/settings', () => ({
  getUserSetting: (...args: unknown[]) => mockGetUserSetting(...args),
}));

const mockSetActiveProgramId = jest.fn();
let mockActiveProgramId: number | null = null;

jest.mock('../../store', () => ({
  useAppStore: () => ({
    activeProgramId: mockActiveProgramId,
    setActiveProgramId: mockSetActiveProgramId,
  }),
}));

jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({ ready: true, error: null }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveProgramId = null;
    mockGetPrograms.mockResolvedValue([]);
    mockGetUserSetting.mockResolvedValue(null);
  });

  it('shows loading state before data loads', async () => {
    mockGetPrograms.mockImplementation(() => new Promise(() => {}));
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows empty state when no programs exist', async () => {
    mockGetPrograms.mockResolvedValue([]);
    const { getByText } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('No programs yet.')).toBeTruthy();
    });
  });

  it('lists programs', async () => {
    mockGetPrograms.mockResolvedValue([
      { id: 1, name: 'Push Pull Legs', description: null, createdAt: '2026-01-01' },
      { id: 2, name: '5x5', description: 'Stronglifts', createdAt: '2026-02-01' },
    ]);
    const { getByText } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Push Pull Legs')).toBeTruthy();
      expect(getByText('5x5')).toBeTruthy();
    });
  });

  it('navigates to program detail on row tap', async () => {
    mockGetPrograms.mockResolvedValue([
      { id: 1, name: 'Push Pull Legs', description: null, createdAt: '2026-01-01' },
    ]);
    const { getByText } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Push Pull Legs')).toBeTruthy();
    });

    fireEvent.press(getByText('Push Pull Legs'));
    expect(mockPush).toHaveBeenCalledWith('/programs/1');
  });

  it('navigates to create program on + New tap', async () => {
    mockGetPrograms.mockResolvedValue([]);
    const { getByText } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('+ New')).toBeTruthy();
    });

    fireEvent.press(getByText('+ New'));
    expect(mockPush).toHaveBeenCalledWith('/programs/create');
  });

  it('shows active program card when program is active', async () => {
    mockActiveProgramId = 1;
    mockGetUserSetting.mockResolvedValue('1');
    mockGetPrograms.mockResolvedValue([
      { id: 1, name: 'Push Pull Legs', description: 'My split', createdAt: '2026-01-01' },
    ]);
    const { getByText, getAllByText } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Current Program')).toBeTruthy();
      expect(getAllByText('Push Pull Legs').length).toBeGreaterThanOrEqual(1);
      expect(getByText('My split')).toBeTruthy();
    });
  });

  it('shows Start Workout button', async () => {
    mockGetPrograms.mockResolvedValue([]);
    const { getByText } = await render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Start Workout')).toBeTruthy();
    });
  });
});
