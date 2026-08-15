import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';
import { Button } from './Button';

export type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  onPressCta?: () => void;
};

export function EmptyState({ title, description, ctaLabel, onPressCta }: EmptyStateProps) {
  const showCta = Boolean(ctaLabel && onPressCta);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {showCta ? (
        <View style={styles.ctaWrapper}>
          <Button variant="primary" label={ctaLabel as string} onPress={onPressCta as () => void} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    color: colors.neutral900,
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.neutral500,
    textAlign: 'center',
  },
  ctaWrapper: {
    marginTop: spacing.lg,
  },
});
