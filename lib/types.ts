import { Timestamp } from 'firebase/firestore';

export type UserRole = 'doctor' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Doctor extends UserProfile {
  role: 'doctor';
  specialty?: string;
  photoURL?: string;
  bio?: string;
}

export interface Patient extends UserProfile {
  role: 'patient';
}

export type SlotStatus = 'available' | 'on_hold' | 'booked';

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  status: SlotStatus;
  capacity: number; // always 1 for dental
  holdBy?: string; // patient uid if on_hold
  holdExpiresAt?: Timestamp;
  appointmentId?: string; // if booked
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AppointmentStatus = 'Agendada' | 'Cancelada' | 'Completada';

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt?: Timestamp;
}

export interface Hold {
  id: string;
  slotId: string;
  doctorId: string;
  patientId: string;
  expiresAt: Timestamp; // for TTL
  createdAt: Timestamp;
}

export interface HoldSlotRequest {
  doctorId: string;
  slotId: string;
}

export interface HoldSlotResponse {
  success: boolean;
  holdId?: string;
  expiresAt?: number; // timestamp
  error?: string;
}

export interface BookSlotRequest {
  holdId: string;
  patientPhone: string;
  reason?: string;
}

export interface BookSlotResponse {
  success: boolean;
  appointmentId?: string;
  error?: string;
}

export interface CancelAppointmentRequest {
  appointmentId: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
  error?: string;
}

export interface DoctorNote {
  id: string;
  doctorId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

