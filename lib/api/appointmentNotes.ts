import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { AppointmentNote } from '@/lib/types';

export interface CreateAppointmentNoteRequest {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  referralTo?: string;
  referralReason?: string;
}

export interface UpdateAppointmentNoteRequest {
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  referralTo?: string;
  referralReason?: string;
}

/**
 * Crear una nueva nota médica para una cita
 */
export async function createAppointmentNote(data: CreateAppointmentNoteRequest): Promise<string> {
  try {
    const noteData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'appointmentNotes'), noteData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment note:', error);
    throw new Error('Error al crear nota médica');
  }
}

/**
 * Actualizar una nota médica existente
 */
export async function updateAppointmentNote(
  noteId: string, 
  data: UpdateAppointmentNoteRequest
): Promise<void> {
  try {
    const noteRef = doc(db, 'appointmentNotes', noteId);
    await updateDoc(noteRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating appointment note:', error);
    throw new Error('Error al actualizar nota médica');
  }
}

/**
 * Obtener notas de una cita específica
 */
export async function getAppointmentNotes(appointmentId: string): Promise<AppointmentNote[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const q = query(
      collection(db, 'appointmentNotes'),
      where('appointmentId', '==', appointmentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AppointmentNote));

    // Filtrar notas según el rol del usuario
    return notes.filter(note => {
      // Los doctores pueden ver notas donde ellos son el doctor
      // Los pacientes pueden ver notas donde ellos son el paciente
      return note.doctorId === currentUser.uid || note.patientId === currentUser.uid;
    });
  } catch (error) {
    console.error('Error fetching appointment notes:', error);
    throw new Error('Error al cargar notas médicas');
  }
}

/**
 * Obtener historial médico de un paciente
 */
export async function getPatientHistory(patientId: string): Promise<AppointmentNote[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const q = query(
      collection(db, 'appointmentNotes'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AppointmentNote));

    // Filtrar notas según el rol del usuario
    return notes.filter(note => {
      // Los doctores pueden ver notas donde ellos son el doctor
      // Los pacientes pueden ver notas donde ellos son el paciente
      return note.doctorId === currentUser.uid || note.patientId === currentUser.uid;
    });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    throw new Error('Error al cargar historial médico');
  }
}

/**
 * Obtener una nota específica por ID
 */
export async function getAppointmentNoteById(noteId: string): Promise<AppointmentNote | null> {
  try {
    const noteRef = doc(db, 'appointmentNotes', noteId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      return {
        id: noteSnap.id,
        ...noteSnap.data()
      } as AppointmentNote;
    }
    return null;
  } catch (error) {
    console.error('Error fetching appointment note:', error);
    throw new Error('Error al cargar nota médica');
  }
}

/**
 * Verificar si una cita ya tiene notas
 */
export async function hasAppointmentNotes(appointmentId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'appointmentNotes'),
      where('appointmentId', '==', appointmentId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking appointment notes:', error);
    return false;
  }
}

