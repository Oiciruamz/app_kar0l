import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment } from '@/lib/types';

/**
 * Verificar si un usuario ya tiene una cita con un doctor específico
 */
export async function checkExistingAppointmentWithDoctor(
  patientId: string, 
  doctorId: string
): Promise<{ hasAppointment: boolean; appointment?: Appointment }> {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('doctorId', '==', doctorId),
      where('status', '==', 'Agendada')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { hasAppointment: false };
    }
    
    const appointment = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Appointment;
    return { hasAppointment: true, appointment };
  } catch (error) {
    console.error('Error checking existing appointment with doctor:', error);
    throw new Error('Error al verificar citas existentes');
  }
}

/**
 * Verificar si un usuario ya tiene una cita en un horario específico
 */
export async function checkConflictingAppointment(
  patientId: string, 
  date: string, 
  startTime: string, 
  endTime: string
): Promise<{ hasConflict: boolean; appointment?: Appointment }> {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('date', '==', date),
      where('status', '==', 'Agendada')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { hasConflict: false };
    }
    
    // Verificar si hay solapamiento de horarios
    for (const doc of snapshot.docs) {
      const appointment = { id: doc.id, ...doc.data() } as Appointment;
      
      // Verificar solapamiento de horarios
      if (isTimeOverlap(startTime, endTime, appointment.startTime, appointment.endTime)) {
        return { hasConflict: true, appointment };
      }
    }
    
    return { hasConflict: false };
  } catch (error) {
    console.error('Error checking conflicting appointment:', error);
    throw new Error('Error al verificar conflictos de horario');
  }
}

/**
 * Verificar si un usuario ya tiene una cita el mismo día
 */
export async function checkSameDayAppointment(
  patientId: string, 
  date: string
): Promise<{ hasSameDayAppointment: boolean; appointment?: Appointment }> {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('date', '==', date),
      where('status', '==', 'Agendada')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { hasSameDayAppointment: false };
    }
    
    // Si encuentra cualquier cita el mismo día, retorna true
    const appointment = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Appointment;
    return { hasSameDayAppointment: true, appointment };
  } catch (error) {
    console.error('Error checking same day appointment:', error);
    throw new Error('Error al verificar citas del mismo día');
  }
}

/**
 * Verificar si dos rangos de tiempo se solapan
 */
function isTimeOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  // Convertir strings de tiempo a minutos desde medianoche
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  // Dos rangos se solapan si uno empieza antes de que termine el otro
  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Validación completa antes de agendar una cita
 */
export async function validateAppointmentBooking(
  patientId: string,
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ isValid: boolean; error?: string; conflictingAppointment?: Appointment }> {
  try {
    // NUEVA RESTRICCIÓN: Verificar si ya tiene cita el mismo día
    const sameDayCheck = await checkSameDayAppointment(patientId, date);
    if (sameDayCheck.hasSameDayAppointment) {
      return {
        isValid: false,
        error: 'Ya tienes una cita agendada para este día',
        conflictingAppointment: sameDayCheck.appointment
      };
    }
    
    // Verificar si ya tiene cita con este doctor
    const doctorCheck = await checkExistingAppointmentWithDoctor(patientId, doctorId);
    if (doctorCheck.hasAppointment) {
      return {
        isValid: false,
        error: 'Ya tienes una cita agendada con este doctor',
        conflictingAppointment: doctorCheck.appointment
      };
    }
    
    // Verificar si tiene conflicto de horario
    const conflictCheck = await checkConflictingAppointment(patientId, date, startTime, endTime);
    if (conflictCheck.hasConflict) {
      return {
        isValid: false,
        error: 'Ya tienes una cita agendada en este horario con otro doctor',
        conflictingAppointment: conflictCheck.appointment
      };
    }
    
    return { isValid: true };
  } catch (error: any) {
    console.error('Error validating appointment booking:', error);
    return {
      isValid: false,
      error: error.message || 'Error al validar la cita'
    };
  }
}
