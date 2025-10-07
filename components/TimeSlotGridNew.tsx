import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { TimeSlot } from '@/lib/types';
import { scale, scaleFont } from '@/lib/utils/responsive';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({ slots, selectedSlotId, onSelectSlot }: TimeSlotGridProps) {
  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.id === selectedSlotId) return 'selected';
    if (slot.status === 'booked') return 'booked';
    if (slot.status === 'on_hold') return 'on_hold';
    return 'available';
  };

  const getSlotStyle = (status: string) => {
    switch (status) {
      case 'selected':
        return styles.selectedSlot;
      case 'booked':
        return styles.bookedSlot;
      case 'on_hold':
        return styles.onHoldSlot;
      default:
        return styles.availableSlot;
    }
  };

  const getSlotTextStyle = (status: string) => {
    switch (status) {
      case 'selected':
        return styles.selectedSlotText;
      case 'booked':
        return styles.bookedSlotText;
      case 'on_hold':
        return styles.onHoldSlotText;
      default:
        return styles.availableSlotText;
    }
  };

  const getSlotLabel = (status: string) => {
    switch (status) {
      case 'selected':
        return 'Seleccionado';
      case 'booked':
        return 'Agendado';
      case 'on_hold':
        return 'Reservado';
      default:
        return 'Disponible';
    }
  };

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay horarios disponibles para esta fecha</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {slots.map((slot) => {
          const status = getSlotStatus(slot);
          const isDisabled = status === 'booked' || status === 'on_hold';
          
          return (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slot, getSlotStyle(status)]}
              onPress={() => !isDisabled && onSelectSlot(slot)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <Text style={getSlotTextStyle(status)}>
                {slot.startTime}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.availableSlot]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.bookedSlot]} />
          <Text style={styles.legendText}>Agendado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.selectedSlot]} />
          <Text style={styles.legendText}>Seleccionado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: scale(16),
  },
  slot: {
    width: '30%',
    paddingVertical: scale(12),
    paddingHorizontal: scale(8),
    marginBottom: scale(8),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(44),
  },
  availableSlot: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookedSlot: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  onHoldSlot: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  selectedSlot: {
    backgroundColor: '#73506E',
    borderWidth: 1,
    borderColor: '#73506E',
  },
  availableSlotText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#0F172A',
  },
  bookedSlotText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#6B7280',
  },
  onHoldSlotText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#D97706',
  },
  selectedSlotText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: scale(6),
  },
  legendText: {
    fontSize: scaleFont(12),
    color: '#6B7280',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(32),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: scaleFont(16),
    color: '#6B7280',
    textAlign: 'center',
  },
});
