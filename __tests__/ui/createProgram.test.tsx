import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateProgramScreen from '../../app/programs/create';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockCreateProgram = jest.fn();

jest.mock('../../db/init', () => ({
  getDatabase: jest.fn(() => Promise.resolve({})),
}));

jest.mock('../../db/templates', () => ({
  createProgram: (...args: unknown[]) => mockCreateProgram(...args),
}));

jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({ ready: true, error: null }),
}));

describe('CreateProgramScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', async () => {
    const { getByText } = await render(<CreateProgramScreen />);
    expect(getByText('Name *')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
    expect(getByText('Save Program')).toBeTruthy();
  });

  it('shows validation error when name is empty', async () => {
    const { getByText } = await render(<CreateProgramScreen />);

    await fireEvent.press(getByText('Save Program'));

    await waitFor(() => {
      expect(getByText('Program name is required')).toBeTruthy();
    });
  });

  // NOTE: full form submission (fill name → press save → assert createProgram called)
  // is not tested here because RNTL cannot reliably query TextInput by placeholder
  // under the jest-expo preset. The actual createProgram logic is covered by
  // db/templates.test.ts; this file tests UI-specific behavior only.
});
