import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppBar } from '@/components/AppBar';
import { TimeSlotGrid } from '@/components/TimeSlotGrid';
import { HoldCountdownToast } from '@/components/HoldCountdownToast';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { subscribeToSlots } from '@/lib/api/slots';
import { holdSlot, bookSlot, releaseHold } from '@/lib/api/clientBooking';
import { TimeSlot } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BookingScreen() {
  const router = useRouter();
  const { doctorId, doctorName } = useLocalSearchParams();
  const { user, profile } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId || typeof doctorId !== 'string') return;

    const unsubscribe = subscribeToSlots(doctorId, selectedDate, (data) => {
      setSlots(data);
    });

    return () => unsubscribe();
  }, [doctorId, selectedDate]);

  const handleSelectSlot = async (slot: TimeSlot) => {
    if (!doctorId || typeof doctorId !== 'string') return;

    setLoading(true);
    try {
      const result = await holdSlot({
        doctorId,
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

  const handleCancelHold = async () => {
    if (holdId) {
      await releaseHold(holdId);
    }
    setSelectedSlot(null);
    setHoldId(null);
    setHoldExpiresAt(null);
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
        Alert.alert(
          'Éxito',
          'Tu cita se agendó correctamente.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(patient)/(tabs)/appointments')
            }
          ]
        );
      } else {
        // Mostrar mensajes de error más específicos
        const errorMessage = result.error || 'Error al agendar cita';
        let alertTitle = 'Error';
        
        if (errorMessage.includes('Ya tienes una cita agendada con este doctor')) {
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

  const nextWeekDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <View style={styles.container}>
      <AppBar title={`Agendar con ${doctorName}`} showBack />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dateScrollContainer}
        >
          {nextWeekDates.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dateButton, isSelected && styles.dateButtonActive]}
                onPress={() => {
                  setSelectedDate(date);
                  handleCancelHold();
                }}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
                  {format(date, 'EEE', { locale: es })}
                </Text>
                <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Horarios disponibles</Text>
        <TimeSlotGrid
          slots={slots}
          selectedSlotId={selectedSlot?.id}
          onSelectSlot={handleSelectSlot}
        />

        {holdId && holdExpiresAt && (
          <HoldCountdownToast
            expiresAt={holdExpiresAt}
            onCancel={handleCancelHold}
          />
        )}

        {selectedSlot && holdId && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Completa tu información</Text>
            
            <TextInput
              label="Teléfono"
              placeholder="5551234567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              label="Motivo (opcional)"
              placeholder="Limpieza, revisión, dolor..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />

            <Button 
              onPress={handleBookAppointment}
              loading={loading}
              disabled={!phone}
            >
              Confirmar Cita
            </Button>
          </View>
        )}
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  dateScrollContainer: {
    marginBottom: 24,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  dateButtonActive: {
    backgroundColor: '#73506E',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dateDayActive: {
    color: '#FFFFFF',
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  dateNumActive: {
    color: '#FFFFFF',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
});

