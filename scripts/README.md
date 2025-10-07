# Scripts de Base de Datos

Este directorio contiene scripts para poblar y administrar la base de datos Firestore.

## Configuración Inicial

### 1. Descargar Service Account Key desde Firebase

Necesitas descargar tu clave de cuenta de servicio desde Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **clinica-dental-62439**
3. Haz clic en el ícono de engranaje ⚙️ al lado de "Descripción general del proyecto" → **Configuración del proyecto**
4. Ve a la pestaña **"Cuentas de servicio"**
5. Haz clic en **"Generar nueva clave privada"**
6. Se descargará un archivo JSON
7. **Renombra el archivo a `serviceAccountKey.json`**
8. **Mueve el archivo a la carpeta raíz del proyecto** (C:\Users\mauri\OneDrive\Escritorio\App_Karol\)

⚠️ **IMPORTANTE:** Este archivo contiene credenciales sensibles. **NUNCA** lo subas a Git o lo compartas públicamente.

### 2. Instalar Dependencias

```bash
cd scripts
npm install
```

## Uso

### Poblar la Base de Datos

Para llenar la base de datos con datos de prueba:

```bash
cd scripts
npm run seed
```

Este script creará:
- ✅ **6 doctores** con diferentes especialidades
- ✅ **15 pacientes**
- ✅ **~2,000 slots de tiempo** (horarios disponibles para los próximos 30 días)
- ✅ **~25 citas** confirmadas

## Credenciales de Prueba

Después de ejecutar el script, podrás iniciar sesión con estas credenciales:

### Doctores:
- **dr.garcia@clinica.com** / Doctor123! (Odontología General)
- **dra.martinez@clinica.com** / Doctor123! (Ortodoncia)
- **dr.lopez@clinica.com** / Doctor123! (Endodoncia)
- **dra.rodriguez@clinica.com** / Doctor123! (Periodoncia)
- **dr.hernandez@clinica.com** / Doctor123! (Cirugía Maxilofacial)
- **dra.torres@clinica.com** / Doctor123! (Odontopediatría)

### Pacientes:
- **paciente1@email.com** / Paciente123!
- **paciente2@email.com** / Paciente123!
- **paciente3@email.com** / Paciente123!
- ... hasta paciente15@email.com

Todos los pacientes usan la misma contraseña: **Paciente123!**

## Notas

- El script es **idempotente**: puedes ejecutarlo múltiples veces y no creará usuarios duplicados
- Los horarios se crean solo de lunes a viernes, de 9:00 AM a 6:00 PM
- Cada slot de tiempo tiene una duración de 30 minutos

