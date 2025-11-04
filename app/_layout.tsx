import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/hooks/useAuth';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDoctorGroup = segments[0] === '(doctor)';
    const inPatientGroup = segments[0] === '(patient)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && profile) {
      if (inAuthGroup) {
        // Redirect to appropriate role screen
        if (profile.role === 'doctor') {
          router.replace('/(doctor)/(tabs)/agenda');
        } else {
          router.replace('/(patient)/(tabs)/home');
        }
      } else if (inDoctorGroup && profile.role !== 'doctor') {
        router.replace('/(patient)/(tabs)/home');
      } else if (inPatientGroup && profile.role !== 'patient') {
        router.replace('/(doctor)/(tabs)/agenda');
      }
    }
  }, [isAuthenticated, profile, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(doctor)" />
      <Stack.Screen name="(patient)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

