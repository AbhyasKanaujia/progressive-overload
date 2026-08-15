import { fireEvent, render, screen } from '@testing-library/react-native';

import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  const options = ['Workouts', 'Exercises'] as const;

  it('renders all options', async () => {
    await render(<SegmentedControl options={options} selected="Workouts" onChange={jest.fn()} />);
    expect(screen.getByText('Workouts')).toBeTruthy();
    expect(screen.getByText('Exercises')).toBeTruthy();
  });

  it('marks only the selected option as selected', async () => {
    await render(<SegmentedControl options={options} selected="Workouts" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: 'Workouts' }).props.accessibilityState.selected).toBe(
      true
    );
    expect(screen.getByRole('tab', { name: 'Exercises' }).props.accessibilityState.selected).toBe(
      false
    );
  });

  it('calls onChange with the newly tapped option', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={options} selected="Workouts" onChange={onChange} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Exercises' }));
    expect(onChange).toHaveBeenCalledWith('Exercises');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('allows only one selection at a time', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={options} selected="Exercises" onChange={onChange} />);
    await fireEvent.press(screen.getByRole('tab', { name: 'Workouts' }));
    expect(onChange).toHaveBeenCalledWith('Workouts');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
