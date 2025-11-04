import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
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

// Horario del doctor
export interface DoctorDailySchedule {
  day: string; // Lunes, Martes, ...
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface DoctorSchedule {
  days: DoctorDailySchedule[];
  updatedAt?: number; // epoch ms
}

export async function getDoctorSchedule(doctorId: string): Promise<DoctorSchedule | null> {
  try {
    const userRef = doc(db, 'users', doctorId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return (data.schedule as DoctorSchedule) || null;
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    throw new Error('Error al cargar horario');
  }
}

export async function updateDoctorSchedule(doctorId: string, schedule: DoctorSchedule): Promise<void> {
  try {
    const userRef = doc(db, 'users', doctorId);
    await updateDoc(userRef, {
      schedule: { ...schedule, updatedAt: Date.now() }
    });
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    throw new Error('Error al actualizar horario');
  }
}

export async function updateDoctorProfile(
  doctorId: string,
  updates: Partial<Pick<Doctor, 'bio' | 'specialty' | 'displayName' | 'phone' | 'photoURL'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', doctorId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    } as any);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    throw new Error('Error al actualizar perfil');
  }
}

