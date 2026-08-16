import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Breadcrumb } from '../../../../components/Breadcrumb';
import { Button } from '../../../../components/Button';
import { Chip } from '../../../../components/Chip';
import { EmptyState } from '../../../../components/EmptyState';
import { ListRow } from '../../../../components/ListRow';
import { colors, spacing, typography } from '../../../../constants/theme';
import { WorkoutListItem, useProgram } from '../../../../hooks/useProgram';
import { useReloadOnFocus } from '../../../../hooks/useReloadOnFocus';
import { useAppStore } from '../../../../store';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const id = Number(programId);
  const { program, workouts, loading, error, reload } = useProgram(id);
  const activeProgramId = useAppStore((state) => state.activeProgramId);

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

  if (!program) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Program not found.</Text>
        <View style={styles.cta}>
          <Button variant="primary" label="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const isActive = program.id === activeProgramId;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Breadcrumb
          items={[{ label: 'Programs', onPress: () => router.back() }, { label: program.name }]}
        />
        <View style={styles.headerActions}>
          <Button
            variant="icon"
            accessibilityLabel="Edit Program"
            icon={<Ionicons name="create-outline" size={20} color={colors.neutral500} />}
            onPress={() => router.push(`/programs/${program.id}/edit`)}
          />
          <Button
            variant="icon"
            accessibilityLabel="Delete Program"
            icon={<Ionicons name="trash-outline" size={20} color={colors.neutral500} />}
            onPress={() => router.push(`/programs/${program.id}/delete`)}
          />
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {program.name}
        </Text>
        {isActive ? <Chip label="Active" selected /> : null}
      </View>
      {program.description ? <Text style={styles.description}>{program.description}</Text> : null}

      {workouts.length > 0 ? (
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Workouts</Text>
          <View style={styles.listHeaderActions}>
            {workouts.length > 1 ? (
              <Button
                variant="icon"
                accessibilityLabel="Reorder Workouts"
                icon={<Ionicons name="reorder-three" size={20} color={colors.neutral500} />}
                onPress={() => router.push(`/programs/${program.id}/reorder-workouts`)}
              />
            ) : null}
            <Button
              variant="icon"
              accessibilityLabel="Add Workout"
              icon={<Ionicons name="add" size={22} color={colors.primary} />}
              onPress={() => router.push(`/programs/${program.id}/add-workout`)}
            />
          </View>
        </View>
      ) : null}

      {workouts.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            title="No workouts yet"
            description="Add a workout to start building this program."
            ctaLabel="+ Add Workout"
            onPressCta={() => router.push(`/programs/${program.id}/add-workout`)}
          />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={reload}
          refreshing={false}
          renderItem={({ item, index }) => (
            <WorkoutRow
              item={item}
              position={index + 1}
              onPress={() => router.push(`/programs/${program.id}/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

function WorkoutRow({
  item,
  position,
  onPress,
}: {
  item: WorkoutListItem;
  position: number;
  onPress: () => void;
}) {
  return (
    <ListRow
      title={item.name}
      metadata={`${item.exerciseCount} exercises`}
      leading={
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>{position}</Text>
        </View>
      }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.neutral700,
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
