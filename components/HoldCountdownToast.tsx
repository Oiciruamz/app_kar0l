import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHoldCountdown } from '@/lib/hooks/useHoldCountdown';

interface HoldCountdownToastProps {
  expiresAt: number;
  onCancel: () => void;
}

export function HoldCountdownToast({ expiresAt, onCancel }: HoldCountdownToastProps) {
  const { formatted, isExpired } = useHoldCountdown(expiresAt);

  if (isExpired) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Horario reservado</Text>
        <Text style={styles.timer}>{formatted}</Text>
        <Text style={styles.message}>
          Completa el formulario antes de que expire
        </Text>
      </View>
      <TouchableOpacity 
        onPress={onCancel} 
        style={styles.cancelButton}
        accessibilityRole="button"
        accessibilityLabel="Cancelar reserva"
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  timer: {
    fontSize: 24,
    fontWeight: '700',
    color: '#73506E',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
});

