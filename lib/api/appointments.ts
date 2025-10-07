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
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc'),
      orderBy('startTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
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

