# Guía de Testing

## Testing Manual

### 1. Sistema de Autenticación

#### Registro
- [ ] Registrar como Doctor con especialidad
- [ ] Registrar como Paciente
- [ ] Validar que los campos requeridos funcionen
- [ ] Verificar que las contraseñas deben coincidir
- [ ] Confirmar que el teléfono requiere 10 dígitos

#### Login
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Verificar que redirecciona al tab correcto según rol

### 2. Flujo del Doctor

#### Disponibilidad
- [ ] Crear slots para diferentes días
- [ ] Crear múltiples slots en el mismo día
- [ ] Verificar que los slots se guardan correctamente en Firestore
- [ ] Intentar crear slot con formato de hora incorrecto

#### Agenda
- [ ] Ver citas agendadas
- [ ] Verificar que solo aparecen citas propias
- [ ] Ver detalles de paciente en cada cita
- [ ] Pull to refresh para actualizar

#### Perfil
- [ ] Ver información del doctor
- [ ] Cerrar sesión
- [ ] Verificar que regresa a login

### 3. Flujo del Paciente

#### Explorar Doctores
- [ ] Ver lista de todos los doctores
- [ ] Ver especialidad de cada doctor
- [ ] Tocar "Ver" para ir a agendar

#### Agendar Cita (Crítico - Sistema Anti-Empalmes)

**Caso 1: Reserva exitosa**
- [ ] Seleccionar doctor
- [ ] Seleccionar fecha
- [ ] Ver grid de horarios disponibles
- [ ] Tocar slot disponible
- [ ] **Verificar que aparece countdown de 2:00**
- [ ] **Verificar que el slot cambia a color "reservado"**
- [ ] Completar teléfono
- [ ] (Opcional) Completar motivo
- [ ] Confirmar cita
- [ ] **Verificar mensaje de éxito**
- [ ] Verificar que la cita aparece en "Mis Citas"

**Caso 2: Reserva expira**
- [ ] Seleccionar slot
- [ ] **Esperar 2 minutos sin confirmar**
- [ ] **Verificar que el countdown llega a 0:00**
- [ ] **Verificar que el slot vuelve a estar disponible**
- [ ] Intentar confirmar (debe fallar)

**Caso 3: Cancelar reserva**
- [ ] Seleccionar slot
- [ ] Tocar "Cancelar" en el toast
- [ ] **Verificar que el slot vuelve a estar disponible**

**Caso 4: Colisión (2 usuarios)**
- [ ] Usuario A selecciona slot → obtiene hold
- [ ] Usuario B intenta el mismo slot
- [ ] **Usuario B debe recibir mensaje de "horario no disponible"**
- [ ] Usuario A confirma → cita creada
- [ ] **Slot debe aparecer "agendado" para ambos usuarios**

**Caso 5: Cambiar de fecha mientras hay hold**
- [ ] Seleccionar slot y obtener hold
- [ ] Cambiar a otra fecha
- [ ] **Hold anterior se debe cancelar**
- [ ] **Slot anterior vuelve a disponible**

#### Mis Citas
- [ ] Ver lista de citas propias
- [ ] Ver estado de cada cita (Agendada/Cancelada)
- [ ] Tocar "Cancelar Cita" en cita agendada
- [ ] Confirmar cancelación
- [ ] Verificar que estado cambia a "Cancelada"
- [ ] Verificar que no se puede cancelar cita pasada

#### Perfil
- [ ] Ver información del paciente
- [ ] Cerrar sesión

### 4. Verificación en Firebase Console

#### Firestore
- [ ] `/users` contiene perfiles con roles correctos
- [ ] `/slots` tienen estructura correcta
- [ ] `/appointments` tienen toda la información
- [ ] `/holds` aparecen cuando se reserva
- [ ] `/holds` desaparecen después de 2 min (TTL)

#### Cloud Functions Logs
```bash
firebase functions:log --limit 50
```

Verificar logs de:
- [ ] `holdSlot` - debe registrar éxitos
- [ ] `holdSlot` - debe registrar colisiones
- [ ] `bookSlot` - debe crear appointments
- [ ] `cancelAppointment` - debe liberar slots
- [ ] `onHoldDeleted` - debe ejecutarse al expirar holds

### 5. Edge Cases

#### Timezone
- [ ] Crear slot a las 23:00
- [ ] Verificar que se guarda en timezone correcto
- [ ] Verificar que se muestra correctamente

#### Concurrent Access
- [ ] Doctor modifica slot mientras paciente lo mira
- [ ] Verificar que paciente ve cambios en tiempo real
- [ ] Doctor cancela cita → slot se libera automáticamente

#### Network Issues
- [ ] Poner device en modo avión
- [ ] Intentar agendar cita (debe fallar)
- [ ] Restaurar conexión
- [ ] Verificar que la app se recupera

### 6. Performance

#### Real-time Updates
- [ ] Abrir booking screen
- [ ] En otro dispositivo/browser, cambiar status de slot
- [ ] **Verificar que el primer dispositivo actualiza automáticamente**

#### Load Time
- [ ] Medir tiempo de carga inicial
- [ ] Verificar que listas grandes (50+ slots) funcionan bien
- [ ] Scroll en listas debe ser fluido

## Testing Automatizado (Opcional)

### Ejemplos de tests unitarios

```typescript
// __tests__/useHoldCountdown.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useHoldCountdown } from '@/lib/hooks/useHoldCountdown';

test('countdown decrements correctly', () => {
  const expiresAt = Date.now() + 120000; // 2 min
  const { result } = renderHook(() => useHoldCountdown(expiresAt));
  
  expect(result.current.minutes).toBe(2);
  expect(result.current.seconds).toBe(0);
});
```

### Tests de Cloud Functions

```typescript
// functions/src/__tests__/holdSlot.test.ts
import * as test from 'firebase-functions-test';

describe('holdSlot', () => {
  it('should create hold for available slot', async () => {
    // Test implementation
  });
  
  it('should reject if slot already on hold', async () => {
    // Test implementation
  });
});
```

## Checklist de Producción

Antes de lanzar a producción:

- [ ] Todas las variables de entorno están configuradas
- [ ] Cloud Functions desplegadas y funcionando
- [ ] Firestore rules desplegadas
- [ ] Índices de Firestore creados
- [ ] TTL de holds configurado y activo
- [ ] Authentication habilitado en Firebase
- [ ] Testing manual completado 100%
- [ ] Performance verificado en dispositivos reales
- [ ] App builds (Android/iOS) generadas
- [ ] Documentación actualizada
- [ ] Credenciales de prueba removidas del código

## Bugs Conocidos / Mejoras Futuras

- [ ] Agregar validación de horarios duplicados en doctor
- [ ] Implementar confirmación visual cuando hold se obtiene
- [ ] Agregar animaciones en cambios de estado de slots
- [ ] Notificaciones push cuando cita está próxima
- [ ] Email de confirmación después de agendar
- [ ] Permitir a doctor bloquear días completos
- [ ] Historial de citas completadas con notas

