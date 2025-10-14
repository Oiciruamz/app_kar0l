# Implementación de Restricciones de Citas

## Problema Solucionado
- **Antes**: Los usuarios podían agendar múltiples citas con el mismo doctor
- **Antes**: Los usuarios podían agendar citas con diferentes doctores en el mismo horario
- **Antes**: Los usuarios podían agendar múltiples citas el mismo día
- **Ahora**: Un usuario solo puede tener UNA cita activa con cada doctor específico
- **Ahora**: Un usuario no puede tener citas con diferentes doctores en horarios solapados
- **Ahora**: Un usuario NO puede agendar NINGUNA cita el mismo día si ya tiene una cita previa

## Archivos Modificados

### 1. `lib/api/validation.ts` (NUEVO)
- **Función**: `checkExistingAppointmentWithDoctor()` - Verifica si ya tiene cita con un doctor
- **Función**: `checkConflictingAppointment()` - Verifica conflictos de horario
- **Función**: `checkSameDayAppointment()` - Verifica si ya tiene cita el mismo día (NUEVA)
- **Función**: `isTimeOverlap()` - Detecta solapamiento de horarios
- **Función**: `validateAppointmentBooking()` - Validación completa

### 2. `functions/src/index.ts` (MODIFICADO)
- **Agregado**: Validaciones antes de crear citas en `bookSlot()`
- **Agregado**: Función `isTimeOverlap()` para detectar solapamientos
- **Validaciones**:
  - Verificar si ya tiene cita el mismo día (NUEVA RESTRICCIÓN)
  - Verificar si ya tiene cita con el mismo doctor
  - Verificar si tiene conflicto de horario con otra cita

### 3. `lib/api/clientBooking.ts` (MODIFICADO)
- **Agregado**: Importaciones necesarias para consultas a Firestore
- **Agregado**: Función `isTimeOverlap()` local
- **Modificado**: `bookSlot()` con las mismas validaciones del backend
- **Validaciones**:
  - Verificar si ya tiene cita el mismo día (NUEVA RESTRICCIÓN)
  - Verificar si ya tiene cita con el mismo doctor
  - Verificar si tiene conflicto de horario con otra cita

### 4. `app/(patient)/new-booking.tsx` (MODIFICADO)
- **Mejorado**: Mensajes de error más específicos
- **Títulos de alerta**:
  - "Cita del Mismo Día" para citas el mismo día (NUEVO)
  - "Cita Duplicada" para citas con el mismo doctor
  - "Conflicto de Horario" para horarios solapados
  - "Reserva Expirada" para holds expirados

### 5. `app/(patient)/booking.tsx` (MODIFICADO)
- **Mejorado**: Mensajes de error más específicos
- **Mismos títulos de alerta** que new-booking.tsx

### 6. `scripts/testAppointmentValidations.js` (NUEVO)
- **Script de prueba** para validar la implementación
- **Pruebas de solapamiento** de horarios
- **Pruebas de validación** de citas (requiere Firebase configurado)

## Lógica de Validación

### Restricción por Día (NUEVA)
```typescript
// Buscar citas activas el mismo día
const sameDayAppointments = await getDocs(
  query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId),
    where('date', '==', date),
    where('status', '==', 'Agendada')
  )
);
```

### Restricción por Doctor
```typescript
// Buscar citas activas con el mismo doctor
const existingDoctorAppointments = await getDocs(
  query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId),
    where('doctorId', '==', doctorId),
    where('status', '==', 'Agendada')
  )
);
```

### Restricción por Horario
```typescript
// Buscar citas activas en la misma fecha
const conflictingAppointments = await getDocs(
  query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId),
    where('date', '==', date),
    where('status', '==', 'Agendada')
  )
);

// Verificar solapamiento de horarios
for (const doc of conflictingAppointments.docs) {
  const appointment = doc.data();
  if (isTimeOverlap(startTime, endTime, appointment.startTime, appointment.endTime)) {
    return { success: false, error: 'Ya tienes una cita agendada en este horario con otro doctor' };
  }
}
```

### Detección de Solapamiento
```typescript
function isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);
  
  // Dos rangos se solapan si uno empieza antes de que termine el otro
  return start1Min < end2Min && start2Min < end1Min;
}
```

## Estados de Citas Considerados

- **'Agendada'**: ✅ Genera restricciones (no se puede agendar otra)
- **'Cancelada'**: ❌ NO genera restricciones (se puede agendar nueva cita)
- **'Completada'**: ❌ NO genera restricciones (se puede agendar nueva cita)

## Mensajes de Error

1. **"Ya tienes una cita agendada para este día"** (NUEVO)
   - Cuando intenta agendar cualquier cita el mismo día

2. **"Ya tienes una cita agendada con este doctor"**
   - Cuando intenta agendar segunda cita con el mismo doctor

3. **"Ya tienes una cita agendada en este horario con otro doctor"**
   - Cuando intenta agendar cita en horario solapado con otra cita

4. **"La reserva expiró. Selecciona otro horario."**
   - Cuando el hold temporal expira (2 minutos)

## Pruebas

Para probar la implementación:

1. **Ejecutar script de prueba**:
   ```bash
   node scripts/testAppointmentValidations.js
   ```

2. **Escenarios de prueba manual**:
   - Agendar primera cita con doctor A ✅
   - Intentar agendar segunda cita el mismo día con doctor B ❌ (NUEVA RESTRICCIÓN)
   - Agendar cita con doctor B en día diferente ✅
   - Intentar agendar segunda cita con doctor A en día diferente ❌
   - Cancelar cita y agendar nueva con el mismo doctor ✅

## Beneficios

1. **Prevención de doble agendamiento** con el mismo doctor
2. **Prevención de conflictos de horario** entre diferentes doctores
3. **Prevención de múltiples citas el mismo día** (NUEVA FUNCIONALIDAD)
4. **Mejor experiencia de usuario** con mensajes de error claros
5. **Consistencia** entre cliente y servidor
6. **Mantenimiento de integridad** de datos en la base de datos
