import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';

export type BreadcrumbItem = {
  label: string;
  onPress?: () => void;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <Ionicons
                name="chevron-forward"
                size={14}
                color={colors.neutral500}
                style={styles.separator}
              />
            ) : null}
            {isLast ? (
              <Text style={styles.currentLabel} numberOfLines={1}>
                {item.label}
              </Text>
            ) : (
              <Pressable
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={styles.segment}
              >
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  segment: {
    backgroundColor: colors.neutral100,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  separator: {
    marginHorizontal: spacing.xs,
  },
  label: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.neutral700,
  },
  currentLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.neutral900,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
