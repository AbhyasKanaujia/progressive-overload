import { fireEvent, render, screen } from '@testing-library/react-native';

import { colors } from '../constants/theme';
import { Chip } from './Chip';

describe('Chip', () => {
  it('uses Primary styling when selected, never Accent', async () => {
    await render(<Chip label="Push" selected onPress={jest.fn()} />);
    const chip = screen.getByRole('button', { name: 'Push' });
    expect(chip.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary })])
    );
    const styles = ([] as object[]).concat(chip.props.style);
    styles.forEach((style) => {
      expect((style as { backgroundColor?: string }).backgroundColor).not.toBe(colors.accent);
    });
  });

  it('uses a low-emphasis background when not selected', async () => {
    await render(<Chip label="Barbell" onPress={jest.fn()} />);
    const chip = screen.getByRole('button', { name: 'Barbell' });
    expect(chip.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.neutral100 })])
    );
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Chip label="Chest" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Chest' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders as static (non-pressable) when onPress is omitted', async () => {
    await render(<Chip label="Chest" />);
    expect(screen.queryByRole('button', { name: 'Chest' })).toBeNull();
    expect(screen.getByText('Chest')).toBeTruthy();
  });
});
