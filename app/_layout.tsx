import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="workouts" options={{ title: 'Workouts' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
