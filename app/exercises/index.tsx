import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { getDatabase } from '../../db/init';
import { getExercisesWithMovementPattern } from '../../db/library';
import { useDatabase } from '../../hooks/useDatabase';
import { groupExercisesByCategory, type GroupedExercises } from './groupExercises';

export default function ExerciseLibraryScreen() {
  const { ready } = useDatabase();
  const [grouped, setGrouped] = useState<GroupedExercises>({});
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    getDatabase()
      .then(async (db) => {
        const exercises = await getExercisesWithMovementPattern(db);
        setGrouped(groupExercisesByCategory(exercises));
      })
      .catch(() => {
        // Silently fail; empty list is acceptable for now.
      });
  }, [ready]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Exercise Library</Text>
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
                  onPress={() => router.push(`/exercises/${ex.id}`)}
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
