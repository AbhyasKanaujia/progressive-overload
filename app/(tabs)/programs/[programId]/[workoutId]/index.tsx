import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../../../components/Button';
import { colors, spacing, typography } from '../../../../../constants/theme';
import { getDatabase } from '../../../../../db/init';
import { getWorkoutTemplateById } from '../../../../../db/templates';
import { useReloadOnFocus } from '../../../../../hooks/useReloadOnFocus';
import { WorkoutTemplate } from '../../../../../types';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { programId, workoutId } = useLocalSearchParams<{
    programId: string;
    workoutId: string;
  }>();
  const programIdNum = Number(programId);
  const id = Number(workoutId);

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);

  const load = useCallback(async () => {
    if (Number.isNaN(id)) {
      setLoading(false);
      return;
    }
    const db = await getDatabase();
    const w = await getWorkoutTemplateById(db, id);
    setWorkout(w);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useReloadOnFocus(load);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Workout not found.</Text>
        <View style={styles.cta}>
          <Button variant="primary" label="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {workout.name}
        </Text>
        <View style={styles.headerActions}>
          <Button
            variant="icon"
            accessibilityLabel="Edit Workout"
            icon={<Ionicons name="create-outline" size={20} color={colors.neutral500} />}
            onPress={() => router.push(`/programs/${programIdNum}/${id}/edit`)}
          />
          <Button
            variant="icon"
            accessibilityLabel="Delete Workout"
            icon={<Ionicons name="trash-outline" size={20} color={colors.neutral500} />}
            onPress={() => router.push(`/programs/${programIdNum}/${id}/delete`)}
          />
        </View>
      </View>

      <Text style={styles.placeholder} onPress={() => router.back()}>
        Workout detail coming soon. Tap to go back.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flexShrink: 1,
    fontFamily: typography.display.fontFamily,
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
    color: colors.neutral900,
  },
  placeholder: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.neutral500,
  },
  errorText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.danger,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.lg,
  },
});
