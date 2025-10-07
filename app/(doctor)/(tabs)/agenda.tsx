import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { AppBar } from '@/components/AppBar';
import { AppointmentItem } from '@/components/AppointmentItem';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAppointmentsByDoctor } from '@/lib/api/appointments';
import { Appointment } from '@/lib/types';

export default function AgendaScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      const data = await getAppointmentsByDoctor(user.uid);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // Filtrar citas agendadas y ordenarlas por fecha y hora
  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'Agendada')
    .sort((a, b) => {
      // Ordenar por fecha primero, luego por hora
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <View style={styles.container}>
      <AppBar title="Mi Agenda" />
      
      {/* Contador de citas */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {upcomingAppointments.length} cita{upcomingAppointments.length !== 1 ? 's' : ''} agendada{upcomingAppointments.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <FlatList
        data={upcomingAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentItem appointment={item} showPatientName />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando...' : 'Aún no hay citas.'}
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
  counterContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#73506E',
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

