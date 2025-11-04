import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { TabIcon } from '@/components/icons/TabIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';

export default function DoctorLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  // Determinar si estamos en una pantalla de tabs o en una pantalla modal
  const isInTabs = segments[segments.length - 1] === 'agenda' || 
                   segments[segments.length - 1] === 'availability' || 
                   segments[segments.length - 1] === 'profile';

  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 60;

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, { paddingBottom: tabBarHeight }]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="appointment-detail" />
        </Stack>
      </View>
      
      {/* Barra de navegación siempre visible */}
      <View style={[styles.tabBar, { 
        height: tabBarHeight,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
      }]}>
        <View style={styles.tabContainer}>
          <TabIcon 
            name="calendar" 
            size={24} 
            color={isInTabs && segments[segments.length - 1] === 'agenda' ? '#73506E' : '#6B7280'} 
            onPress={() => router.push('/(doctor)/(tabs)/agenda')}
          />
          <TabIcon 
            name="notes" 
            size={24} 
            color={isInTabs && segments[segments.length - 1] === 'availability' ? '#73506E' : '#6B7280'} 
            onPress={() => router.push('/(doctor)/(tabs)/availability')}
          />
          <TabIcon 
            name="person" 
            size={24} 
            color={isInTabs && segments[segments.length - 1] === 'profile' ? '#73506E' : '#6B7280'} 
            onPress={() => router.push('/(doctor)/(tabs)/profile')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
    backgroundColor: '#EDDDE9',
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 20,
    marginHorizontal: 0,
    marginBottom: 0,
    shadowColor: '#73506E',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(115, 80, 110, 0.15)',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 44,
  },
});

