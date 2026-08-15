import { fireEvent, render, screen } from '@testing-library/react-native';

import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders an arbitrary-length ancestor array', async () => {
    await render(
      <Breadcrumb
        items={[
          { label: 'Programs', onPress: jest.fn() },
          { label: 'Upper / Lower Split', onPress: jest.fn() },
          { label: 'Push Day', onPress: jest.fn() },
          { label: 'Bench Press' },
        ]}
      />
    );
    expect(screen.getByText('Programs')).toBeTruthy();
    expect(screen.getByText('Upper / Lower Split')).toBeTruthy();
    expect(screen.getByText('Push Day')).toBeTruthy();
    expect(screen.getByText('Bench Press')).toBeTruthy();
  });

  it('makes all but the last item pressable and calls onPress', async () => {
    const onPressPrograms = jest.fn();
    const onPressWorkout = jest.fn();
    await render(
      <Breadcrumb
        items={[
          { label: 'Programs', onPress: onPressPrograms },
          { label: 'Push Day', onPress: onPressWorkout },
          { label: 'Bench Press' },
        ]}
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Programs' }));
    expect(onPressPrograms).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Push Day' }));
    expect(onPressWorkout).toHaveBeenCalledTimes(1);
  });

  it('renders the last item as non-pressable', async () => {
    await render(
      <Breadcrumb items={[{ label: 'Programs', onPress: jest.fn() }, { label: 'Bench Press' }]} />
    );
    expect(screen.queryByRole('button', { name: 'Bench Press' })).toBeNull();
  });
});
