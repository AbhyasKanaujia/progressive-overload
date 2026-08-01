import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { getDatabase } from '../../db/init';
import {
  getExerciseById,
  getMovementPatternById,
  getExerciseAlternativesWithPattern,
} from '../../db/library';
import { useDatabase } from '../../hooks/useDatabase';
import type { Exercise, MovementPattern } from '../../types';
import type { ExerciseWithPattern } from '../../db/library';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = Number(id);
  const { ready } = useDatabase();
  const router = useRouter();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [pattern, setPattern] = useState<MovementPattern | null>(null);
  const [alternatives, setAlternatives] = useState<ExerciseWithPattern[]>([]);

  useEffect(() => {
    if (!ready || Number.isNaN(exerciseId)) return;

    getDatabase()
      .then(async (db) => {
        const ex = await getExerciseById(db, exerciseId);
        if (!ex) return;
        setExercise(ex);

        const pat = await getMovementPatternById(db, ex.movementPatternId);
        setPattern(pat);

        const alts = await getExerciseAlternativesWithPattern(db, exerciseId);
        setAlternatives(alts);
      })
      .catch(() => {
        // Silently fail; empty state is acceptable.
      });
  }, [ready, exerciseId]);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Exercise not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{exercise.name}</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Movement Pattern</Text>
          <Text style={styles.value}>{pattern?.name ?? 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Muscle Groups</Text>
          <Text style={styles.value}>{exercise.muscleGroups}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Equipment</Text>
          <Text style={styles.value}>{exercise.equipment}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Difficulty</Text>
          <Text style={styles.value}>{exercise.difficulty}</Text>
        </View>
      </View>

      {alternatives.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternatives</Text>
          {alternatives.map((alt) => (
            <View key={alt.id} style={styles.alternativeRow}>
              <Text style={styles.alternativeName}>{alt.name}</Text>
              <Text style={styles.alternativeMeta}>
                {alt.movementPatternName} • {alt.equipment}
              </Text>
            </View>
          ))}
        </View>
      )}
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
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  value: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  alternativeRow: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  alternativeName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  alternativeMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginTop: 2,
  },
});
