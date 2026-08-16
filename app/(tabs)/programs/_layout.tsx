import { Platform } from 'react-native';
import { Stack } from 'expo-router';

const modalAnimation = Platform.OS === 'android' ? 'slide_from_bottom' : undefined;

export default function ProgramsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" options={{ presentation: 'modal', animation: modalAnimation }} />
      <Stack.Screen name="[programId]/index" />
      <Stack.Screen
        name="[programId]/edit"
        options={{ presentation: 'modal', animation: modalAnimation }}
      />
      <Stack.Screen
        name="[programId]/delete"
        options={{ presentation: 'transparentModal', animation: modalAnimation }}
      />
      <Stack.Screen
        name="[programId]/reorder-workouts"
        options={{ presentation: 'modal', animation: modalAnimation }}
      />
      <Stack.Screen
        name="[programId]/add-workout"
        options={{ presentation: 'modal', animation: modalAnimation }}
      />
      <Stack.Screen name="[programId]/[workoutId]/index" />
    </Stack>
  );
}
