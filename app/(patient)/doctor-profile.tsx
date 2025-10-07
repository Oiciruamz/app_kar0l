import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { Button } from '@/components/ui/Button';
import { getDoctorById } from '@/lib/api/doctors';
import { Doctor } from '@/lib/types';

interface DoctorSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export default function DoctorProfileScreen() {
  const router = useRouter();
  const { doctorId } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // Horarios de ejemplo basados en la imagen
  const defaultSchedule: DoctorSchedule[] = [
    { day: 'Lunes', startTime: '11:00 am', endTime: '6:30 pm' },
    { day: 'Martes', startTime: '11:00 am', endTime: '6:30 pm' },
    { day: 'Miércoles', startTime: '11:00 am', endTime: '3:30 pm' },
    { day: 'Jueves', startTime: '10:30 am', endTime: '7:00 pm' },
  ];

  useEffect(() => {
    const loadDoctor = async () => {
      if (!doctorId || typeof doctorId !== 'string') {
        Alert.alert('Error', 'Doctor no encontrado');
        router.back();
        return;
      }

      try {
        const doctorData = await getDoctorById(doctorId);
        if (doctorData) {
          setDoctor(doctorData);
        } else {
          Alert.alert('Error', 'Doctor no encontrado');
          router.back();
        }
      } catch (error) {
        console.error('Error loading doctor:', error);
        Alert.alert('Error', 'Error al cargar el perfil del doctor');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  const handleBookAppointment = () => {
    router.push('/(patient)/new-booking');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppBar title="Cargando..." showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.container}>
        <AppBar title="Error" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Doctor no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar title="Perfil del Doctor" showBack />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Foto del doctor */}
        <View style={styles.photoContainer}>
          {doctor.photoURL ? (
            <Image source={{ uri: doctor.photoURL }} style={styles.doctorPhoto} />
          ) : (
            <View style={[styles.doctorPhoto, styles.photoPlaceholder]}>
              <Text style={styles.photoPlaceholderText}>
                {doctor.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Información del doctor */}
        <View style={styles.infoContainer}>
          <Text style={styles.doctorName}>{doctor.displayName}</Text>
          <Text style={styles.doctorSpecialty}>
            {doctor.specialty || 'Odontólogo de práctica general'}
          </Text>
          
          {/* Descripción */}
          <Text style={styles.description}>
            {doctor.bio || `con 6 años de experiencia. Ofrece tratamientos de prevención, resinas estéticas, limpieza y colocación de coronas y puentes.`}
          </Text>
        </View>

        {/* Horario */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Horario</Text>
          {defaultSchedule.map((schedule, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>{schedule.day}:</Text>
              <Text style={styles.scheduleTime}>
                {schedule.startTime} - {schedule.endTime}
              </Text>
            </View>
          ))}
        </View>

        {/* Botón de agendar cita */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={handleBookAppointment}
            style={styles.bookButton}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Agendar cita</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  photoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  doctorPhoto: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  photoPlaceholder: {
    backgroundColor: '#B7ACB4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 60,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  doctorSpecialty: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  scheduleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#73506E',
    paddingVertical: 16,
    paddingHorizontal: 32, // Más padding horizontal para evitar texto cortado
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Altura mínima más generosa
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8, // Padding adicional para el texto
    letterSpacing: 0.5, // Espaciado entre letras para mejor legibilidad
    lineHeight: 20, // Altura de línea para evitar corte vertical
  },
});
