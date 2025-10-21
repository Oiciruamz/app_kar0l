import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp,
  runTransaction,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { BookSlotAsDoctorRequest, BookSlotAsDoctorResponse } from '@/lib/types';

/**
 * Agendar una cita como médico (para derivación o seguimiento)
 * Función simple que funciona directamente con Firestore
 */
export async function bookSlotAsDoctor(request: BookSlotAsDoctorRequest): Promise<BookSlotAsDoctorResponse> {
  try {
    const { patientId, doctorId, slotId, reason, notes } = request;
    const doctorUserId = auth.currentUser?.uid;

    if (!doctorUserId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (!patientId || !doctorId || !slotId) {
      return { success: false, error: 'Datos inválidos' };
    }

    // Verificar que el slot existe y está disponible
    const slotRef = doc(db, 'slots', slotId);
    const slotSnap = await getDoc(slotRef);
    
    if (!slotSnap.exists()) {
      return { success: false, error: 'Horario no encontrado' };
    }

    const slotData = slotSnap.data();
    if (!slotData) {
      return { success: false, error: 'Datos de horario inválidos' };
    }

    // Verificar que el slot está disponible
    if (slotData.status !== 'available') {
      return { success: false, error: 'El horario ya no está disponible' };
    }

    // Verificar que el slot pertenece al doctor seleccionado
    if (slotData.doctorId !== doctorId) {
      return { success: false, error: 'El horario no pertenece al doctor seleccionado' };
    }

    // VALIDACIÓN: Verificar si el paciente ya tiene una cita el mismo día con el mismo doctor
    // Esto incluye el caso donde el doctor se deriva a sí mismo el mismo día
    const existingAppointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('doctorId', '==', doctorId),
      where('date', '==', slotData.date),
      where('status', '==', 'Agendada')
    );
    
    const existingAppointments = await getDocs(existingAppointmentsQuery);
    
    if (!existingAppointments.empty) {
      if (doctorUserId === doctorId) {
        return { success: false, error: 'No puedes derivar a un paciente contigo mismo el mismo día' };
      } else {
        return { success: false, error: 'El paciente ya tiene una cita agendada con este doctor el mismo día' };
      }
    }

    // Obtener datos del paciente
    const patientRef = doc(db, 'users', patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      return { success: false, error: 'Paciente no encontrado' };
    }

    const patientData = patientSnap.data();

    // Obtener datos del doctor seleccionado
    const selectedDoctorRef = doc(db, 'users', doctorId);
    const selectedDoctorSnap = await getDoc(selectedDoctorRef);
    
    if (!selectedDoctorSnap.exists()) {
      return { success: false, error: 'Doctor no encontrado' };
    }

    const selectedDoctorData = selectedDoctorSnap.data();

    if (!selectedDoctorData || selectedDoctorData.role !== 'doctor') {
      return { success: false, error: 'Doctor no encontrado' };
    }

    // Crear la cita usando transacción
    const appointmentId = await runTransaction(db, async (transaction) => {
      const appointmentRef = doc(collection(db, 'appointments'));
      const now = Timestamp.now();

      const appointmentData = {
        id: appointmentRef.id,
        doctorId: slotData.doctorId,
        patientId,
        slotId,
        doctorName: selectedDoctorData.displayName || 'Doctor',
        patientName: patientData.displayName || 'Paciente',
        patientPhone: patientData.phone || '',
        date: slotData.date,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        reason: reason || null,
        status: 'Agendada',
        bookedBy: doctorUserId, // Registrar quién agendó la cita
        bookedByRole: 'doctor',
        notes: notes || null,
        createdAt: now,
        updatedAt: now
      };

      // Actualizar el slot para marcarlo como ocupado
      transaction.update(slotRef, {
        status: 'booked',
        appointmentId: appointmentRef.id,
        updatedAt: now
      });

      // Crear la cita
      transaction.set(appointmentRef, appointmentData);

      return appointmentRef.id;
    });

    return {
      success: true,
      appointmentId
    };
  } catch (error: any) {
    console.error('Error booking slot as doctor:', error);
    return {
      success: false,
      error: error.message || 'Error al agendar cita'
    };
  }
}

