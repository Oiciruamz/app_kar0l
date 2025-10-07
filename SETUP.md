# Guía de Instalación Rápida

## 1. Instalar dependencias

```bash
npm install
cd functions && npm install && cd ..
```

## 2. Configurar Firebase

### Crear proyecto Firebase

1. Ve a https://console.firebase.google.com
2. Crea un nuevo proyecto
3. Habilita Authentication → Email/Password
4. Crea una base de datos Firestore (modo producción)
5. Copia las credenciales del proyecto

### Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc...
```

### Desplegar reglas y funciones

```bash
# Instalar Firebase CLI (si no la tienes)
npm install -g firebase-tools

# Hacer login
firebase login

# Inicializar (selecciona tu proyecto)
firebase use --add

# Desplegar Firestore
firebase deploy --only firestore:rules,firestore:indexes

# Desplegar Cloud Functions
firebase deploy --only functions
```

### ⚠️ IMPORTANTE: Configurar TTL de Holds

**Este paso es OBLIGATORIO para que el sistema anti-empalmes funcione:**

1. Ir a Firebase Console → Firestore Database
2. Ir a la pestaña "Indexes"
3. Ir a la sección "TTL (Time to Live)"
4. Click en "Create TTL policy"
5. Configurar:
   - Collection: `holds`
   - Field: `expiresAt`
6. Click "Create"

Esto hará que los documentos en `/holds` se eliminen automáticamente cuando expire el campo `expiresAt`.

## 3. Ejecutar la app

```bash
# Iniciar Expo
npm start

# En otro terminal, ejecutar en dispositivo/emulador
npm run android  # o npm run ios
```

## 4. Probar la app

### Crear usuarios de prueba

1. Registra un usuario como Doctor:
   - Email: `doctor@test.com`
   - Rol: Doctor
   - Especialidad: Ortodoncista

2. Registra un usuario como Paciente:
   - Email: `paciente@test.com`
   - Rol: Paciente

### Flujo de prueba completo

**Como Doctor:**
1. Login con doctor@test.com
2. Ir a "Disponibilidad"
3. Crear slots para la semana (ej: 09:00, 10:00, 11:00)

**Como Paciente:**
1. Cerrar sesión
2. Login con paciente@test.com
3. Ir a "Inicio" y ver doctores
4. Seleccionar el doctor
5. Elegir fecha y horario
6. Observar el countdown de 2 minutos
7. Completar formulario y confirmar
8. Ver la cita en "Mis Citas"

## 5. Verificación

### Verificar Cloud Functions

```bash
firebase functions:log
```

Deberías ver logs de `holdSlot`, `bookSlot`, etc.

### Verificar Firestore

En Firebase Console → Firestore, deberías ver:
- `/users` con perfiles de doctor y paciente
- `/slots` con horarios disponibles
- `/appointments` con citas agendadas
- `/holds` (temporales, se auto-eliminan)

## Troubleshooting

### Error: "Missing AsyncStorage"

```bash
npm install @react-native-async-storage/async-storage
```

### Error: "Cloud Function not found"

Asegúrate de haber desplegado las funciones:
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Error: "Permission denied"

Verifica que las reglas de Firestore estén desplegadas:
```bash
firebase deploy --only firestore:rules
```

### TTL no funciona

1. Verifica en Firebase Console → Firestore → Indexes → TTL
2. La política debe estar en estado "Enabled"
3. Puede tardar unos minutos en activarse después de crearla

## Siguientes pasos

- [ ] Personalizar colores/branding
- [ ] Agregar fotos de perfil para doctores
- [ ] Implementar notificaciones push
- [ ] Agregar recordatorios de citas
- [ ] Dashboard de estadísticas para doctores
- [ ] Sistema de calificaciones/reviews

