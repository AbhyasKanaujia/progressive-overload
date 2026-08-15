import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { IdentityBadge } from './IdentityBadge';

function textColor(element: ReturnType<typeof screen.getByText>): string {
  return StyleSheet.flatten(element.props.style).color;
}

describe('IdentityBadge', () => {
  it('renders initials from a single-word name', async () => {
    await render(<IdentityBadge name="Overhead" />);
    expect(screen.getByText('O')).toBeTruthy();
  });

  it('renders initials from a multi-word name', async () => {
    await render(<IdentityBadge name="Bench Press" />);
    expect(screen.getByText('BP')).toBeTruthy();
  });

  it('assigns the same color for the same name across renders', async () => {
    const first = await render(<IdentityBadge name="Cable Fly" />);
    const firstColor = textColor(first.getByText('CF'));
    await first.unmount();

    const second = await render(<IdentityBadge name="Cable Fly" />);
    const secondColor = textColor(second.getByText('CF'));

    expect(secondColor).toBe(firstColor);
  });

  it('can assign different colors for different names', async () => {
    const bench = await render(<IdentityBadge name="Bench Press" />);
    const benchColor = textColor(bench.getByText('BP'));
    await bench.unmount();

    const tricep = await render(<IdentityBadge name="Tricep Pushdown" />);
    const tricepColor = textColor(tricep.getByText('TP'));

    expect(tricepColor).not.toBe(benchColor);
  });
});
