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
import { format, addDays } from 'date-fns';

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
// Deterministic ID to avoid duplicates (doctorId_date_startTime)
function slotIdFor(doctorId: string, date: string, startTime: string): string {
  return `${doctorId}_${date}_${startTime}`;
}

async function createSlotIfAbsent(
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string,
  duration: number
): Promise<boolean> {
  const id = slotIdFor(doctorId, date, startTime);
  const refDoc = doc(db, 'slots', id);
  const existing = await getDoc(refDoc);
  if (existing.exists()) return false;
  const newSlot: Omit<TimeSlot, 'id'> = {
    doctorId,
    date,
    startTime,
    endTime,
    duration,
    status: 'available',
    capacity: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  await setDoc(refDoc, newSlot);
  return true;
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

// Utilidad: generar slots a partir del horario del doctor para los próximos N días
export interface GenerateSlotsOptions {
  daysToGenerate?: number; // default 14
  slotDurationMinutes?: number; // default 30
}

interface DayScheduleItem { day: string; enabled?: boolean; startTime: string; endTime: string; }

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function toHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm}`;
}

const WEEK_DAYS_ES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

export async function generateSlotsFromSchedule(
  doctorId: string,
  scheduleDays: DayScheduleItem[],
  options: GenerateSlotsOptions = {}
): Promise<number> {
  const daysToGenerate = options.daysToGenerate ?? 14;
  const slotDuration = options.slotDurationMinutes ?? 30;

  let created = 0;
  for (let i = 0; i < daysToGenerate; i++) {
    const dateObj = addDays(new Date(), i);
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const dayName = WEEK_DAYS_ES[dateObj.getDay()];
    const dayCfg = scheduleDays.find(d => d.day === dayName && d.enabled !== false);
    if (!dayCfg) continue;

    const startMin = toMinutes(dayCfg.startTime);
    const endMin = toMinutes(dayCfg.endTime);
    if (endMin <= startMin) continue;

    for (let t = startMin; t + slotDuration <= endMin; t += slotDuration) {
      const startTime = toHHMM(t);
      const endTime = toHHMM(t + slotDuration);
      try {
        const made = await createSlotIfAbsent(doctorId, dateStr, startTime, endTime, slotDuration);
        if (made) created += 1;
      } catch (e) {
        // continuar con siguientes
      }
    }
  }
  return created;
}

export async function ensureSlotsForDate(
  doctorId: string,
  date: Date,
  scheduleDays: DayScheduleItem[],
  slotDurationMinutes = 30
): Promise<number> {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayName = WEEK_DAYS_ES[date.getDay()];
  const dayCfg = scheduleDays.find(d => d.day === dayName && d.enabled !== false);
  if (!dayCfg) return 0;
  const startMin = toMinutes(dayCfg.startTime);
  const endMin = toMinutes(dayCfg.endTime);
  if (endMin <= startMin) return 0;
  let created = 0;
  for (let t = startMin; t + slotDurationMinutes <= endMin; t += slotDurationMinutes) {
    const startTime = toHHMM(t);
    const endTime = toHHMM(t + slotDurationMinutes);
    const made = await createSlotIfAbsent(doctorId, dateStr, startTime, endTime, slotDurationMinutes);
    if (made) created += 1;
  }
  return created;
}

