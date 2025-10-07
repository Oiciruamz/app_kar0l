import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { Card } from './ui/Card';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentItemProps {
  appointment: Appointment;
  onPress?: () => void;
  showDoctorName?: boolean;
  showPatientName?: boolean;
}

export function AppointmentItem({ 
  appointment, 
  onPress,
  showDoctorName = false,
  showPatientName = false
}: AppointmentItemProps) {
  const date = parse(appointment.date, 'yyyy-MM-dd', new Date());
  const formattedDate = format(date, "d 'de' MMMM, yyyy", { locale: es });

  const statusColors: Record<AppointmentStatus, string> = {
    'Agendada': '#22C55E',
    'Cancelada': '#EF4444',
    'Completada': '#6B7280'
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper 
      onPress={onPress}
      style={styles.wrapper}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Card style={styles.container}>
        <View style={styles.header}>
          {showDoctorName && (
            <Text style={styles.name}>Dr. {appointment.doctorName}</Text>
          )}
          {showPatientName && (
            <Text style={styles.name}>{appointment.patientName}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColors[appointment.status] }]}>
            <Text style={styles.statusText}>{appointment.status}</Text>
          </View>
        </View>

        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.time}>
          {appointment.startTime} - {appointment.endTime}
        </Text>

        {appointment.reason && (
          <Text style={styles.reason} numberOfLines={2}>
            Motivo: {appointment.reason}
          </Text>
        )}
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

