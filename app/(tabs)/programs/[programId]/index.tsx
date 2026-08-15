import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../../../components/Button';
import { Breadcrumb } from '../../../../components/Breadcrumb';
import { colors, spacing, typography } from '../../../../constants/theme';
import { getDatabase } from '../../../../db/init';
import { getProgramById } from '../../../../db/templates';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const rawProgramId = programId;
  const id = Number(rawProgramId);

  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (Number.isNaN(id)) {
        console.warn(`ProgramDetail: invalid programId: ${rawProgramId}`);
        if (!cancelled) setLoading(false);
        return;
      }
      const db = await getDatabase();
      const program = await getProgramById(db, id);
      if (!cancelled) {
        if (program) {
          setProgramName(program.name);
        } else {
          console.warn(`ProgramDetail: program not found for id: ${id}, raw: ${rawProgramId}`);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, rawProgramId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!programName) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Program not found.</Text>
        <View style={styles.cta}>
          <Button variant="primary" label="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Breadcrumb
        items={[{ label: 'Programs', onPress: () => router.back() }, { label: programName }]}
      />
      <Text style={styles.title}>{programName}</Text>
      <Text style={styles.placeholder}>Workout list coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    color: colors.neutral900,
  },
  placeholder: {
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
  cta: {
    marginTop: spacing.lg,
  },
});
