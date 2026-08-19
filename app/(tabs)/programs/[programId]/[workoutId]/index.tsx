import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Breadcrumb } from '../../../../../components/Breadcrumb';
import { Button } from '../../../../../components/Button';
import { EmptyState } from '../../../../../components/EmptyState';
import { IdentityBadge } from '../../../../../components/IdentityBadge';
import { ListRow } from '../../../../../components/ListRow';
import { colors, spacing, typography } from '../../../../../constants/theme';
import { TemplateExerciseWithDetails } from '../../../../../db/templates';
import { useReloadOnFocus } from '../../../../../hooks/useReloadOnFocus';
import { useWorkout } from '../../../../../hooks/useWorkout';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { programId, workoutId } = useLocalSearchParams<{
    programId: string;
    workoutId: string;
  }>();
  const programIdNum = Number(programId);
  const id = Number(workoutId);
  const { program, workout, exercises, loading, error, reload } = useWorkout(id);

  useReloadOnFocus(reload);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
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
        <View style={styles.breadcrumbWrapper}>
          <Breadcrumb
            items={[
              { label: 'Programs', onPress: () => router.dismissTo('/programs') },
              {
                label: program?.name ?? 'Program',
                onPress: () => router.dismissTo(`/programs/${programIdNum}`),
              },
              { label: workout.name },
            ]}
          />
        </View>
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

      <Text style={styles.title} numberOfLines={1}>
        {workout.name}
      </Text>
      {workout.description ? <Text style={styles.description}>{workout.description}</Text> : null}

      {exercises.length > 0 ? (
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <View style={styles.listHeaderActions}>
            {exercises.length > 1 ? (
              <Button
                variant="icon"
                accessibilityLabel="Reorder Exercises"
                icon={<Ionicons name="reorder-three" size={20} color={colors.neutral500} />}
                onPress={() => router.push(`/programs/${programIdNum}/${id}/reorder-exercises`)}
              />
            ) : null}
            <Button
              variant="icon"
              accessibilityLabel="Add Exercise"
              icon={<Ionicons name="add" size={22} color={colors.primary} />}
              onPress={() => router.push(`/programs/${programIdNum}/${id}/add-exercise`)}
            />
          </View>
        </View>
      ) : null}

      {exercises.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            title="No exercises yet"
            description="Add an exercise to start building this workout."
            ctaLabel="+ Add Exercise"
            onPressCta={() => router.push(`/programs/${programIdNum}/${id}/add-exercise`)}
          />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={reload}
          refreshing={false}
          renderItem={({ item, index }) => (
            <ExerciseRow
              item={item}
              position={index + 1}
              onPress={() => router.push(`/programs/${programIdNum}/${id}/${item.id}/edit`)}
            />
          )}
        />
      )}
    </View>
  );
}

function ExerciseRow({
  item,
  position,
  onPress,
}: {
  item: TemplateExerciseWithDetails;
  position: number;
  onPress: () => void;
}) {
  const target = `${item.targetSets} sets · ${item.targetRepsMin}–${item.targetRepsMax} reps`;
  const extras = [item.rest ? `Rest ${item.rest}` : null, item.notes].filter(Boolean).join(' · ');
  const metadata = extras ? `${target} · ${extras}` : target;

  return (
    <ListRow
      title={`${position}. ${item.exerciseName}`}
      metadata={metadata}
      leading={<IdentityBadge name={item.exerciseName} size={32} />}
      trailing={<Ionicons name="chevron-forward" size={18} color={colors.neutral300} />}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  breadcrumbWrapper: {
    flex: 1,
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
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.neutral500,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  listHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: typography.subtitle.fontSize,
    lineHeight: typography.subtitle.lineHeight,
    color: colors.neutral900,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
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
