import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment } from '@/lib/types';

export async function getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      orderBy('date', 'desc'),
      orderBy('startTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw new Error('Error al cargar citas');
  }
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  try {
    console.log('🔍 getAppointmentsByPatient - Iniciando consulta para paciente:', patientId);
    
    // Consulta simplificada que no requiere índice compuesto
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId)
    );
    
    console.log('🔍 getAppointmentsByPatient - Ejecutando consulta...');
    const snapshot = await getDocs(q);
    console.log('🔍 getAppointmentsByPatient - Consulta completada. Documentos encontrados:', snapshot.size);
    
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    console.log('🔍 getAppointmentsByPatient - Citas mapeadas:', appointments.length);
    
    // Ordenar manualmente por fecha y hora (descendente)
    const sortedAppointments = appointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('🔍 getAppointmentsByPatient - Citas ordenadas:', sortedAppointments.length);
    console.log('🔍 getAppointmentsByPatient - Primera cita:', sortedAppointments[0] ? {
      id: sortedAppointments[0].id,
      date: sortedAppointments[0].date,
      startTime: sortedAppointments[0].startTime,
      doctorName: sortedAppointments[0].doctorName,
      status: sortedAppointments[0].status,
      bookedByRole: sortedAppointments[0].bookedByRole
    } : 'No hay citas');
    
    return sortedAppointments;
  } catch (error) {
    console.error('❌ Error fetching patient appointments:', error);
    throw new Error('Error al cargar mis citas');
  }
}

export async function getAppointmentById(appointmentId: string): Promise<Appointment | null> {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    }
    return null;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw new Error('Error al cargar cita');
  }
}

