import { Stack } from 'expo-router';

export default function DoctorTabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="agenda" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

