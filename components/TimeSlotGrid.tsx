import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimeSlot } from '@/lib/types';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlotId?: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({ slots, selectedSlotId, onSelectSlot }: TimeSlotGridProps) {
  const renderSlot = (item: TimeSlot) => {
    const isAvailable = item.status === 'available';
    const isOnHold = item.status === 'on_hold';
    const isBooked = item.status === 'booked';
    const isSelected = item.id === selectedSlotId;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.slot,
          isSelected && styles.slotSelected,
          isOnHold && styles.slotOnHold,
          isBooked && styles.slotBooked,
          !isAvailable && !isSelected && styles.slotDisabled
        ]}
        onPress={() => isAvailable && onSelectSlot(item)}
        disabled={!isAvailable}
        accessibilityRole="button"
        accessibilityLabel={`Horario ${item.startTime}, ${isAvailable ? 'disponible' : 'ocupado'}`}
        accessibilityState={{ disabled: !isAvailable, selected: isSelected }}
      >
        <Text style={[
          styles.slotText,
          isSelected && styles.slotTextSelected,
          !isAvailable && !isSelected && styles.slotTextDisabled
        ]}>
          {item.startTime}
        </Text>
      </TouchableOpacity>
    );
  };

  if (slots.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay horarios disponibles</Text>
      </View>
    );
  }

  // Agrupar slots en filas de 3
  const rows: TimeSlot[][] = [];
  for (let i = 0; i < slots.length; i += 3) {
    rows.push(slots.slice(i, i + 3));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((slot) => renderSlot(slot))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slot: {
    flex: 1,
    backgroundColor: '#EAE7EA', // available color
    borderRadius: 6,
    padding: 12,
    marginHorizontal: 4,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: {
    backgroundColor: '#73506E', // brand-strong
  },
  slotOnHold: {
    backgroundColor: '#B7ACB4', // on hold
  },
  slotBooked: {
    backgroundColor: '#B7ACB4', // booked
  },
  slotDisabled: {
    opacity: 0.6,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextDisabled: {
    color: '#6B7280',
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

