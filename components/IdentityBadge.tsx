import { StyleSheet, Text, View } from 'react-native';

import { radius, typography } from '../constants/theme';

export type IdentityBadgeProps = {
  name: string;
  size?: number;
};

const PALETTE = [
  { background: '#E0E7FF', text: '#3157D5' },
  { background: '#DCFCE7', text: '#168A5B' },
  { background: '#FFE4E6', text: '#D64545' },
  { background: '#FEF3C7', text: '#B45309' },
  { background: '#EDE9FE', text: '#6D28D9' },
  { background: '#E0F2FE', text: '#0369A1' },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }
  const words = trimmed.split(/\s+/);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
  return initials;
}

export function IdentityBadge({ name, size = 40 }: IdentityBadgeProps) {
  const palette = PALETTE[hashString(name) % PALETTE.length];

  return (
    <View
      style={[styles.badge, { width: size, height: size, backgroundColor: palette.background }]}
    >
      <Text style={[styles.initials, { color: palette.text, fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: typography.subtitle.fontFamily,
  },
});
