import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/SafeAreaView';
import { DoctorDropdown } from '@/components/DoctorDropdown';
import { Calendar } from '@/components/CalendarSimple';
import { TimeSlotGrid } from '@/components/TimeSlotGridNew';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDoctors } from '@/lib/api/doctors';
import { subscribeToSlots } from '@/lib/api/slots';
import { holdSlot, bookSlot, releaseHold } from '@/lib/api/clientBooking';
import { Doctor, TimeSlot } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { scale, scaleFont } from '@/lib/utils/responsive';

export default function NewBookingScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  // Estados principales
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [reason, setReason] = useState('');
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cargar doctores
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctors(data);
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    loadDoctors();
  }, []);

  // Suscribirse a slots cuando se selecciona doctor y fecha
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([]);
      return;
    }

    const unsubscribe = subscribeToSlots(
      selectedDoctor.uid, 
      selectedDate, 
      (data) => {
        setSlots(data);
      }
    );

    return () => unsubscribe();
  }, [selectedDoctor, selectedDate]);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
    setHoldId(null);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setHoldId(null);
  };

  const handleSelectSlot = async (slot: TimeSlot) => {
    if (!selectedDoctor) return;

    setLoading(true);
    try {
      const result = await holdSlot({
        doctorId: selectedDoctor.uid,
        slotId: slot.id
      });

      if (result.success && result.holdId && result.expiresAt) {
        setSelectedSlot(slot);
        setHoldId(result.holdId);
        setHoldExpiresAt(result.expiresAt);
      } else {
        Alert.alert(
          'Horario no disponible',
          result.error || 'Ese horario acaba de agendarse. Elige otro.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!holdId || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const result = await bookSlot({
        holdId,
        patientPhone: phone,
        reason: reason || undefined
      });

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        // Mostrar mensajes de error más específicos
        const errorMessage = result.error || 'Error al agendar cita';
        let alertTitle = 'Error';
        
        if (errorMessage.includes('Ya tienes una cita agendada para este día')) {
          alertTitle = 'Cita del Mismo Día';
        } else if (errorMessage.includes('Ya tienes una cita agendada con este doctor')) {
          alertTitle = 'Cita Duplicada';
        } else if (errorMessage.includes('Ya tienes una cita agendada en este horario')) {
          alertTitle = 'Conflicto de Horario';
        } else if (errorMessage.includes('reserva expiró')) {
          alertTitle = 'Reserva Expirada';
        }
        
        Alert.alert(alertTitle, errorMessage);
        handleCancelHold();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      handleCancelHold();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelHold = async () => {
    if (holdId) {
      await releaseHold(holdId);
    }
    setSelectedSlot(null);
    setHoldId(null);
    setHoldExpiresAt(null);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/(patient)/(tabs)/appointments');
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    return format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
  };

  const formatSelectedTime = () => {
    if (!selectedSlot) return '';
    return selectedSlot.startTime;
  };

  const minDate = new Date();
  const maxDate = addDays(new Date(), 90); // 3 meses hacia adelante

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agendar cita</Text>
        </View>

        {/* Selección de dentista */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Seleccionar dentista:</Text>
          <DoctorDropdown
            doctors={doctors}
            selectedDoctor={selectedDoctor}
            onSelectDoctor={handleSelectDoctor}
          />
        </View>

        {/* Selección de fecha */}
        {selectedDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fecha:</Text>
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </View>
        )}

        {/* Fecha seleccionada */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fecha:</Text>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>{formatSelectedDate()}</Text>
            </View>
          </View>
        )}

        {/* Horarios disponibles */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Horarios disponibles:</Text>
            <TimeSlotGrid
              slots={slots}
              selectedSlotId={selectedSlot?.id}
              onSelectSlot={handleSelectSlot}
            />
          </View>
        )}

        {/* Hora seleccionada */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Horarios disponibles:</Text>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>{formatSelectedTime()}</Text>
            </View>
          </View>
        )}

        {/* Teléfono */}
        {selectedSlot && (
          <View style={styles.section}>
            <TextInput
              label="Teléfono"
              placeholder="8116228908"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Motivo */}
        {selectedSlot && (
          <View style={styles.motivoSection}>
            <TextInput
              label="Motivo"
              placeholder="Limpieza, revisión, dolor..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Botón de agendar */}
        {selectedSlot && phone && (
          <View style={styles.buttonContainer}>
            <Button 
              onPress={handleBookAppointment}
              loading={loading}
              disabled={!phone}
              style={styles.bookButton}
              textStyle={styles.bookButtonText}
            >
              Agendar
            </Button>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de confirmación exitosa */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡Tu cita se agendó correctamente!</Text>
            <Button 
              onPress={handleSuccessModalClose}
              style={styles.modalButton}
            >
              Aceptar
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(100), // Espacio extra para evitar que el botón se corte
    flexGrow: 1,
  },
  header: {
    marginBottom: scale(24),
  },
  headerTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  section: {
    marginBottom: scale(20),
  },
  motivoSection: {
    marginBottom: scale(32), // Más espacio para el campo motivo
  },
  sectionLabel: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: scale(8),
  },
  selectedInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedInfoText: {
    fontSize: scaleFont(16),
    color: '#0F172A',
  },
  buttonContainer: {
    marginTop: scale(24),
    marginBottom: scale(40),
    paddingHorizontal: scale(8), // Padding mínimo para evitar que se corte
    width: '100%',
  },
  bookButton: {
    backgroundColor: '#73506E',
    paddingVertical: scale(16),
    paddingHorizontal: scale(32), // Más padding horizontal para evitar texto cortado
    borderRadius: scale(12), // Mantener borderRadius personalizado
    width: '100%', // Asegurar que ocupe todo el ancho disponible
    maxWidth: '100%', // Evitar que se desborde
    minHeight: scale(56), // Altura mínima más generosa para mejor apariencia
    alignItems: 'center', // Centrar el contenido
    justifyContent: 'center', // Centrar el contenido verticalmente
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
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: scale(8), // Padding adicional para el texto
    letterSpacing: 0.5, // Espaciado entre letras para mejor legibilidad
    lineHeight: scaleFont(20), // Altura de línea para evitar corte vertical
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(24),
    width: '100%',
    maxWidth: scale(300),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: scale(20),
  },
  modalButton: {
    backgroundColor: '#73506E',
    paddingHorizontal: scale(32),
    paddingVertical: scale(12),
    borderRadius: scale(8),
  },
});
