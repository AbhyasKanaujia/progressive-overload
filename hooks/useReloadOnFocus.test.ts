import { renderHook } from '@testing-library/react-native';

import { useReloadOnFocus } from './useReloadOnFocus';

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockIsFocused,
}));

describe('useReloadOnFocus', () => {
  beforeEach(() => {
    mockIsFocused = true;
  });

  it('does not call reload on the initial focus', () => {
    const reload = jest.fn();
    renderHook(() => useReloadOnFocus(reload));

    expect(reload).not.toHaveBeenCalled();
  });

  it('calls reload when the screen regains focus after losing it', async () => {
    const reload = jest.fn();
    const { rerender } = await renderHook(() => useReloadOnFocus(reload));

    mockIsFocused = false;
    await rerender(undefined);
    expect(reload).not.toHaveBeenCalled();

    mockIsFocused = true;
    await rerender(undefined);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not call reload while focus is lost', async () => {
    const reload = jest.fn();
    const { rerender } = await renderHook(() => useReloadOnFocus(reload));

    mockIsFocused = false;
    await rerender(undefined);
    await rerender(undefined);

    expect(reload).not.toHaveBeenCalled();
  });
});
