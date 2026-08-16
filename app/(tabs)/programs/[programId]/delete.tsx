import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { colors, radius, spacing, typography } from '../../../../constants/theme';
import { getDatabase } from '../../../../db/init';
import { getProgramById } from '../../../../db/templates';
import { useProgramsList } from '../../../../hooks/useProgramsList';

export default function DeleteProgramScreen() {
  const router = useRouter();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const rawProgramId = programId;
  const id = Number(rawProgramId);
  const { removeProgram } = useProgramsList();

  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (Number.isNaN(id)) {
        console.warn(`DeleteProgram: invalid programId: ${rawProgramId}`);
        if (!cancelled) setLoading(false);
        return;
      }
      const db = await getDatabase();
      const program = await getProgramById(db, id);
      if (!cancelled) {
        if (program) {
          setProgramName(program.name);
        } else {
          console.warn(`DeleteProgram: program not found for id: ${id}, raw: ${rawProgramId}`);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, rawProgramId]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await removeProgram(id);
      router.dismissTo('/programs');
    } catch {
      setError("Couldn't delete the program. Please try again.");
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

  if (!programName) {
    return (
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Program not found</Text>
          <Text style={styles.body}>This program could not be loaded.</Text>
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
        <Text style={styles.title}>Delete Program?</Text>
        <Text style={styles.body}>
          {`Are you sure you want to delete "${programName}"? This action cannot be undone.`}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button
            variant="primary"
            label="Delete Program"
            onPress={handleDelete}
            loading={deleting}
          />
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
