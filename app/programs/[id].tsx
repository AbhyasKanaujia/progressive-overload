import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { getDatabase } from '../../db/init';
import { deleteProgram, getProgramById, getWorkoutTemplates } from '../../db/templates';
import { setUserSetting } from '../../db/settings';
import { useDatabase } from '../../hooks/useDatabase';
import { useAppStore } from '../../store';
import type { Program, WorkoutTemplate } from '../../types';

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const programId = Number(id);
  const { ready } = useDatabase();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeProgramId, setActiveProgramId } = useAppStore();

  const [program, setProgram] = useState<Program | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  const isActive = activeProgramId === programId;

  useEffect(() => {
    if (!ready || Number.isNaN(programId)) return;

    getDatabase()
      .then(async (db) => {
        const prog = await getProgramById(db, programId);
        if (!prog) return;
        setProgram(prog);

        const wts = await getWorkoutTemplates(db, programId);
        setTemplates(wts);
      })
      .catch(() => {
        // Silently fail
      });
  }, [ready, programId]);

  function confirmDelete() {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${program?.name}"? This will also remove its workout templates but keep session history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
  }

  async function handleDelete() {
    try {
      const db = await getDatabase();
      await deleteProgram(db, programId);
      if (isActive) {
        await setUserSetting(db, 'active_program_id', null);
        setActiveProgramId(null);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to delete program');
    }
  }

  if (!program) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Program not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Spacing.lg + insets.top, paddingBottom: Spacing.lg + insets.bottom },
      ]}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{program.name}</Text>
      {program.description ? <Text style={styles.description}>{program.description}</Text> : null}

      <TouchableOpacity
        style={[styles.activeButton, isActive && styles.activeButtonActive]}
        onPress={() => setActiveProgramId(isActive ? null : programId)}
      >
        <Text style={[styles.activeButtonText, isActive && styles.activeButtonTextActive]}>
          {isActive ? '✓ Active Program' : 'Set as Active Program'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Templates</Text>
        {templates.length === 0 ? (
          <Text style={styles.emptyText}>No workout templates yet.</Text>
        ) : (
          templates.map((wt) => (
            <View key={wt.id} style={styles.templateCard}>
              <Text style={styles.templateName}>{wt.name}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteButtonText}>Delete Program</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.md,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: Typography.heading,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginBottom: Spacing.lg,
  },
  activeButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  activeButtonActive: {
    backgroundColor: Colors.primary,
  },
  activeButtonText: {
    color: Colors.primary,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  activeButtonTextActive: {
    color: Colors.background,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  templateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  templateName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
  },
});
