import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';

type BaseProps = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

type LabeledButtonProps = BaseProps & {
  variant: 'primary' | 'secondary' | 'tertiary';
  label: string;
  accessibilityLabel?: string;
};

type IconButtonProps = BaseProps & {
  variant: 'icon';
  icon: ReactNode;
  accessibilityLabel: string;
};

export type ButtonProps = LabeledButtonProps | IconButtonProps;

export function Button(props: ButtonProps) {
  const { onPress, disabled, loading, variant } = props;
  const isDisabled = disabled || loading;

  if (variant === 'icon') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel}
        style={[styles.iconButton, isDisabled && styles.disabled]}
      >
        {props.icon}
      </Pressable>
    );
  }

  const { label, accessibilityLabel } = props;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.base, variantStyles[variant], isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.label, labelVariantStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: typography.subtitle.fontSize,
    lineHeight: typography.subtitle.lineHeight,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },
  tertiary: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
  },
});

const labelVariantStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.neutral900 },
  tertiary: { color: colors.primary },
});
