import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', async () => {
    await render(
      <EmptyState title="No programs yet" description="Create your first program to get started." />
    );
    expect(screen.getByText('No programs yet')).toBeTruthy();
    expect(screen.getByText('Create your first program to get started.')).toBeTruthy();
  });

  it('renders the CTA when supplied and calls onPressCta', async () => {
    const onPressCta = jest.fn();
    await render(
      <EmptyState
        title="No programs yet"
        description="Create your first program to get started."
        ctaLabel="Create Program"
        onPressCta={onPressCta}
      />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Create Program' }));
    expect(onPressCta).toHaveBeenCalledTimes(1);
  });

  it('omits the CTA entirely when not supplied', async () => {
    await render(
      <EmptyState
        title="No workouts yet"
        description="Add a workout to start building this program."
      />
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
