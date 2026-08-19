import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../../../components/Button';
import { IdentityBadge } from '../../../../../components/IdentityBadge';
import { colors, radius, spacing, typography } from '../../../../../constants/theme';
import { TemplateExerciseWithDetails } from '../../../../../db/templates';
import { useWorkout } from '../../../../../hooks/useWorkout';

export default function ReorderExercisesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workoutId } = useLocalSearchParams<{ programId: string; workoutId: string }>();
  const id = Number(workoutId);
  const { workout, exercises, loading, reorderExercises } = useWorkout(id);

  const [ordered, setOrdered] = useState<TemplateExerciseWithDetails[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOrdered(exercises);
  }, [exercises]);

  const handleDone = async () => {
    setSaving(true);
    try {
      await reorderExercises(ordered.map((e) => e.id));
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setOrdered(exercises);
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Reorder Exercises</Text>
      {workout ? <Text style={styles.subtitle}>{workout.name}</Text> : null}

      <DraggableFlatList
        data={ordered}
        keyExtractor={(item) => String(item.id)}
        containerStyle={styles.listContainer}
        contentContainerStyle={styles.listContent}
        onDragEnd={({ data }) => setOrdered(data)}
        renderItem={({ item, drag, isActive }: RenderItemParams<TemplateExerciseWithDetails>) => (
          <ScaleDecorator>
            <View style={[styles.row, isActive && styles.rowActive]}>
              <IdentityBadge name={item.exerciseName} size={28} />
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.exerciseName}
              </Text>
              <Pressable
                onPressIn={drag}
                accessibilityRole="button"
                accessibilityLabel={`Drag to reorder ${item.exerciseName}`}
                hitSlop={8}
              >
                <Ionicons name="reorder-three" size={22} color={colors.neutral500} />
              </Pressable>
            </View>
          </ScaleDecorator>
        )}
      />

      <View style={styles.actions}>
        <Button variant="primary" label="Done" onPress={handleDone} loading={saving} />
        <Button variant="tertiary" label="Cancel" onPress={handleCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    color: colors.neutral900,
  },
  subtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.neutral500,
  },
  listContainer: {
    flex: 1,
    marginTop: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  rowActive: {
    borderColor: colors.primary,
  },
  rowTitle: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.neutral900,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
