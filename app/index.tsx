import { useCallback, useEffect, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { getDatabase } from '../db/init';
import { getProgramById, getPrograms } from '../db/templates';
import { getUserSetting } from '../db/settings';
import { useAppStore } from '../store';
import { useDatabase } from '../hooks/useDatabase';
import type { Program } from '../types';

export default function HomeScreen() {
  const { ready } = useDatabase();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeProgramId, setActiveProgramId } = useAppStore();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Hydrate activeProgramId from DB on first ready
  useEffect(() => {
    if (!ready) return;

    getDatabase()
      .then(async (db) => {
        const raw = await getUserSetting(db, 'active_program_id');
        if (raw) {
          const id = Number(raw);
          if (!Number.isNaN(id) && useAppStore.getState().activeProgramId !== id) {
            useAppStore.getState().setActiveProgramId(id);
          }
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, [ready]);

  // Refresh programs list on focus; validate active program still exists
  useFocusEffect(
    useCallback(() => {
      if (!ready) return;

      let cancelled = false;

      getDatabase()
        .then(async (db) => {
          const list = await getPrograms(db);
          if (cancelled) return;

          setPrograms(list);
          setHasLoaded(true);

          const currentId = useAppStore.getState().activeProgramId;
          if (currentId) {
            const prog = await getProgramById(db, currentId);
            if (!prog && !cancelled) {
              useAppStore.getState().setActiveProgramId(null);
            }
          }
        })
        .catch(() => {
          if (!cancelled) setHasLoaded(true);
        });

      return () => {
        cancelled = true;
      };
    }, [ready])
  );

  const activeProgram = activeProgramId
    ? (programs.find((p) => p.id === activeProgramId) ?? null)
    : null;

  if (!hasLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Spacing.lg + insets.top,
            paddingBottom: Spacing.lg + insets.bottom,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Progressive Overload</Text>

        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>
            {activeProgram ? 'Current Program' : 'No Active Program'}
          </Text>
          <Text style={styles.activeName}>
            {activeProgram?.name ?? 'Select a program to get started'}
          </Text>
          {activeProgram?.description ? (
            <Text style={styles.activeDescription} numberOfLines={2}>
              {activeProgram.description}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.startButton, !activeProgram && styles.startButtonDisabled]}
            onPress={() => router.push('/workouts')}
            disabled={!activeProgram}
          >
            <Text
              style={[styles.startButtonText, !activeProgram && styles.startButtonTextDisabled]}
            >
              Start Workout
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.programsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Programs</Text>
            <TouchableOpacity onPress={() => router.push('/programs/create')}>
              <Text style={styles.newProgramLink}>+ New</Text>
            </TouchableOpacity>
          </View>

          {programs.length === 0 ? (
            <Text style={styles.emptyText}>No programs yet.</Text>
          ) : (
            programs.map((program) => (
              <TouchableOpacity
                key={program.id}
                style={styles.programRow}
                onPress={() => router.push(`/programs/${program.id}`)}
              >
                <Text style={styles.programRowName}>{program.name}</Text>
                <Text style={styles.programRowArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: Typography.heading,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  activeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  activeLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  activeName: {
    color: Colors.text,
    fontSize: Typography.heading,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  activeDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginBottom: Spacing.md,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    opacity: 0.5,
  },
  startButtonText: {
    color: Colors.background,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
  },
  startButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  programsSection: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
  },
  newProgramLink: {
    color: Colors.primary,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  programRowName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  programRowArrow: {
    color: Colors.textSecondary,
    fontSize: Typography.bodyLarge,
  },
});
