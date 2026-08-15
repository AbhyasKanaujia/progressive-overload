import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../../../../components/Button';
import { colors, radius, spacing, typography } from '../../../../constants/theme';
import { getDatabase } from '../../../../db/init';
import { getProgramById } from '../../../../db/templates';
import { useProgramsList } from '../../../../hooks/useProgramsList';

const NAME_MAX = 60;
const DESCRIPTION_MAX = 200;

export default function EditProgramScreen() {
  const router = useRouter();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const id = Number(programId);
  const { editProgram } = useProgramsList();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = await getDatabase();
      const program = await getProgramById(db, id);
      if (!cancelled && program) {
        setName(program.name);
        setDescription(program.description ?? '');
      }
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    let hasError = false;
    if (!trimmedName) {
      setNameError('Enter a program name.');
      hasError = true;
    } else if (trimmedName.length > NAME_MAX) {
      setNameError('Program name must be 60 characters or less.');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (trimmedDescription.length > DESCRIPTION_MAX) {
      setDescriptionError('Description must be 200 characters or less.');
      hasError = true;
    } else {
      setDescriptionError(null);
    }

    if (hasError) {
      return;
    }

    setSubmitting(true);
    try {
      await editProgram(id, trimmedName, trimmedDescription || undefined);
      router.replace(`/programs/${id}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Program</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Program name</Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Upper / Lower Split"
            placeholderTextColor={colors.neutral500}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.multiline, descriptionError && styles.inputError]}
            value={description}
            onChangeText={setDescription}
            placeholder="What is the focus of this program?"
            placeholderTextColor={colors.neutral500}
            multiline
          />
          {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Save Changes"
            onPress={handleSave}
            loading={submitting}
          />
          <Button
            variant="secondary"
            label="Delete Program"
            onPress={() => router.push(`/programs/${id}/delete`)}
          />
          <Button variant="tertiary" label="Cancel" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.xl,
    gap: spacing.xl,
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    color: colors.neutral900,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.subtitle.fontFamily,
    fontSize: typography.subtitle.fontSize,
    lineHeight: typography.subtitle.lineHeight,
    color: colors.neutral900,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.neutral900,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.danger,
  },
  actions: {
    gap: spacing.md,
  },
});
