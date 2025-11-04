import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Doctor } from '@/lib/types';

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const snapshot = await getDocs(q);
    // Asegurar que el objeto Doctor tenga el campo uid usado por la UI
    return snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as Doctor));
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
      return { uid: docSnap.id, ...docSnap.data() } as Doctor;
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw new Error('Error al cargar doctor');
  }
}

export async function getDoctorsBySpecialty(specialty?: string): Promise<Doctor[]> {
  try {
    let q;
    if (specialty) {
      q = query(
        collection(db, 'users'), 
        where('role', '==', 'doctor'),
        where('specialty', '==', specialty)
      );
    } else {
      q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Doctor));
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    throw new Error('Error al cargar doctores por especialidad');
  }
}

export async function getSpecialties(): Promise<string[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const snapshot = await getDocs(q);
    
    const specialties = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.specialty) {
        specialties.add(data.specialty);
      }
    });
    
    return Array.from(specialties).sort();
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw new Error('Error al cargar especialidades');
  }
}

