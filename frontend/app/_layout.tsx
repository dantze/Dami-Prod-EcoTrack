import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'Login',
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="Driver" />
      <Stack.Screen name="Sales" />
      <Stack.Screen name="Technical" />
    </Stack>
  );
}