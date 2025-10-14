// Funciones de agendado ejecutadas directamente en el cliente
// Sin necesidad de Cloud Functions (para desarrollo/demo)

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  runTransaction,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { HoldSlotRequest, HoldSlotResponse, BookSlotRequest, BookSlotResponse } from '@/lib/types';

// Función auxiliar para verificar solapamiento de horarios
function isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
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
 * Reservar un horario temporalmente (2 minutos)
 */
export async function holdSlot(request: HoldSlotRequest): Promise<HoldSlotResponse> {
  try {
    const { doctorId, slotId } = request;
    const patientId = auth.currentUser?.uid;

    if (!patientId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (!doctorId || !slotId) {
      return { success: false, error: 'Datos inválidos' };
    }

    // Verificar que el slot existe y está disponible
    const slotRef = doc(db, 'slots', slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      return { success: false, error: 'Horario no encontrado' };
    }

    const slotData = slotSnap.data();

    if (slotData.status !== 'available') {
      return { success: false, error: 'Ese horario acaba de agendarse. Elige otro.' };
    }

    if (slotData.doctorId !== doctorId) {
      return { success: false, error: 'Horario inválido' };
    }

    // Crear hold
    const holdRef = doc(db, 'holds', `${patientId}_${slotId}`);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 120000); // 2 minutos

    const holdData = {
      id: holdRef.id,
      slotId,
      doctorId,
      patientId,
      expiresAt,
      createdAt: now
    };

    // Actualizar slot a on_hold
    await updateDoc(slotRef, {
      status: 'on_hold',
      holdBy: patientId,
      holdExpiresAt: expiresAt,
      updatedAt: now
    });

    // Crear hold document
    await setDoc(holdRef, holdData);

    return {
      success: true,
      holdId: holdRef.id,
      expiresAt: expiresAt.toMillis()
    };
  } catch (error: any) {
    console.error('Error holding slot:', error);
    return {
      success: false,
      error: error.message || 'Error al reservar horario'
    };
  }
}

/**
 * Confirmar la cita (convertir hold en appointment)
 */
export async function bookSlot(request: BookSlotRequest): Promise<BookSlotResponse> {
  try {
    const { holdId, patientPhone, reason } = request;
    const patientId = auth.currentUser?.uid;

    if (!patientId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (!holdId || !patientPhone) {
      return { success: false, error: 'Datos inválidos' };
    }

    // Obtener hold
    const holdRef = doc(db, 'holds', holdId);
    const holdSnap = await getDoc(holdRef);

    if (!holdSnap.exists()) {
      return { success: false, error: 'La reserva expiró. Selecciona otro horario.' };
    }

    const holdData = holdSnap.data();

    // Verificar que el hold pertenece al usuario
    if (holdData.patientId !== patientId) {
      return { success: false, error: 'Reserva inválida' };
    }

    // Verificar que no expiró
    const now = Timestamp.now();
    if (holdData.expiresAt.toMillis() < now.toMillis()) {
      await deleteDoc(holdRef);
      return { success: false, error: 'La reserva expiró. Selecciona otro horario.' };
    }

    // Obtener slot
    const slotRef = doc(db, 'slots', holdData.slotId);
    const slotSnap = await getDoc(slotRef);

    if (!slotSnap.exists()) {
      return { success: false, error: 'Horario no encontrado' };
    }

    const slotData = slotSnap.data();

    if (slotData.status !== 'on_hold') {
      return { success: false, error: 'El horario ya no está disponible' };
    }

    // VALIDACIONES DE RESTRICCIONES DE CITAS
    // 1. NUEVA RESTRICCIÓN: Verificar si ya tiene cita el mismo día
    const sameDayAppointments = await getDocs(
      query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('date', '==', slotData.date),
        where('status', '==', 'Agendada')
      )
    );

    if (!sameDayAppointments.empty) {
      return { 
        success: false, 
        error: 'Ya tienes una cita agendada para este día' 
      };
    }

    // 2. Verificar si ya tiene cita con este doctor
    const existingDoctorAppointments = await getDocs(
      query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('doctorId', '==', slotData.doctorId),
        where('status', '==', 'Agendada')
      )
    );

    if (!existingDoctorAppointments.empty) {
      return { 
        success: false, 
        error: 'Ya tienes una cita agendada con este doctor' 
      };
    }

    // 3. Verificar si tiene conflicto de horario con otra cita
    const conflictingAppointments = await getDocs(
      query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('date', '==', slotData.date),
        where('status', '==', 'Agendada')
      )
    );

    // Verificar solapamiento de horarios
    for (const doc of conflictingAppointments.docs) {
      const appointment = doc.data();
      if (isTimeOverlap(slotData.startTime, slotData.endTime, appointment.startTime, appointment.endTime)) {
        return { 
          success: false, 
          error: 'Ya tienes una cita agendada en este horario con otro doctor' 
        };
      }
    }

    // Obtener info del doctor
    const doctorRef = doc(db, 'users', slotData.doctorId);
    const doctorSnap = await getDoc(doctorRef);
    const doctorData = doctorSnap.data();

    // Obtener info del paciente
    const patientRef = doc(db, 'users', patientId);
    const patientSnap = await getDoc(patientRef);
    const patientData = patientSnap.data();

    // Crear appointment
    const appointmentRef = doc(db, 'appointments', `${patientId}_${holdData.slotId}_${now.toMillis()}`);
    const appointmentData = {
      id: appointmentRef.id,
      doctorId: slotData.doctorId,
      patientId,
      slotId: holdData.slotId,
      doctorName: doctorData?.displayName || 'Doctor',
      patientName: patientData?.displayName || 'Paciente',
      patientPhone,
      date: slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      reason: reason || null,
      status: 'Agendada',
      createdAt: now,
      updatedAt: now
    };

    // Guardar appointment
    await setDoc(appointmentRef, appointmentData);

    // Actualizar slot a booked
    await updateDoc(slotRef, {
      status: 'booked',
      appointmentId: appointmentRef.id,
      holdBy: null,
      holdExpiresAt: null,
      updatedAt: now
    });

    // Eliminar hold
    await deleteDoc(holdRef);

    return {
      success: true,
      appointmentId: appointmentRef.id
    };
  } catch (error: any) {
    console.error('Error booking slot:', error);
    return {
      success: false,
      error: error.message || 'Error al agendar cita'
    };
  }
}

/**
 * Cancelar una cita
 */
export async function cancelAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (!appointmentId) {
      return { success: false, error: 'Datos inválidos' };
    }

    // Obtener appointment
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);

    if (!appointmentSnap.exists()) {
      return { success: false, error: 'Cita no encontrada' };
    }

    const appointmentData = appointmentSnap.data();

    // Verificar permisos
    if (appointmentData.patientId !== userId && appointmentData.doctorId !== userId) {
      return { success: false, error: 'No tienes permiso para cancelar esta cita' };
    }

    const now = Timestamp.now();

    // Actualizar appointment
    await updateDoc(appointmentRef, {
      status: 'Cancelada',
      cancelledAt: now,
      updatedAt: now
    });

    // Liberar el slot
    const slotRef = doc(db, 'slots', appointmentData.slotId);
    const slotSnap = await getDoc(slotRef);

    if (slotSnap.exists()) {
      await updateDoc(slotRef, {
        status: 'available',
        appointmentId: null,
        updatedAt: now
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    return {
      success: false,
      error: error.message || 'Error al cancelar cita'
    };
  }
}

/**
 * Liberar un hold manualmente
 */
export async function releaseHold(holdId: string): Promise<void> {
  try {
    const patientId = auth.currentUser?.uid;
    if (!patientId) return;

    const holdRef = doc(db, 'holds', holdId);
    const holdSnap = await getDoc(holdRef);

    if (!holdSnap.exists()) return;

    const holdData = holdSnap.data();

    // Liberar el slot
    const slotRef = doc(db, 'slots', holdData.slotId);
    await updateDoc(slotRef, {
      status: 'available',
      holdBy: null,
      holdExpiresAt: null,
      updatedAt: Timestamp.now()
    });

    // Eliminar hold
    await deleteDoc(holdRef);
  } catch (error) {
    console.error('Error releasing hold:', error);
  }
}

