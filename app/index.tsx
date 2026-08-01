import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progressive Overload</Text>
      <Text style={styles.subtitle}>Track. Progress. Grow.</Text>
      <Link href="/workouts" style={styles.link}>
        Go to Workouts
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  link: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
