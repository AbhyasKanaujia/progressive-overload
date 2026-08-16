import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { colors, radius, spacing, typography } from '../../../../../constants/theme';
import { getDatabase } from '../../../../../db/init';
import { getWorkoutTemplateById } from '../../../../../db/templates';
import { useProgram } from '../../../../../hooks/useProgram';

export default function DeleteWorkoutScreen() {
  const router = useRouter();
  const { programId, workoutId } = useLocalSearchParams<{
    programId: string;
    workoutId: string;
  }>();
  const programIdNum = Number(programId);
  const id = Number(workoutId);
  const { removeWorkout } = useProgram(programIdNum);

  const [loading, setLoading] = useState(true);
  const [workoutName, setWorkoutName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (Number.isNaN(id)) {
        console.warn(`DeleteWorkout: invalid workoutId: ${workoutId}`);
        if (!cancelled) setLoading(false);
        return;
      }
      const db = await getDatabase();
      const workout = await getWorkoutTemplateById(db, id);
      if (!cancelled) {
        if (workout) {
          setWorkoutName(workout.name);
        } else {
          console.warn(`DeleteWorkout: workout not found for id: ${id}, raw: ${workoutId}`);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, workoutId]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await removeWorkout(id);
      router.dismissTo(`/programs/${programIdNum}`);
    } catch {
      setError("Couldn't delete the workout. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!workoutName) {
    return (
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Workout not found</Text>
          <Text style={styles.body}>This workout could not be loaded.</Text>
          <View style={styles.actions}>
            <Button variant="primary" label="Go Back" onPress={() => router.back()} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Delete Workout?</Text>
        <Text style={styles.body}>
          {`Are you sure you want to delete "${workoutName}"? This action cannot be undone.`}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button variant="primary" label="Delete" onPress={handleDelete} loading={deleting} />
          <Button variant="tertiary" label="Cancel" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 25, 28, 0.4)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    color: colors.neutral900,
  },
  body: {
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
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
