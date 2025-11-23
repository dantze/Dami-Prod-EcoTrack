import { Stack } from 'expo-router';

export default function VanzariLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VestCentru" />
      <Stack.Screen name="CreateClient" />
    </Stack>
  );
}