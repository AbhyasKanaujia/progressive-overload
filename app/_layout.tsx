import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="workouts/index" />
        <Stack.Screen name="exercises/index" />
        <Stack.Screen name="exercises/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
