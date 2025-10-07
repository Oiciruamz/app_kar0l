import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { scale, scaleFont } from '@/lib/utils/responsive';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({ selectedDate, onSelectDate, minDate, maxDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  // Generar 42 días (6 semanas)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <View style={styles.container}>
      {/* Header del calendario */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          onPress={() => navigateMonth('next')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((day, index) => (
          <View key={index} style={styles.dayNameContainer}>
            <Text style={styles.dayName}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Grid de días */}
      <View style={styles.daysGrid}>
        {days.map((date, index) => {
          const isCurrentMonth = isDateInCurrentMonth(date);
          const isSelected = isDateSelected(date);
          const isToday = isDateToday(date);
          const isDisabled = isDateDisabled(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                isSelected && styles.selectedDay,
                isToday && !isSelected && styles.todayDay,
                isDisabled && styles.disabledDay,
              ]}
              onPress={() => !isDisabled && onSelectDate(date)}
              disabled={isDisabled}
            >
              <Text style={[
                styles.dayText,
                !isCurrentMonth && styles.otherMonthDay,
                isSelected && styles.selectedDayText,
                isToday && !isSelected && styles.todayDayText,
                isDisabled && styles.disabledDayText,
              ]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  navButton: {
    width: scale(32),
    height: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(16),
    backgroundColor: '#F3F4F6',
  },
  navButtonText: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#73506E',
  },
  monthYear: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#0F172A',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: scale(8),
  },
  dayNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dayName: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  selectedDay: {
    backgroundColor: '#73506E',
    borderRadius: scale(20),
  },
  todayDay: {
    backgroundColor: '#F3F4F6',
    borderRadius: scale(20),
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#0F172A',
  },
  otherMonthDay: {
    color: '#D1D5DB',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#73506E',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#9CA3AF',
  },
});
