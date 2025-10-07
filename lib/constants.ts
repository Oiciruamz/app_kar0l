// App Constants

export const TIMEZONE = 'America/Mexico_City';

export const HOLD_DURATION_MS = 120000; // 2 minutes

export const SLOT_DURATION_MINUTES = 30;

export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'Agendada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada'
} as const;

export const SLOT_STATUSES = {
  AVAILABLE: 'available',
  ON_HOLD: 'on_hold',
  BOOKED: 'booked'
} as const;

export const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient'
} as const;

export const COLORS = {
  primary: '#73506E',
  primaryLight: '#B7ACB4',
  background: '#EDDDE9',
  white: '#FFFFFF',
  textPrimary: '#0F172A',
  textMuted: '#6B7280',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6'
} as const;

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Error de autenticación',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  SLOT_UNAVAILABLE: 'Ese horario acaba de agendarse. Elige otro.',
  HOLD_EXPIRED: 'La reserva expiró. Selecciona otro horario.',
  PERMISSION_DENIED: 'No tienes permiso para realizar esta acción',
  GENERIC_ERROR: 'Ocurrió un problema. Intenta de nuevo.'
} as const;

export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'Tu cita se agendó correctamente.',
  APPOINTMENT_CANCELLED: 'Cita cancelada correctamente.',
  SLOT_CREATED: 'Horario creado correctamente.',
  SLOT_UPDATED: 'Horario actualizado correctamente.',
  SLOT_DELETED: 'Horario eliminado correctamente.'
} as const;

