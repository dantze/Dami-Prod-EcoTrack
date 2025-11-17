import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="sofer" />
      <Stack.Screen name="vanzari" />
      <Stack.Screen name="tehnic" />
    </Stack>
  );
}