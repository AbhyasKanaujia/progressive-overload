import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Chip } from '../../../components/Chip';
import { EmptyState } from '../../../components/EmptyState';
import { IdentityBadge } from '../../../components/IdentityBadge';
import { colors, spacing, typography } from '../../../constants/theme';
import { ProgramListItem, useProgramsList } from '../../../hooks/useProgramsList';
import { useAppStore } from '../../../store';

export default function ProgramsListScreen() {
  const router = useRouter();
  const { programs, loading, error, refresh } = useProgramsList();
  const activeProgramId = useAppStore((state) => state.activeProgramId);

  const openActions = (program: ProgramListItem) => {
    Alert.alert(program.name, undefined, [
      {
        text: 'Edit Program',
        onPress: () => router.push(`/programs/${program.id}/edit`),
      },
      {
        text: 'Delete Program',
        style: 'destructive',
        onPress: () => router.push(`/programs/${program.id}/delete`),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
        {programs.length > 0 ? (
          <Button
            variant="primary"
            label="Create Program"
            onPress={() => router.push('/programs/add')}
          />
        ) : null}
      </View>

      {programs.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            title="No programs yet"
            description="Create your first program to get started."
            ctaLabel="Create Program"
            onPressCta={() => router.push('/programs/add')}
          />
        </View>
      ) : (
        <FlatList
          data={programs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={false}
          renderItem={({ item }) => (
            <Card
              title={item.name}
              metadata={`${item.workoutCount} workouts · ${item.exerciseCount} exercises`}
              leading={<IdentityBadge name={item.name} />}
              chip={item.id === activeProgramId ? <Chip label="Active" selected /> : undefined}
              trailing={
                <Button
                  variant="icon"
                  accessibilityLabel={`${item.name} actions`}
                  icon={<Ionicons name="ellipsis-vertical" size={20} color={colors.neutral500} />}
                  onPress={() => openActions(item)}
                />
              }
              onPress={() => router.push(`/programs/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.neutral500,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.display.fontFamily,
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
    color: colors.neutral900,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
});
