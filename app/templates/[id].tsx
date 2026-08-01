import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { getDatabase } from '../../db/init';
import {
  deleteTemplateExercise,
  getTemplateExercisesWithDetails,
  getWorkoutTemplateById,
  updateTemplateExercise,
} from '../../db/templates';
import { useDatabase } from '../../hooks/useDatabase';
import type { TemplateExerciseWithDetails } from '../../db/templates';
import type { WorkoutTemplate } from '../../types';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateId = Number(id);
  const { ready } = useDatabase();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [exercises, setExercises] = useState<TemplateExerciseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<TemplateExerciseWithDetails | null>(null);
  const [editSets, setEditSets] = useState('');
  const [editMinReps, setEditMinReps] = useState('');
  const [editMaxReps, setEditMaxReps] = useState('');

  const loadData = useCallback(async () => {
    if (Number.isNaN(templateId)) {
      setLoading(false);
      return;
    }
    try {
      const db = await getDatabase();
      const wt = await getWorkoutTemplateById(db, templateId);
      setTemplate(wt);
      if (wt) {
        const list = await getTemplateExercisesWithDetails(db, templateId);
        setExercises(list);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      loadData();
    }, [ready, loadData])
  );

  async function handleDelete(exerciseId: number) {
    Alert.alert('Delete Exercise', 'Remove this exercise from the template?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const db = await getDatabase();
            await deleteTemplateExercise(db, exerciseId);
            await loadData();
          } catch {
            Alert.alert('Error', 'Failed to delete exercise');
          }
        },
      },
    ]);
  }

  async function moveUp(index: number) {
    if (index <= 0) return;
    try {
      const db = await getDatabase();
      const above = exercises[index - 1];
      const current = exercises[index];
      await updateTemplateExercise(
        db,
        above.id,
        current.orderIndex,
        above.targetSets,
        above.targetRepsMin,
        above.targetRepsMax
      );
      await updateTemplateExercise(
        db,
        current.id,
        above.orderIndex,
        current.targetSets,
        current.targetRepsMin,
        current.targetRepsMax
      );
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to reorder');
    }
  }

  async function moveDown(index: number) {
    if (index >= exercises.length - 1) return;
    try {
      const db = await getDatabase();
      const below = exercises[index + 1];
      const current = exercises[index];
      await updateTemplateExercise(
        db,
        below.id,
        current.orderIndex,
        below.targetSets,
        below.targetRepsMin,
        below.targetRepsMax
      );
      await updateTemplateExercise(
        db,
        current.id,
        below.orderIndex,
        current.targetSets,
        current.targetRepsMin,
        current.targetRepsMax
      );
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to reorder');
    }
  }

  function openEdit(ex: TemplateExerciseWithDetails) {
    setEditing(ex);
    setEditSets(String(ex.targetSets));
    setEditMinReps(String(ex.targetRepsMin));
    setEditMaxReps(String(ex.targetRepsMax));
  }

  function closeEdit() {
    setEditing(null);
    setEditSets('');
    setEditMinReps('');
    setEditMaxReps('');
  }

  async function saveEdit() {
    if (!editing) return;
    const sets = Number(editSets);
    const min = Number(editMinReps);
    const max = Number(editMaxReps);
    if (Number.isNaN(sets) || Number.isNaN(min) || Number.isNaN(max)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }
    try {
      const db = await getDatabase();
      await updateTemplateExercise(db, editing.id, editing.orderIndex, sets, min, max);
      closeEdit();
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to update exercise');
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Template not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg + insets.top, paddingBottom: Spacing.lg + insets.bottom },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{template.name}</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/templates/addExercise',
              params: { templateId: String(templateId) },
            })
          }
        >
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>

        {exercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises in this template yet.</Text>
        ) : (
          exercises.map((ex, index) => (
            <TouchableOpacity key={ex.id} style={styles.card} onPress={() => openEdit(ex)}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                  <Text style={styles.exerciseMeta}>{ex.equipment}</Text>
                </View>
                <View style={styles.cardActions}>
                  {index > 0 && (
                    <TouchableOpacity onPress={() => moveUp(index)} style={styles.actionBtn}>
                      <Text style={styles.actionText}>↑</Text>
                    </TouchableOpacity>
                  )}
                  {index < exercises.length - 1 && (
                    <TouchableOpacity onPress={() => moveDown(index)} style={styles.actionBtn}>
                      <Text style={styles.actionText}>↓</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(ex.id)} style={styles.actionBtn}>
                    <Text style={[styles.actionText, styles.deleteAction]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.targetBadge}>
                <Text style={styles.targetText}>
                  Sets {ex.targetSets} | {ex.targetRepsMin}–{ex.targetRepsMax} reps
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={editing !== null}
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Exercise</Text>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Sets</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editSets}
                onChangeText={setEditSets}
                placeholder="3"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Min Reps</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editMinReps}
                onChangeText={setEditMinReps}
                placeholder="8"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Max Reps</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editMaxReps}
                onChangeText={setEditMaxReps}
                placeholder="12"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeEdit}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.text,
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  exerciseMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
  actionText: {
    color: Colors.primary,
    fontSize: Typography.bodyLarge,
    fontWeight: '600',
  },
  deleteAction: {
    color: Colors.error,
  },
  targetBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
  },
  targetText: {
    color: Colors.primary,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    width: '100%',
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.heading,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  inputRow: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    color: Colors.text,
    borderRadius: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.body,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  saveBtnText: {
    color: Colors.background,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  cancelBtn: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
