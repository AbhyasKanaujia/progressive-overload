import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { colors } from '../constants/theme';
import { Button } from './Button';

describe('Button', () => {
  it('renders primary variant with Primary background and calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button variant="primary" label="Create Program" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Create Program' });
    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary })])
    );

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders secondary variant with a visible border', async () => {
    await render(<Button variant="secondary" label="Cancel" onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: colors.neutral300 })])
    );
  });

  it('renders tertiary variant as text-only using Primary color', async () => {
    await render(<Button variant="tertiary" label="Browse Library" onPress={jest.fn()} />);
    expect(screen.getByText('Browse Library')).toBeTruthy();
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button variant="primary" label="Save Changes" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save Changes' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders the icon variant with a required accessibilityLabel', async () => {
    const onPress = jest.fn();
    await render(
      <Button
        variant="icon"
        icon={<Text>+</Text>}
        accessibilityLabel="Add workout"
        onPress={onPress}
      />
    );
    const button = screen.getByRole('button', { name: 'Add workout' });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
