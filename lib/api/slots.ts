import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TimeSlot } from '@/lib/types';
import { format } from 'date-fns';

export async function createSlot(doctorId: string, slotData: Partial<TimeSlot>): Promise<string> {
  try {
    const slotRef = doc(collection(db, 'slots'));
    const newSlot: Omit<TimeSlot, 'id'> = {
      doctorId,
      date: slotData.date!,
      startTime: slotData.startTime!,
      endTime: slotData.endTime!,
      duration: slotData.duration || 30,
      status: 'available',
      capacity: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(slotRef, newSlot);
    return slotRef.id;
  } catch (error) {
    console.error('Error creating slot:', error);
    throw new Error('Error al crear horario');
  }
}

export async function updateSlot(slotId: string, updates: Partial<TimeSlot>): Promise<void> {
  try {
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating slot:', error);
    throw new Error('Error al actualizar horario');
  }
}

export async function deleteSlot(slotId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'slots', slotId));
  } catch (error) {
    console.error('Error deleting slot:', error);
    throw new Error('Error al eliminar horario');
  }
}

export async function getSlotsByDoctorAndDate(
  doctorId: string,
  date: Date
): Promise<TimeSlot[]> {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    const q = query(
      collection(db, 'slots'),
      where('doctorId', '==', doctorId),
      where('date', '==', dateStr),
      orderBy('startTime', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeSlot));
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw new Error('Error al cargar horarios');
  }
}

export function subscribeToSlots(
  doctorId: string,
  date: Date,
  callback: (slots: TimeSlot[]) => void
): () => void {
  const dateStr = format(date, 'yyyy-MM-dd');
  const q = query(
    collection(db, 'slots'),
    where('doctorId', '==', doctorId),
    where('date', '==', dateStr),
    orderBy('startTime', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeSlot));
    callback(slots);
  });
}

export async function getAvailableSlots(
  doctorId: string,
  startDate: string,
  endDate: string
): Promise<TimeSlot[]> {
  try {
    const q = query(
      collection(db, 'slots'),
      where('doctorId', '==', doctorId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      where('status', '==', 'available'),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeSlot));
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw new Error('Error al cargar horarios disponibles');
  }
}

