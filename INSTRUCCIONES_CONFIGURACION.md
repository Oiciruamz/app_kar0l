# 🚀 Instrucciones de Configuración - Base de Datos

Esta guía te ayudará a configurar completamente tu base de datos Firestore con datos de prueba y resolver el error de índices.

## 📋 Pasos a Seguir

### Paso 1: Resolver el Error de Índices ⚠️

El error que estás viendo ocurre porque Firestore necesita índices compuestos para realizar búsquedas complejas. Hay dos formas de solucionarlo:

#### Opción A: Desplegar índices automáticamente (Recomendado)

1. Instala Firebase CLI si no lo tienes:
   ```bash
   npm install -g firebase-tools
   ```

2. Inicia sesión en Firebase:
   ```bash
   firebase login
   ```

3. Inicializa Firebase en tu proyecto (si no lo has hecho):
   ```bash
   firebase init firestore
   ```
   - Selecciona tu proyecto: **clinica-dental-62439**
   - Acepta los archivos predeterminados

4. Despliega los índices:
   ```bash
   firebase deploy --only firestore:indexes
   ```

Este comando leerá el archivo `firestore.indexes.json` y creará automáticamente todos los índices necesarios en tu proyecto.

#### Opción B: Crear índices manualmente en la consola

1. Ve a: https://console.firebase.google.com/project/clinica-dental-62439/firestore/indexes

2. Haz clic en **"Agregar índice"** (o "Create Index")

3. Crea estos **3 índices**:

   **Índice 1:**
   - Collection ID: `appointments`
   - Fields:
     - `doctorId`: Ascending
     - `date`: Descending
     - `startTime`: Descending
   - Query scope: Collection

   **Índice 2:**
   - Collection ID: `appointments`
   - Fields:
     - `patientId`: Ascending
     - `date`: Descending
     - `startTime`: Descending
   - Query scope: Collection

   **Índice 3:**
   - Collection ID: `slots`
   - Fields:
     - `doctorId`: Ascending
     - `date`: Ascending
     - `startTime`: Ascending
   - Query scope: Collection

4. Espera 5-10 minutos a que se construyan los índices (verás el estado "Building..." → "Enabled")

---

### Paso 2: Descargar Service Account Key

Para ejecutar el script de población de datos, necesitas credenciales de administrador:

1. Ve a [Firebase Console](https://console.firebase.google.com/)

2. Selecciona tu proyecto: **clinica-dental-62439**

3. Haz clic en el ícono de **engranaje ⚙️** → **"Configuración del proyecto"** (Project Settings)

4. Ve a la pestaña **"Cuentas de servicio"** (Service Accounts)

5. Selecciona **"Firebase Admin SDK"**

6. Haz clic en **"Generar nueva clave privada"** (Generate new private key)

7. Confirma haciendo clic en **"Generar clave"**

8. Se descargará un archivo JSON (algo como `clinica-dental-62439-firebase-adminsdk-xxxxx.json`)

9. **Renombra el archivo a:** `serviceAccountKey.json`

10. **Mueve el archivo a la carpeta raíz de tu proyecto:**
    ```
    C:\Users\mauri\OneDrive\Escritorio\App_Karol\serviceAccountKey.json
    ```

⚠️ **MUY IMPORTANTE:** Este archivo contiene credenciales de administrador. NUNCA lo subas a Git o lo compartas. Ya está agregado al `.gitignore` para protegerlo.

---

### Paso 3: Instalar Dependencias del Script

```bash
cd scripts
npm install
```

Esto instalará:
- `firebase-admin`: SDK de administración de Firebase
- `date-fns`: Utilidades para manejo de fechas

---

### Paso 4: Ejecutar el Script de Población

Desde la carpeta `scripts`:

```bash
npm run seed
```

O directamente:

```bash
node seedDatabase.js
```

**El script creará:**

✅ **6 Doctores** con diferentes especialidades:
- Dr. Carlos García (Odontología General)
- Dra. María Martínez (Ortodoncia)
- Dr. Juan López (Endodoncia)
- Dra. Ana Rodríguez (Periodoncia)
- Dr. Roberto Hernández (Cirugía Maxilofacial)
- Dra. Laura Torres (Odontopediatría)

✅ **15 Pacientes** con diferentes nombres

✅ **~2,000 Slots de tiempo** distribuidos en:
- Próximos 30 días
- Lunes a viernes
- Horario: 9:00 AM - 6:00 PM
- Duración: 30 minutos cada uno

✅ **~25 Citas confirmadas** entre pacientes y doctores

**Tiempo estimado:** 2-5 minutos dependiendo de tu conexión a internet.

---

## 🔑 Credenciales de Prueba

Una vez ejecutado el script, podrás iniciar sesión con estas cuentas:

### 👨‍⚕️ Doctores

| Email | Contraseña | Especialidad |
|-------|------------|--------------|
| dr.garcia@clinica.com | Doctor123! | Odontología General |
| dra.martinez@clinica.com | Doctor123! | Ortodoncia |
| dr.lopez@clinica.com | Doctor123! | Endodoncia |
| dra.rodriguez@clinica.com | Doctor123! | Periodoncia |
| dr.hernandez@clinica.com | Doctor123! | Cirugía Maxilofacial |
| dra.torres@clinica.com | Doctor123! | Odontopediatría |

### 👤 Pacientes

| Email | Contraseña | Nombre |
|-------|------------|--------|
| paciente1@email.com | Paciente123! | Miguel Pérez |
| paciente2@email.com | Paciente123! | Sofia González |
| paciente3@email.com | Paciente123! | Daniel Ramírez |
| ... | Paciente123! | ... |
| paciente15@email.com | Paciente123! | Pedro Gutiérrez |

**Todos los pacientes usan la misma contraseña:** `Paciente123!`

---

## ✅ Verificación

Para verificar que todo funciona:

1. **Verifica en Firebase Console:**
   - Ve a: https://console.firebase.google.com/project/clinica-dental-62439/firestore/data
   - Deberías ver colecciones: `users`, `slots`, `appointments`

2. **Prueba en la app:**
   - Inicia sesión como doctor: `dr.garcia@clinica.com` / `Doctor123!`
   - Ve a la pestaña "Agenda" y verifica que veas citas
   - Ve a "Disponibilidad" y verifica que veas los horarios

   - Inicia sesión como paciente: `paciente1@email.com` / `Paciente123!`
   - Ve a "Inicio" y verifica que veas doctores disponibles
   - Ve a "Mis Citas" y verifica si tienes alguna cita

---

## 🔄 Repoblar la Base de Datos

Si necesitas volver a llenar la base de datos:

1. **Elimina los datos existentes** (opcional):
   - Ve a Firebase Console → Firestore Database
   - Elimina las colecciones manualmente o usa un script

2. **Vuelve a ejecutar el script:**
   ```bash
   cd scripts
   npm run seed
   ```

El script es inteligente y no creará usuarios duplicados si ya existen.

---

## 🆘 Solución de Problemas

### Error: "Cannot find module '../serviceAccountKey.json'"
- Verifica que el archivo `serviceAccountKey.json` esté en la carpeta raíz del proyecto
- Verifica que el nombre del archivo sea exactamente `serviceAccountKey.json`

### Error: "Permission denied"
- Asegúrate de haber descargado la clave correcta desde Firebase Console
- Verifica que tu proyecto de Firebase tenga Firestore habilitado

### Los índices siguen sin funcionar
- Espera 10-15 minutos después de crear los índices
- Verifica en Firebase Console que los índices estén en estado "Enabled" y no "Building"

### El script se ejecuta pero no veo datos
- Verifica en Firebase Console que los datos se hayan creado
- Reinicia tu aplicación React Native
- Verifica que estés usando el mismo proyecto de Firebase

---

## 📞 Contacto

Si tienes problemas o preguntas, revisa:
- Los logs del script cuando se ejecuta
- La consola de Firebase para errores
- Los logs de tu aplicación móvil

¡Listo! Tu aplicación ahora debería estar completamente funcional con datos de prueba. 🎉

