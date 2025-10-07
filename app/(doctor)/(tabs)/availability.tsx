import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { AppBar } from '@/components/AppBar';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { createSlot } from '@/lib/api/slots';
import { format, addDays } from 'date-fns';

export default function AvailabilityScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSlot = async () => {
    if (!user || !startTime || !endTime) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await createSlot(user.uid, {
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
        duration: 30
      });
      
      Alert.alert('Éxito', 'Horario creado correctamente');
      setStartTime('');
      setEndTime('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextWeekDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <View style={styles.container}>
      <AppBar title="Disponibilidad" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
        <View style={styles.dateSelector}>
          {nextWeekDates.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dateButton, isSelected && styles.dateButtonActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
                  {format(date, 'EEE')}
                </Text>
                <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Agregar horario</Text>
        <View style={styles.form}>
          <TextInput
            label="Hora de inicio"
            placeholder="09:00"
            value={startTime}
            onChangeText={setStartTime}
            helperText="Formato: HH:mm (ejemplo: 09:00)"
          />

          <TextInput
            label="Hora de fin"
            placeholder="10:00"
            value={endTime}
            onChangeText={setEndTime}
            helperText="Formato: HH:mm (ejemplo: 10:00)"
          />

          <Button onPress={handleCreateSlot} loading={loading}>
            Crear Horario
          </Button>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            💡 Cada horario tiene duración de 30 minutos y capacidad para 1 paciente.
          </Text>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: '#73506E',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateDayActive: {
    color: '#FFFFFF',
  },
  dateNum: {
    fontSize: 18,
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
    marginBottom: 16,
  },
  info: {
    backgroundColor: '#EDE1EC',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
});

