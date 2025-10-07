# Martínez Cantú - Dental Clinic App

Aplicación móvil para clínica dental con sistema de citas y gestión de disponibilidad.

## 🏗️ Stack Tecnológico

- **Frontend**: React Native + Expo (TypeScript)
- **Routing**: expo-router
- **Estado**: Zustand
- **Data Fetching**: React Query
- **UI**: NativeWind (Tailwind CSS)
- **Backend**: Firebase (Auth, Firestore, Functions)

## 📱 Características

### Roles

#### Doctor
- ✅ Ver agenda de citas
- ✅ Gestionar disponibilidad (crear/editar slots)
- ✅ Ver perfil
- ✅ Cancelar citas

#### Paciente
- ✅ Explorar dentistas
- ✅ Agendar citas con sistema anti-empalmes
- ✅ Ver mis citas
- ✅ Cancelar citas
- ✅ Ver perfil

### Sistema Anti-Empalmes

El sistema implementa **reservas temporales (holds)** con TTL de 2 minutos:

1. **Selección de slot**: Al seleccionar un horario, se crea un `hold` en Firestore
2. **Countdown**: Timer de 2 minutos para completar la reserva
3. **Confirmación**: Si el paciente confirma a tiempo, el `hold` se convierte en `appointment`
4. **Expiración**: Si expira o se cancela, el slot se libera automáticamente

Todas las operaciones críticas se ejecutan mediante **Cloud Functions transaccionales**:
- `holdSlot`: Reserva temporal de un slot
- `bookSlot`: Confirmación de cita
- `cancelAppointment`: Cancelación de cita

## 🚀 Instalación

### Prerequisitos

- Node.js 18+
- Expo CLI
- Firebase CLI
- Cuenta de Firebase

### 1. Clonar y configurar

```bash
# Instalar dependencias
npm install

# Configurar Firebase
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

### 2. Configurar Firebase

#### a) Crear proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto
3. Habilitar Authentication (Email/Password)
4. Crear base de datos Firestore
5. Copiar configuración del proyecto

#### b) Configurar variables de entorno

Editar `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

#### c) Desplegar reglas y funciones

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (si es necesario)
firebase init

# Desplegar Firestore rules e indexes
firebase deploy --only firestore

# Instalar dependencias de functions
cd functions
npm install
cd ..

# Desplegar Cloud Functions
firebase deploy --only functions
```

#### d) Configurar TTL en Firestore

**IMPORTANTE**: El TTL de los holds se debe configurar manualmente en Firebase Console:

1. Ir a Firestore Database en Firebase Console
2. Ir a "Indexes" → "TTL"
3. Crear política TTL:
   - Collection: `holds`
   - Field: `expiresAt`

### 3. Ejecutar la app

```bash
# Iniciar Expo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## 📁 Estructura del Proyecto

```
├── app/                      # Screens con expo-router
│   ├── (auth)/              # Autenticación
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (doctor)/            # Doctor role
│   │   └── (tabs)/
│   │       ├── agenda.tsx
│   │       ├── availability.tsx
│   │       └── profile.tsx
│   └── (patient)/           # Patient role
│       ├── (tabs)/
│       │   ├── home.tsx
│       │   ├── appointments.tsx
│       │   └── profile.tsx
│       └── booking.tsx      # Flujo de agendado
├── components/              # Componentes reutilizables
│   ├── ui/                 # Componentes base
│   ├── DoctorCard.tsx
│   ├── AppointmentItem.tsx
│   ├── TimeSlotGrid.tsx
│   └── HoldCountdownToast.tsx
├── lib/                     # Core
│   ├── firebase.ts         # Configuración Firebase
│   ├── types.ts            # TypeScript types
│   ├── api/                # API calls
│   ├── hooks/              # Custom hooks
│   └── store/              # Zustand stores
├── functions/               # Cloud Functions
│   └── src/
│       └── index.ts        # holdSlot, bookSlot, cancelAppointment
├── design/
│   └── profile.json        # Design tokens
├── firestore.rules          # Seguridad Firestore
├── firestore.indexes.json   # Índices y TTL
└── firebase.json
```

## 🔐 Seguridad

### Firestore Rules

Las reglas implementan:
- Autenticación requerida para todas las operaciones
- Verificación de roles en `/users/{uid}.role`
- Doctores solo gestionan sus propios slots
- Pacientes solo ven/cancelan sus propias citas
- Cloud Functions tienen permisos especiales para operaciones transaccionales

### Cloud Functions

Todas las operaciones críticas están protegidas:
- Verificación de autenticación
- Verificación de permisos por rol
- Transacciones atómicas
- Validación de estados

## 🎨 Diseño

La UI está basada en `design/profile.json` con tokens de:
- Colores: Paleta primaria (#73506E), neutrales, feedback
- Tipografía: SF Pro Text, Inter
- Espaciado: 4, 8, 12, 16, 24, 32px
- Border radius: 6, 10, 12, 16, 999px
- Touch targets: mínimo 44px (accesibilidad)

## 📊 Modelo de Datos

### Collections

#### `/users/{uid}`
```typescript
{
  uid: string;
  email: string;
  role: 'doctor' | 'patient';
  displayName: string;
  phone: string;
  specialty?: string; // solo doctors
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `/slots/{slotId}`
```typescript
{
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  status: 'available' | 'on_hold' | 'booked';
  capacity: 1;
  holdBy?: string; // if on_hold
  holdExpiresAt?: Timestamp; // if on_hold
  appointmentId?: string; // if booked
}
```

#### `/appointments/{appointmentId}`
```typescript
{
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: 'Agendada' | 'Cancelada' | 'Completada';
}
```

#### `/holds/{holdId}` (con TTL)
```typescript
{
  id: string;
  slotId: string;
  doctorId: string;
  patientId: string;
  expiresAt: Timestamp; // TTL field
  createdAt: Timestamp;
}
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Emuladores de Firebase (opcional)
firebase emulators:start
```

## 📝 Flujo de Agendado

1. **Paciente** selecciona doctor
2. **Paciente** selecciona fecha
3. **Paciente** ve grid de slots disponibles (tiempo real)
4. **Paciente** toca un slot → `holdSlot()` Cloud Function
5. **Sistema** crea hold con TTL de 2 minutos
6. **UI** muestra countdown y formulario
7. **Paciente** completa datos (teléfono, motivo)
8. **Paciente** confirma → `bookSlot()` Cloud Function
9. **Sistema** convierte hold en appointment
10. **UI** muestra confirmación

### Casos Edge

- **Hold expira**: Trigger `onHoldDeleted` libera el slot automáticamente
- **Colisión**: Si 2 usuarios intentan el mismo slot, solo el primero obtiene el hold (transacción)
- **Cancelación**: Paciente/Doctor puede cancelar → slot se libera

## 🌐 Timezone

La app usa `America/Mexico_City` por defecto. Para cambiar:

```typescript
// lib/utils/dates.ts
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'America/Mexico_City';
```

## 🚢 Deployment

### Expo

```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

### Firebase

```bash
# Desplegar todo
firebase deploy

# Solo functions
firebase deploy --only functions

# Solo Firestore
firebase deploy --only firestore
```

## 📄 Licencia

Privado - Martínez Cantú Especialistas Dentales

## 🆘 Soporte

Para issues o preguntas, contactar al equipo de desarrollo.

