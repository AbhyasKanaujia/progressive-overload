import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Card } from './Card';

describe('Card', () => {
  it('renders title and metadata', async () => {
    await render(<Card title="Upper / Lower Split" metadata="4 workouts · 16 exercises" />);
    expect(screen.getByText('Upper / Lower Split')).toBeTruthy();
    expect(screen.getByText('4 workouts · 16 exercises')).toBeTruthy();
  });

  it('omits metadata when not supplied', async () => {
    await render(<Card title="Strength Foundation" />);
    expect(screen.queryByText(/workouts/)).toBeNull();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Card title="Push Day" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Push Day' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is not pressable when onPress is not supplied', async () => {
    await render(<Card title="Pull Day" />);
    expect(screen.queryByRole('button', { name: 'Pull Day' })).toBeNull();
  });

  it('renders optional chip and trailing content', async () => {
    await render(
      <Card
        title="Upper / Lower Split"
        chip={<Text>Active</Text>}
        trailing={<Text>chevron</Text>}
      />
    );
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('chevron')).toBeTruthy();
  });
});
