import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { DoctorCard } from '@/components/DoctorCard';
import { getDoctors } from '@/lib/api/doctors';
import { Doctor } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDoctors();
  };

  const handleDoctorPress = (doctor: Doctor) => {
    router.push({
      pathname: '/(patient)/doctor-profile',
      params: { doctorId: doctor.uid }
    });
  };

  return (
    <View style={styles.container}>
      <AppBar title="Dentistas" />
      
      <FlatList
        data={doctors}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <DoctorCard 
            doctor={item} 
            onPress={() => handleDoctorPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando...' : 'No hay dentistas disponibles'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  list: {
    padding: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

