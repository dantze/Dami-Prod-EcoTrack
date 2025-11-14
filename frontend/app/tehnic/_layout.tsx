import { Stack } from 'expo-router';

export default function SoferLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VestCentru" />
    </Stack>
  );
}