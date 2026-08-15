import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const content = (
    <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
      {label}
    </Text>
  );

  if (!onPress) {
    return (
      <View style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  chipDefault: {
    backgroundColor: colors.neutral100,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  labelDefault: {
    color: colors.neutral700,
  },
  labelSelected: {
    color: colors.white,
  },
});
