import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DoctorNote } from '@/lib/types';

export async function getDoctorNotes(doctorId: string): Promise<DoctorNote[]> {
  try {
    const q = query(
      collection(db, 'doctorNotes'), 
      where('doctorId', '==', doctorId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorNote));
  } catch (error) {
    console.error('Error fetching doctor notes:', error);
    throw new Error('Error al cargar notas');
  }
}

export async function createDoctorNote(doctorId: string, note: Omit<DoctorNote, 'id' | 'doctorId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'doctorNotes'), {
      doctorId,
      ...note,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating doctor note:', error);
    throw new Error('Error al crear nota');
  }
}

export async function updateDoctorNote(noteId: string, updates: Partial<Pick<DoctorNote, 'title' | 'content'>>): Promise<void> {
  try {
    const noteRef = doc(db, 'doctorNotes', noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating doctor note:', error);
    throw new Error('Error al actualizar nota');
  }
}

export async function deleteDoctorNote(noteId: string): Promise<void> {
  try {
    const noteRef = doc(db, 'doctorNotes', noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Error deleting doctor note:', error);
    throw new Error('Error al eliminar nota');
  }
}
