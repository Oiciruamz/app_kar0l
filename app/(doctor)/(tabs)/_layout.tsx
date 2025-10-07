import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function DoctorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#73506E',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color }]}>📅</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Disponibilidad',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color }]}>⏰</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color }]}>👤</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#EDDDE9',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
});

