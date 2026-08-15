import { act, renderHook, waitFor } from '@testing-library/react-native';

import { resetDatabase } from '../db/init';
import { useProgramsList } from './useProgramsList';

jest.mock('expo-sqlite');

describe('useProgramsList', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('starts empty and loads programs with derived counts', async () => {
    const { result } = await renderHook(() => useProgramsList());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.programs).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('adds a program and reflects it after refresh', async () => {
    const { result } = await renderHook(() => useProgramsList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addProgram('Upper / Lower Split', 'A test program');
    });
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.programs).toHaveLength(1);
    expect(result.current.programs[0]).toMatchObject({
      name: 'Upper / Lower Split',
      description: 'A test program',
      workoutCount: 0,
      exerciseCount: 0,
    });
  });

  it('edits and removes a program', async () => {
    const { result } = await renderHook(() => useProgramsList());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id!: number;
    await act(async () => {
      id = await result.current.addProgram('Original Name');
    });
    await act(async () => {
      await result.current.refresh();
    });

    await act(async () => {
      await result.current.editProgram(id, 'Renamed', 'New description');
    });
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.programs[0]).toMatchObject({
      name: 'Renamed',
      description: 'New description',
    });

    await act(async () => {
      await result.current.removeProgram(id);
    });
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.programs).toEqual([]);
  });
});
