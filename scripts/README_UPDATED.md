# Scripts de Base de Datos - Actualizado

Este directorio contiene scripts para poblar y administrar la base de datos Firestore, incluyendo las nuevas funcionalidades de notas médicas.

## 🚨 Solución al Error de AppointmentNotes

Si estás viendo el error:
```
Error loading appointment data: [Error: Error al cargar historial médico]
```

Esto significa que la colección `appointmentNotes` no existe en tu base de datos. Usa uno de estos scripts para solucionarlo:

## 📋 Scripts Disponibles

### 1. **Agregar Solo las Colecciones Faltantes** (RECOMENDADO)
```bash
cd scripts
npm run add-notes
```
- ✅ Mantiene datos existentes
- ✅ Solo agrega `appointmentNotes`
- ✅ Actualiza citas con campos faltantes
- ✅ Crea historial médico de ejemplo

### 2. **Poblar Base de Datos Completa**
```bash
cd scripts
npm run seed-full
```
- ✅ Crea toda la base de datos desde cero
- ✅ Incluye doctores, pacientes, slots, citas y notas
- ⚠️ **REEMPLAZA** datos existentes

### 3. **Script Original**
```bash
cd scripts
npm run seed
```
- ✅ Script original sin notas médicas
- ❌ No incluye `appointmentNotes`

## 🔧 Configuración Inicial

### 1. Descargar Service Account Key

Necesitas descargar tu clave de cuenta de servicio desde Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **clinica-dental-62439**
3. Haz clic en el ícono de engranaje ⚙️ → **Configuración del proyecto**
4. Ve a la pestaña **"Cuentas de servicio"**
5. Haz clic en **"Generar nueva clave privada"**
6. Se descargará un archivo JSON
7. **Renombra el archivo a `serviceAccountKey.json`**
8. **Mueve el archivo a la carpeta raíz del proyecto**

⚠️ **IMPORTANTE:** Este archivo contiene credenciales sensibles. **NUNCA** lo subas a Git.

### 2. Instalar Dependencias

```bash
cd scripts
npm install
```

## 🚀 Uso Rápido

### Para Solucionar el Error Actual:
```bash
cd scripts
npm run add-notes
```

### Para Base de Datos Completa:
```bash
cd scripts
npm run seed-full
```

## 📊 Datos Creados

### Con `npm run add-notes`:
- ✅ Notas médicas para citas existentes
- ✅ Historial médico de ejemplo
- ✅ Campos faltantes en citas (`bookedBy`, `bookedByRole`)

### Con `npm run seed-full`:
- ✅ **6 doctores** con diferentes especialidades
- ✅ **5 pacientes**
- ✅ **~1,500 slots de tiempo** (próximos 30 días)
- ✅ **10 citas** de ejemplo
- ✅ **13 notas médicas** (citas + historial)

## 🔑 Credenciales de Prueba

Después de ejecutar cualquier script:

### 👨‍⚕️ Doctores:
- **dr.garcia@clinica.com** / Doctor123! (Odontología General)
- **dra.martinez@clinica.com** / Doctor123! (Ortodoncia)
- **dr.lopez@clinica.com** / Doctor123! (Endodoncia)
- **dra.rodriguez@clinica.com** / Doctor123! (Periodoncia)
- **dr.hernandez@clinica.com** / Doctor123! (Cirugía Maxilofacial)
- **dra.torres@clinica.com** / Doctor123! (Odontopediatría)

### 👤 Pacientes:
- **paciente1@email.com** / Paciente123! (Miguel Pérez)
- **paciente2@email.com** / Paciente123! (Sofia González)
- **paciente3@email.com** / Paciente123! (Daniel Ramírez)
- **paciente4@email.com** / Paciente123! (Carmen Flores)
- **paciente5@email.com** / Paciente123! (Fernando Morales)

## ✅ Verificación

Para verificar que todo funciona:

1. **Verifica en Firebase Console:**
   - Ve a: https://console.firebase.google.com/project/clinica-dental-62439/firestore/data
   - Deberías ver colecciones: `users`, `slots`, `appointments`, `appointmentNotes`

2. **Prueba en la app:**
   - Inicia sesión como doctor: `dr.garcia@clinica.com` / `Doctor123!`
   - Ve a la pestaña "Agenda" y toca una cita
   - Deberías ver la pantalla de detalle con notas médicas
   - Prueba el botón "Agendar Nueva Cita"

## 🔄 Repoblar la Base de Datos

Si necesitas volver a llenar la base de datos:

```bash
cd scripts
npm run seed-full
```

## 🆘 Solución de Problemas

### Error: "No se encontró serviceAccountKey.json"
- Descarga la clave de servicio desde Firebase Console
- Renómbrala a `serviceAccountKey.json`
- Colócala en la raíz del proyecto

### Error: "Error al cargar historial médico"
- Ejecuta: `npm run add-notes`
- Esto creará la colección `appointmentNotes` faltante

### Error: "Permission denied"
- Verifica que las reglas de Firestore estén actualizadas
- Las nuevas reglas están en `firestore.rules`

## 📝 Notas Importantes

- Los scripts son **idempotentes** - puedes ejecutarlos múltiples veces
- `add-notes` es **seguro** - no borra datos existentes
- `seed-full` **reemplaza** todos los datos
- Siempre respalda tu base de datos antes de ejecutar `seed-full`

---

## 🎯 Funcionalidades Nuevas

Con estos scripts, la aplicación ahora incluye:

- ✅ **Notas médicas** por cita
- ✅ **Historial médico** del paciente
- ✅ **Agendado por médico** (derivación/seguimiento)
- ✅ **Selección de especialistas**
- ✅ **Auditoría completa** (quién agendó qué)

¡La funcionalidad del médico para agendar citas está completamente operativa! 🚀

