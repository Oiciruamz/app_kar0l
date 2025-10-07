import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { TabIcon } from '@/components/icons/TabIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';

export default function PatientLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  // Determinar si estamos en una pantalla de tabs o en una pantalla modal
  const isInTabs = segments[segments.length - 1] === 'home' || 
                   segments[segments.length - 1] === 'appointments' || 
                   segments[segments.length - 1] === 'profile';

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="doctor-profile" />
        <Stack.Screen name="new-booking" />
      </Stack>
      
      {/* Barra de navegación siempre visible */}
      <View style={[styles.tabBar, { 
        height: Platform.OS === 'ios' ? 49 + insets.bottom : 60,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
      }]}>
        <View style={styles.tabContainer}>
          <TabIcon 
            name="home" 
            size={24} 
            color={isInTabs && segments[segments.length - 1] === 'home' ? '#73506E' : '#6B7280'} 
            onPress={() => router.push('/(patient)/(tabs)/home')}
          />
          <TabIcon 
            name="calendar" 
            size={24} 
            color={isInTabs && segments[segments.length - 1] === 'appointments' ? '#73506E' : '#6B7280'} 
            onPress={() => router.push('/(patient)/(tabs)/appointments')}
          />
          <TabIcon 
            name="person" 
            size={24} 
            color={isInTabs && segments[segments.length - 1] === 'profile' ? '#73506E' : '#6B7280'} 
            onPress={() => router.push('/(patient)/(tabs)/profile')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#EDDDE9',
    paddingTop: 4,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    shadowColor: '#73506E',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(115, 80, 110, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 44,
  },
});

