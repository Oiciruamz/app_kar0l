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
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TimeSlot } from '@/lib/types';
import { getDoctors } from '@/lib/api/doctors';

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
    // Normalizar a formato UTC YYYY-MM-DD para que coincida con lo guardado en Firestore
    const dateStr = date.toISOString().split('T')[0];
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
  // Normalizar a formato UTC YYYY-MM-DD para que coincida con lo guardado en Firestore
  const dateStr = date.toISOString().split('T')[0];
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

// Traer todos los horarios de un doctor, agrupados por fecha (YYYY-MM-DD)
export async function getAllSlotsGroupedByDate(
  doctorId: string
): Promise<Record<string, TimeSlot[]>> {
  try {
    const q = query(
      collection(db, 'slots'),
      where('doctorId', '==', doctorId),
      orderBy('date', 'asc'),
      orderBy('startTime', 'asc')
    );

    const snapshot = await getDocs(q);
    const byDate: Record<string, TimeSlot[]> = {};
    snapshot.docs.forEach((d) => {
      const slot = { id: d.id, ...d.data() } as TimeSlot;
      const key = slot.date;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(slot);
    });
    return byDate;
  } catch (error) {
    console.error('Error fetching slots grouped by date:', error);
    throw new Error('Error al cargar horarios por día');
  }
}

// Generar plantilla de intervalos de 30 minutos entre 09:00 y 18:00
function buildHalfHourTemplate(): Array<{ startTime: string; endTime: string }> {
  const slots: Array<{ startTime: string; endTime: string }> = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startH = String(hour).padStart(2, '0');
      const startM = String(minute).padStart(2, '0');
      const endMinutesTotal = hour * 60 + minute + 30;
      const endH = String(Math.floor(endMinutesTotal / 60)).padStart(2, '0');
      const endM = String(endMinutesTotal % 60).padStart(2, '0');
      slots.push({ startTime: `${startH}:${startM}`, endTime: `${endH}:${endM}` });
    }
  }
  return slots;
}

// Crear slots para un doctor en un rango de fechas (solo lunes-viernes), evitando duplicados
export async function createSlotsForDoctorInRange(
  doctorId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<number> {
  // Obtener existentes en el rango para evitar duplicados
  const startStr = rangeStart.toISOString().split('T')[0];
  const endStr = rangeEnd.toISOString().split('T')[0];
  const existingQ = query(
    collection(db, 'slots'),
    where('doctorId', '==', doctorId),
    where('date', '>=', startStr),
    where('date', '<=', endStr)
  );
  const existingSnap = await getDocs(existingQ);
  const existingKeys = new Set<string>(); // date#startTime
  existingSnap.docs.forEach((d) => {
    const data = d.data() as any;
    existingKeys.add(`${data.date}#${data.startTime}`);
  });

  const template = buildHalfHourTemplate();
  let current = new Date(Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth(), rangeStart.getUTCDate()));
  const endUTC = new Date(Date.UTC(rangeEnd.getUTCFullYear(), rangeEnd.getUTCMonth(), rangeEnd.getUTCDate()));

  let createdCount = 0;
  let batch = writeBatch(db);
  let opsInBatch = 0;

  while (current <= endUTC) {
    const day = current.getUTCDay(); // 1-5 L-V
    if (day >= 1 && day <= 5) {
      const dateStr = current.toISOString().split('T')[0];
      for (const t of template) {
        const key = `${dateStr}#${t.startTime}`;
        if (existingKeys.has(key)) continue;
        const ref = doc(collection(db, 'slots'));
        batch.set(ref, {
          doctorId,
          date: dateStr,
          startTime: t.startTime,
          endTime: t.endTime,
          duration: 30,
          status: 'available',
          capacity: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        } as Omit<TimeSlot, 'id'>);
        createdCount++;
        opsInBatch++;
        if (opsInBatch === 450) { // margen bajo el límite de 500
          await batch.commit();
          batch = writeBatch(db);
          opsInBatch = 0;
        }
      }
    }
    // avanzar 1 día UTC
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  return createdCount;
}

// Crear slots para todos los doctores en un mes específico (monthIndex: 0=Ene ... 10=Nov)
export async function createSlotsForAllDoctorsInMonth(
  year: number,
  monthIndex: number // 10 para noviembre
): Promise<{ totalCreated: number; perDoctor: Record<string, number> }> {
  const doctors = await getDoctors();
  const rangeStart = new Date(Date.UTC(year, monthIndex, 1));
  const rangeEnd = new Date(Date.UTC(year, monthIndex + 1, 0));

  const perDoctor: Record<string, number> = {};
  let totalCreated = 0;

  for (const doctor of doctors) {
    const created = await createSlotsForDoctorInRange(doctor.uid, rangeStart, rangeEnd);
    perDoctor[doctor.uid] = created;
    totalCreated += created;
  }

  return { totalCreated, perDoctor };
}

