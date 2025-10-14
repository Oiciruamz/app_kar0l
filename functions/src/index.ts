import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Configurar región para las Cloud Functions
const region = 'us-central1';

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

// Types
interface HoldSlotRequest {
  doctorId: string;
  slotId: string;
}

interface HoldSlotResponse {
  success: boolean;
  holdId?: string;
  expiresAt?: number;
  error?: string;
}

interface BookSlotRequest {
  holdId: string;
  patientPhone: string;
  reason?: string;
}

interface BookSlotResponse {
  success: boolean;
  appointmentId?: string;
  error?: string;
}

interface CancelAppointmentRequest {
  appointmentId: string;
}

interface CancelAppointmentResponse {
  success: boolean;
  error?: string;
}

// Hold a slot for 2 minutes
export const holdSlot = functions.region(region).https.onCall(
  async (data: HoldSlotRequest, context): Promise<HoldSlotResponse> => {
    // Authentication check
    if (!context.auth) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { doctorId, slotId } = data;
    const patientId = context.auth.uid;

    if (!doctorId || !slotId) {
      return { success: false, error: 'Datos inválidos' };
    }

    try {
      // Run transaction
      const result = await db.runTransaction(async (transaction) => {
        const slotRef = db.collection('slots').doc(slotId);
        const slotDoc = await transaction.get(slotRef);

        if (!slotDoc.exists) {
          throw new Error('Horario no encontrado');
        }

        const slotData = slotDoc.data();

        // Check if slot is available
        if (slotData?.status !== 'available') {
          throw new Error('Ese horario acaba de agendarse. Elige otro.');
        }

        // Check if slot belongs to the doctor
        if (slotData?.doctorId !== doctorId) {
          throw new Error('Horario inválido');
        }

        // Create hold
        const holdRef = db.collection('holds').doc();
        const now = admin.firestore.Timestamp.now();
        const expiresAt = admin.firestore.Timestamp.fromMillis(
          now.toMillis() + 120000 // 2 minutes = 120000ms
        );

        const holdData = {
          id: holdRef.id,
          slotId,
          doctorId,
          patientId,
          expiresAt,
          createdAt: now
        };

        // Update slot to on_hold
        transaction.update(slotRef, {
          status: 'on_hold',
          holdBy: patientId,
          holdExpiresAt: expiresAt,
          updatedAt: now
        });

        // Create hold document
        transaction.set(holdRef, holdData);

        return {
          holdId: holdRef.id,
          expiresAt: expiresAt.toMillis()
        };
      });

      return {
        success: true,
        holdId: result.holdId,
        expiresAt: result.expiresAt
      };
    } catch (error: any) {
      console.error('Error holding slot:', error);
      return {
        success: false,
        error: error.message || 'Error al reservar horario'
      };
    }
  }
);

// Book a slot (convert hold to appointment)
export const bookSlot = functions.region(region).https.onCall(
  async (data: BookSlotRequest, context): Promise<BookSlotResponse> => {
    // Authentication check
    if (!context.auth) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { holdId, patientPhone, reason } = data;
    const patientId = context.auth.uid;

    if (!holdId || !patientPhone) {
      return { success: false, error: 'Datos inválidos' };
    }

    try {
      // Get user profile
      const userDoc = await db.collection('users').doc(patientId).get();
      if (!userDoc.exists) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      const userData = userDoc.data();

      // VALIDACIÓN: Verificar restricciones de citas antes de proceder
      const holdDoc = await db.collection('holds').doc(holdId).get();
      if (!holdDoc.exists) {
        return { success: false, error: 'La reserva expiró. Selecciona otro horario.' };
      }

      const holdData = holdDoc.data();
      if (!holdData) {
        return { success: false, error: 'Datos de reserva inválidos' };
      }

      // Verificar que el hold pertenece al usuario
      if (holdData.patientId !== patientId) {
        return { success: false, error: 'Reserva inválida' };
      }

      // Verificar que no expiró
      const now = admin.firestore.Timestamp.now();
      if (holdData.expiresAt.toMillis() < now.toMillis()) {
        return { success: false, error: 'La reserva expiró. Selecciona otro horario.' };
      }

      // Obtener información del slot para las validaciones
      const slotDoc = await db.collection('slots').doc(holdData.slotId).get();
      if (!slotDoc.exists) {
        return { success: false, error: 'Horario no encontrado' };
      }

      const slotData = slotDoc.data();
      if (!slotData) {
        return { success: false, error: 'Datos de horario inválidos' };
      }

      // Verificar que el slot está en hold
      if (slotData.status !== 'on_hold') {
        return { success: false, error: 'El horario ya no está disponible' };
      }

      // VALIDACIONES DE RESTRICCIONES DE CITAS
      // 1. Verificar si ya tiene cita con este doctor
      const existingDoctorAppointments = await db.collection('appointments')
        .where('patientId', '==', patientId)
        .where('doctorId', '==', slotData.doctorId)
        .where('status', '==', 'Agendada')
        .get();

      if (!existingDoctorAppointments.empty) {
        return { 
          success: false, 
          error: 'Ya tienes una cita agendada con este doctor' 
        };
      }

      // 2. Verificar si tiene conflicto de horario con otra cita
      const conflictingAppointments = await db.collection('appointments')
        .where('patientId', '==', patientId)
        .where('date', '==', slotData.date)
        .where('status', '==', 'Agendada')
        .get();

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

      // Run transaction
      const appointmentId = await db.runTransaction(async (transaction) => {
        const holdRef = db.collection('holds').doc(holdId);
        const slotRef = db.collection('slots').doc(holdData.slotId);

        // Get doctor info
        const doctorDoc = await transaction.get(
          db.collection('users').doc(slotData.doctorId)
        );
        const doctorData = doctorDoc.data();

        // Create appointment
        const appointmentRef = db.collection('appointments').doc();
        const appointmentData = {
          id: appointmentRef.id,
          doctorId: slotData.doctorId,
          patientId,
          slotId: holdData.slotId,
          doctorName: doctorData?.displayName || 'Doctor',
          patientName: userData?.displayName || 'Paciente',
          patientPhone,
          date: slotData.date,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          reason: reason || null,
          status: 'Agendada',
          createdAt: now,
          updatedAt: now
        };

        // Update slot to booked
        transaction.update(slotRef, {
          status: 'booked',
          appointmentId: appointmentRef.id,
          holdBy: admin.firestore.FieldValue.delete(),
          holdExpiresAt: admin.firestore.FieldValue.delete(),
          updatedAt: now
        });

        // Create appointment
        transaction.set(appointmentRef, appointmentData);

        // Delete hold
        transaction.delete(holdRef);

        return appointmentRef.id;
      });

      return {
        success: true,
        appointmentId
      };
    } catch (error: any) {
      console.error('Error booking slot:', error);
      return {
        success: false,
        error: error.message || 'Error al agendar cita'
      };
    }
  }
);

// Cancel an appointment
export const cancelAppointment = functions.region(region).https.onCall(
  async (data: CancelAppointmentRequest, context): Promise<CancelAppointmentResponse> => {
    // Authentication check
    if (!context.auth) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { appointmentId } = data;
    const userId = context.auth.uid;

    if (!appointmentId) {
      return { success: false, error: 'Datos inválidos' };
    }

    try {
      // Get user to check role
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      const userRole = userDoc.data()?.role;

      // Run transaction
      await db.runTransaction(async (transaction) => {
        const appointmentRef = db.collection('appointments').doc(appointmentId);
        const appointmentDoc = await transaction.get(appointmentRef);

        if (!appointmentDoc.exists) {
          throw new Error('Cita no encontrada');
        }

        const appointmentData = appointmentDoc.data();
        
        if (!appointmentData) {
          throw new Error('Datos de cita inválidos');
        }

        // Check permissions (patient can only cancel their own, doctor can cancel theirs)
        if (userRole === 'patient' && appointmentData.patientId !== userId) {
          throw new Error('No tienes permiso para cancelar esta cita');
        }
        if (userRole === 'doctor' && appointmentData.doctorId !== userId) {
          throw new Error('No tienes permiso para cancelar esta cita');
        }

        // Update appointment status
        const now = admin.firestore.Timestamp.now();
        transaction.update(appointmentRef, {
          status: 'Cancelada',
          cancelledAt: now,
          updatedAt: now
        });

        // Free up the slot if appointment is in the future
        const slotRef = db.collection('slots').doc(appointmentData.slotId);
        const slotDoc = await transaction.get(slotRef);

        if (slotDoc.exists) {
          transaction.update(slotRef, {
            status: 'available',
            appointmentId: admin.firestore.FieldValue.delete(),
            updatedAt: now
          });
        }
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        error: error.message || 'Error al cancelar cita'
      };
    }
  }
);

// Trigger: When a hold is deleted (TTL), release the slot
export const onHoldDeleted = functions.region(region).firestore
  .document('holds/{holdId}')
  .onDelete(async (snapshot, context) => {
    const holdData = snapshot.data();
    const { slotId, patientId } = holdData;

    try {
      await db.runTransaction(async (transaction) => {
        const slotRef = db.collection('slots').doc(slotId);
        const slotDoc = await transaction.get(slotRef);

        if (!slotDoc.exists) {
          return;
        }

        const slotData = slotDoc.data();

        // Only release if still on hold by this user
        if (slotData?.status === 'on_hold' && slotData?.holdBy === patientId) {
          transaction.update(slotRef, {
            status: 'available',
            holdBy: admin.firestore.FieldValue.delete(),
            holdExpiresAt: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.Timestamp.now()
          });
        }
      });

      console.log(`Hold ${context.params.holdId} deleted, slot ${slotId} released`);
    } catch (error) {
      console.error('Error releasing slot on hold delete:', error);
    }
  });

