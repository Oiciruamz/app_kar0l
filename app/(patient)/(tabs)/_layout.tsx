import { Stack } from 'expo-router';

export default function PatientTabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

