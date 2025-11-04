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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  getAppointmentById, 
  getAppointmentsByPatient 
} from '@/lib/api/appointments';
import { 
  createAppointmentNote, 
  getAppointmentNotes, 
  getPatientHistory,
  hasAppointmentNotes 
} from '@/lib/api/appointmentNotes';
import { 
  getDoctorsBySpecialty, 
  getSpecialties 
} from '@/lib/api/doctors';
import { 
  subscribeToSlots 
} from '@/lib/api/slots';
import { Calendar } from '@/components/CalendarSimple';
import { TimeSlotGrid } from '@/components/TimeSlotGridNew';
import { DoctorDropdown } from '@/components/DoctorDropdown';
import { Appointment, Doctor, TimeSlot, AppointmentNote } from '@/lib/types';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientHistory, setPatientHistory] = useState<AppointmentNote[]>([]);
  const [existingNotes, setExistingNotes] = useState<AppointmentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Formulario de notas
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [observations, setObservations] = useState('');
  const [referralTo, setReferralTo] = useState('');
  const [referralReason, setReferralReason] = useState('');
  
  // Modal para agendar nueva cita
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [newAppointmentReason, setNewAppointmentReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      loadAppointmentData();
    }
  }, [appointmentId]);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading appointment data for ID:', appointmentId);
      
      // Cargar datos de la cita
      const appointmentData = await getAppointmentById(appointmentId!);
      if (!appointmentData) {
        Alert.alert('Error', 'Cita no encontrada');
        router.back();
        return;
      }
      
      console.log('Appointment loaded:', appointmentData);
      setAppointment(appointmentData);
      
      // Cargar historial del paciente de forma segura
      try {
        console.log('Loading patient history for:', appointmentData.patientId);
        const history = await getPatientHistory(appointmentData.patientId);
        console.log('Patient history loaded:', history.length, 'notes');
        setPatientHistory(history);
      } catch (historyError) {
        console.warn('Error loading patient history:', historyError);
        setPatientHistory([]); // Continuar sin historial
      }
      
      // Cargar notas existentes de esta cita de forma segura
      try {
        console.log('Loading appointment notes for:', appointmentId);
        const notes = await getAppointmentNotes(appointmentId!);
        console.log('Appointment notes loaded:', notes.length, 'notes');
        setExistingNotes(notes);
        
        // Si ya hay notas, cargar los datos en el formulario
        if (notes.length > 0) {
          const latestNote = notes[0];
          setDiagnosis(latestNote.diagnosis || '');
          setTreatment(latestNote.treatment || '');
          setObservations(latestNote.observations || '');
          setReferralTo(latestNote.referralTo || '');
          setReferralReason(latestNote.referralReason || '');
        }
      } catch (notesError) {
        console.warn('Error loading appointment notes:', notesError);
        setExistingNotes([]); // Continuar sin notas
      }
      
    } catch (error) {
      console.error('Error loading appointment data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!appointment || !user) return;
    
    try {
      setSaving(true);
      
      if (existingNotes.length > 0) {
        // Actualizar nota existente
        const { updateAppointmentNote } = await import('@/lib/api/appointmentNotes');
        await updateAppointmentNote(existingNotes[0].id, {
          diagnosis,
          treatment,
          observations,
          referralTo,
          referralReason
        });
      } else {
        // Crear nueva nota
        await createAppointmentNote({
          appointmentId: appointment.id,
          doctorId: user.uid,
          patientId: appointment.patientId,
          diagnosis,
          treatment,
          observations,
          referralTo,
          referralReason
        });
      }
      
      Alert.alert('Éxito', 'Notas guardadas correctamente');
      loadAppointmentData(); // Recargar datos
      
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Error', 'No se pudieron guardar las notas');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleNewAppointment = async () => {
    if (!appointment) return;
    
    try {
      setShowScheduleModal(true);
      
      // Cargar doctores (incluir al doctor actual para días diferentes)
      const doctorsData = await getDoctorsBySpecialty();
      setDoctors(doctorsData);
      
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'No se pudieron cargar los doctores');
    }
  };

  // Suscribirse a slots cuando se selecciona doctor y fecha (igual que el paciente)
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

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmNewAppointment = async () => {
    if (!selectedDoctor || !selectedSlot || !appointment) {
      Alert.alert('Error', 'Por favor selecciona un doctor y horario');
      return;
    }
    
    try {
      Alert.alert(
        'Confirmar Nueva Cita',
        `¿Agendar cita para ${appointment.patientName} con ${selectedDoctor.displayName} el ${selectedSlot.date} a las ${selectedSlot.startTime}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                // Usar la función simple de agendar cita como doctor
                const { bookSlotAsDoctor } = await import('@/lib/api/doctorBooking');
                
                const result = await bookSlotAsDoctor({
                  patientId: appointment.patientId,
                  doctorId: selectedDoctor.uid,
                  slotId: selectedSlot.id,
                  reason: newAppointmentReason,
                  notes: `Cita agendada por ${appointment.doctorName} - ${newAppointmentReason}`
                });
                
                if (result.success) {
                  Alert.alert('Éxito', 'Nueva cita agendada correctamente');
                  setShowScheduleModal(false);
                  // Recargar datos de la cita actual
                  loadAppointmentData();
                } else {
                  Alert.alert('Error', result.error || 'No se pudo agendar la nueva cita');
                }
              } catch (bookingError: any) {
                console.error('Error booking appointment:', bookingError);
                Alert.alert('Error', 'No se pudo agendar la nueva cita');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error confirming appointment:', error);
      Alert.alert('Error', 'No se pudo agendar la nueva cita');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppBar title="Detalle de Cita" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <AppBar title="Detalle de Cita" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cerrando sesión...</Text>
        </View>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.container}>
        <AppBar title="Detalle de Cita" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Cita no encontrada</Text>
        </View>
      </View>
    );
  }

  const date = parse(appointment.date, 'yyyy-MM-dd', new Date());
  const formattedDate = format(date, "d 'de' MMMM, yyyy", { locale: es });

  return (
    <View style={styles.container}>
      <AppBar title="Detalle de Cita" />
      
      <ScrollView style={styles.content}>
        {/* Información del paciente */}
        <Card style={styles.patientCard}>
          <Text style={styles.patientName}>{appointment.patientName}</Text>
          <Text style={styles.patientInfo}>📅 {formattedDate}</Text>
          <Text style={styles.patientInfo}>⏰ {appointment.startTime} - {appointment.endTime}</Text>
          <Text style={styles.patientInfo}>📞 {appointment.patientPhone}</Text>
          {appointment.reason && (
            <Text style={styles.patientInfo}>📝 Motivo: {appointment.reason}</Text>
          )}
        </Card>

        {/* Formulario de notas */}
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>📝 Notas de la Consulta</Text>
          
          <TextInput
            label="Diagnóstico"
            placeholder="Ej: Caries en muela 16"
            value={diagnosis}
            onChangeText={setDiagnosis}
            multiline
            numberOfLines={2}
          />

          <TextInput
            label="Tratamiento"
            placeholder="Ej: Necesita endodoncia"
            value={treatment}
            onChangeText={setTreatment}
            multiline
            numberOfLines={2}
          />

          <TextInput
            label="Observaciones"
            placeholder="Ej: Derivar a endodoncista"
            value={observations}
            onChangeText={setObservations}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Derivar a Doctor (ID)"
            placeholder="ID del doctor especialista"
            value={referralTo}
            onChangeText={setReferralTo}
          />

          <TextInput
            label="Motivo de Derivación"
            placeholder="Ej: Necesita tratamiento especializado"
            value={referralReason}
            onChangeText={setReferralReason}
            multiline
            numberOfLines={2}
          />

          <Button onPress={handleSaveNotes} loading={saving}>
            💾 Guardar Notas
          </Button>
        </Card>

        {/* Historial del paciente */}
        {patientHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <Text style={styles.sectionTitle}>📋 Historial Médico</Text>
            {patientHistory.slice(0, 3).map((note, index) => (
              <View key={note.id} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {format(note.createdAt.toDate(), 'dd/MM/yyyy')}
                </Text>
                {note.diagnosis && (
                  <Text style={styles.historyText}>Diagnóstico: {note.diagnosis}</Text>
                )}
                {note.treatment && (
                  <Text style={styles.historyText}>Tratamiento: {note.treatment}</Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Botón para agendar nueva cita */}
        <Button 
          onPress={handleScheduleNewAppointment}
          style={styles.scheduleButton}
        >
          📅 Agendar Nueva Cita
        </Button>
      </ScrollView>

      {/* Modal para agendar nueva cita */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agendar Nueva Cita</Text>
            <TouchableOpacity 
              onPress={() => setShowScheduleModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Selección de doctor */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Seleccionar dentista:</Text>
              <Text style={styles.sectionSubtext}>
                (No puedes derivar contigo mismo el mismo día)
              </Text>
              <DoctorDropdown
                doctors={doctors}
                selectedDoctor={selectedDoctor}
                onSelectDoctor={handleDoctorSelect}
                currentDoctorId={user.uid}
                selectedDate={selectedDate ?? undefined}
              />
            </View>

            {/* Selección de fecha */}
            {selectedDoctor && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Fecha:</Text>
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 días desde hoy
                />
              </View>
            )}

            {/* Fecha seleccionada */}
            {selectedDate && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Fecha seleccionada:</Text>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedInfoText}>
                    {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                  </Text>
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
                <Text style={styles.sectionLabel}>Hora seleccionada:</Text>
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedInfoText}>
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </Text>
                </View>
              </View>
            )}

            {/* Motivo de la nueva cita */}
            {selectedSlot && (
              <View style={styles.section}>
                <TextInput
                  label="Motivo de la Nueva Cita"
                  placeholder="Ej: Seguimiento, derivación a especialista..."
                  value={newAppointmentReason}
                  onChangeText={setNewAppointmentReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button 
              onPress={handleConfirmNewAppointment}
              disabled={!selectedDoctor || !selectedSlot || !newAppointmentReason.trim()}
            >
              Confirmar Nueva Cita
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  content: {
    flex: 1,
    padding: 16,
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
  patientCard: {
    marginBottom: 16,
    padding: 16,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  patientInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  notesCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  historyCard: {
    marginBottom: 16,
    padding: 16,
  },
  historyItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#73506E',
    marginBottom: 4,
  },
  historyText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  scheduleButton: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  closeButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  sectionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  selectedInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedInfoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
