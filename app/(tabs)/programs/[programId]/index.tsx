import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Breadcrumb } from '../../../../components/Breadcrumb';
import { colors, spacing, typography } from '../../../../constants/theme';
import { getDatabase } from '../../../../db/init';
import { getProgramById } from '../../../../db/templates';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const id = Number(programId);

  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = await getDatabase();
      const program = await getProgramById(db, id);
      if (!cancelled && program) {
        setProgramName(program.name);
      }
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
});
