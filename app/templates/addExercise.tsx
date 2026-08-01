import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { getDatabase } from '../../db/init';
import { getExercisesWithMovementPattern } from '../../db/library';
import { createTemplateExercise, getTemplateExercises } from '../../db/templates';
import { useDatabase } from '../../hooks/useDatabase';
import { groupExercisesByCategory, type GroupedExercises } from '../exercises/groupExercises';

export default function AddExerciseScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const id = Number(templateId);
  const { ready } = useDatabase();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [grouped, setGrouped] = useState<GroupedExercises>({});

  useEffect(() => {
    if (!ready || Number.isNaN(id)) return;

    getDatabase()
      .then(async (db) => {
        const exercises = await getExercisesWithMovementPattern(db);
        setGrouped(groupExercisesByCategory(exercises));
      })
      .catch(() => {
        // Silently fail
      });
  }, [ready, id]);

  async function handleSelect(exerciseId: number) {
    try {
      const db = await getDatabase();
      const existing = await getTemplateExercises(db, id);
      const nextOrderIndex = existing.length;
      await createTemplateExercise(db, id, exerciseId, nextOrderIndex, 3, 8, 12);
      router.back();
    } catch {
      // Silently fail
    }
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

      <Text style={styles.title}>Add Exercise</Text>

      {Object.entries(grouped).map(([category, patterns]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {Object.entries(patterns).map(([patternName, exercises]) => (
            <View key={patternName} style={styles.patternSection}>
              <Text style={styles.patternTitle}>{patternName}</Text>
              {exercises.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.exerciseRow}
                  onPress={() => handleSelect(ex.id)}
                >
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseEquipment}>{ex.equipment}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      ))}
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
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryTitle: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  patternSection: {
    marginBottom: Spacing.md,
  },
  patternTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  exerciseName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  exerciseEquipment: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
