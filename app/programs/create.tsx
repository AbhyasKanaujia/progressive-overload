import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { getDatabase } from '../../db/init';
import { createProgram } from '../../db/templates';
import { useDatabase } from '../../hooks/useDatabase';

export default function CreateProgramScreen() {
  const { ready } = useDatabase();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      setError('Program name is required');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const db = await getDatabase();
      await createProgram(db, name.trim(), description.trim() || undefined);
      router.back();
    } catch {
      setError('Failed to save program');
    } finally {
      setSaving(false);
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

      <Text style={styles.title}>Create Program</Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Push Pull Legs"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, (!ready || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>Save Program</Text>
        </TouchableOpacity>
      </View>
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
  form: {
    gap: Spacing.md,
  },
  field: {
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.body,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.body,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: Typography.bodyLarge,
    fontWeight: '700',
  },
});
