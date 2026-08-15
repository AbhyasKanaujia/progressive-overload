import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ListRow } from './ListRow';

describe('ListRow', () => {
  it('renders title and metadata', async () => {
    await render(<ListRow title="Bench Press" metadata="3 sets · 8-12 reps" />);
    expect(screen.getByText('Bench Press')).toBeTruthy();
    expect(screen.getByText('3 sets · 8-12 reps')).toBeTruthy();
  });

  it('omits metadata when not supplied', async () => {
    await render(<ListRow title="Push Day" />);
    expect(screen.queryByText(/sets/)).toBeNull();
  });

  it('renders optional leading badge and trailing affordance', async () => {
    await render(
      <ListRow title="Push Day" leading={<Text>1</Text>} trailing={<Text>handle</Text>} />
    );
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('handle')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<ListRow title="Push Day" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Push Day' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is not pressable when onPress is not supplied', async () => {
    await render(<ListRow title="Push Day" />);
    expect(screen.queryByRole('button', { name: 'Push Day' })).toBeNull();
  });
});
