import { Stack } from 'expo-router';

export default function ProgramsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[programId]/index" />
      <Stack.Screen name="[programId]/edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[programId]/delete" options={{ presentation: 'transparentModal' }} />
    </Stack>
  );
}
