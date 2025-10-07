import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Doctor } from '@/lib/types';

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Error al cargar doctores');
  }
}

export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  try {
    const docRef = doc(db, 'users', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().role === 'doctor') {
      return { id: docSnap.id, ...docSnap.data() } as Doctor;
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw new Error('Error al cargar doctor');
  }
}

