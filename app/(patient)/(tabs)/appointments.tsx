import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  Alert,
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/SafeAreaView';
import { AppBar } from '@/components/AppBar';
import { AppointmentItem } from '@/components/AppointmentItem';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { getAppointmentsByPatient } from '@/lib/api/appointments';
import { cancelAppointment } from '@/lib/api/clientBooking';
import { Appointment } from '@/lib/types';
import { isPast, parse } from 'date-fns';
import { scale, scaleFont } from '@/lib/utils/responsive';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = async () => {
    if (!user) {
      console.log('❌ AppointmentsScreen - No hay usuario autenticado');
      return;
    }
    
    console.log('🔍 AppointmentsScreen - Cargando citas para usuario:', user.uid);
    
    try {
      const data = await getAppointmentsByPatient(user.uid);
      console.log('🔍 AppointmentsScreen - Citas recibidas:', data.length);
      console.log('🔍 AppointmentsScreen - Primera cita:', data[0] ? {
        id: data[0].id,
        date: data[0].date,
        startTime: data[0].startTime,
        doctorName: data[0].doctorName,
        status: data[0].status
      } : 'No hay citas');
      
      setAppointments(data);
    } catch (error) {
      console.error('❌ AppointmentsScreen - Error loading appointments:', error);
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

  const handleBookAppointment = () => {
    router.push('/(patient)/new-booking');
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    const appointmentDate = parse(
      `${appointment.date} ${appointment.startTime}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );

    if (isPast(appointmentDate)) {
      Alert.alert('Error', 'No puedes cancelar una cita pasada');
      return;
    }

    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro que deseas cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cancelAppointment(appointment.id);
              if (result.success) {
                Alert.alert('Éxito', 'Cita cancelada correctamente');
                loadAppointments();
              } else {
                Alert.alert('Error', result.error || 'Error al cancelar cita');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View>
      <AppointmentItem appointment={item} showDoctorName />
      {item.status === 'Agendada' && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleCancelAppointment(item)}
        >
          <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Log del estado del componente
  console.log('🔍 AppointmentsScreen - Render. Estado actual:');
  console.log('   - loading:', loading);
  console.log('   - appointments.length:', appointments.length);
  console.log('   - user:', user ? user.uid : 'No hay usuario');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis citas</Text>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookButtonText}>Agendar cita</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    backgroundColor: '#EDDDE9',
    minHeight: scale(56),
  },
  headerTitle: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: scale(16),
  },
  bookButton: {
    backgroundColor: '#73506E',
    paddingHorizontal: scale(16), // Más padding horizontal
    paddingVertical: scale(10), // Más padding vertical
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(120), // Ancho mínimo más generoso
    minHeight: scale(40), // Altura mínima más generosa
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(13),
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: scale(4), // Padding adicional para el texto
    letterSpacing: 0.3, // Espaciado entre letras para mejor legibilidad
    lineHeight: scaleFont(16), // Altura de línea para evitar corte vertical
  },
  list: {
    padding: scale(16),
  },
  empty: {
    padding: scale(32),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scaleFont(16),
    color: '#6B7280',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(999),
    padding: scale(12),
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: scaleFont(14),
  },
});

