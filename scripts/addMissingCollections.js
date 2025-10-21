// Script para agregar las colecciones faltantes (appointmentNotes) a la base de datos existente
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Cargar la clave de servicio
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  console.error('Por favor descarga la clave de servicio desde Firebase Console y colócala en la raíz del proyecto');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// Diagnósticos comunes
const diagnoses = [
  'Caries en muela 16',
  'Gingivitis leve',
  'Necesita limpieza profunda',
  'Problema de mordida',
  'Sensibilidad dental',
  'Caries múltiples',
  'Problema de encías',
  'Necesita ortodoncia',
  'Muela del juicio impactada',
  'Necesita endodoncia'
];

// Tratamientos comunes
const treatments = [
  'Limpieza dental',
  'Empaste simple',
  'Endodoncia',
  'Extracción',
  'Ortodoncia',
  'Implante dental',
  'Corona',
  'Blanqueamiento',
  'Cirugía menor',
  'Tratamiento de encías'
];

// Observaciones comunes
const observations = [
  'Paciente colaborador',
  'Necesita derivación a especialista',
  'Seguimiento en 3 meses',
  'Mantener higiene dental',
  'Evitar alimentos duros',
  'Usar enjuague bucal',
  'Cepillado 3 veces al día',
  'Controlar azúcares',
  'Revisión en 6 meses',
  'Derivar a ortodoncista'
];

// Función para crear notas médicas para citas existentes
async function createAppointmentNotes() {
  try {
    console.log('📝 Creando notas médicas para citas existentes...');

    // Obtener todas las citas existentes
    const appointmentsSnapshot = await db.collection('appointments').get();
    
    if (appointmentsSnapshot.empty) {
      console.log('⚠️ No hay citas existentes para crear notas');
      return;
    }

    let notesCreated = 0;
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointment = appointmentDoc.data();
      
      // Solo crear notas para citas agendadas o completadas
      if (appointment.status === 'Agendada' || appointment.status === 'Completada') {
        // Verificar si ya existe una nota para esta cita
        // Usar el ID del documento si no hay campo id
        const appointmentId = appointment.id || appointmentDoc.id;
        
        const existingNotes = await db.collection('appointmentNotes')
          .where('appointmentId', '==', appointmentId)
          .get();
        
        if (existingNotes.empty) {
          // Crear nota médica
          const noteRef = db.collection('appointmentNotes').doc();
          const note = {
            id: noteRef.id,
            appointmentId: appointmentId,
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            diagnosis: diagnoses[notesCreated % diagnoses.length],
            treatment: treatments[notesCreated % treatments.length],
            observations: observations[notesCreated % observations.length],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          await noteRef.set(note);
          notesCreated++;
          console.log(`✓ Creada nota médica para cita ${appointmentId}`);
        }
      }
    }

    console.log(`✓ Creadas ${notesCreated} notas médicas`);

  } catch (error) {
    console.error('❌ Error creando notas médicas:', error);
    throw error;
  }
}

// Función para crear algunas notas de historial médico
async function createMedicalHistory() {
  try {
    console.log('📋 Creando historial médico adicional...');

    // Obtener algunos pacientes
    const patientsSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .limit(5)
      .get();

    if (patientsSnapshot.empty) {
      console.log('⚠️ No hay pacientes para crear historial');
      return;
    }

    // Obtener algunos doctores
    const doctorsSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .limit(3)
      .get();

    if (doctorsSnapshot.empty) {
      console.log('⚠️ No hay doctores para crear historial');
      return;
    }

    let historyNotesCreated = 0;

    for (let i = 0; i < Math.min(patientsSnapshot.docs.length, 3); i++) {
      const patientDoc = patientsSnapshot.docs[i];
      const patient = patientDoc.data();
      
      const doctorDoc = doctorsSnapshot.docs[i % doctorsSnapshot.docs.length];
      const doctor = doctorDoc.data();

      // Crear nota de historial (sin appointmentId específico)
      const noteRef = db.collection('appointmentNotes').doc();
      const note = {
        id: noteRef.id,
        appointmentId: null, // Nota de historial general
        doctorId: doctor.uid,
        patientId: patient.uid,
        diagnosis: diagnoses[historyNotesCreated % diagnoses.length],
        treatment: treatments[historyNotesCreated % treatments.length],
        observations: observations[historyNotesCreated % observations.length],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await noteRef.set(note);
      historyNotesCreated++;
      console.log(`✓ Creada nota de historial para paciente ${patient.displayName}`);
    }

    console.log(`✓ Creadas ${historyNotesCreated} notas de historial médico`);

  } catch (error) {
    console.error('❌ Error creando historial médico:', error);
    throw error;
  }
}

// Función para actualizar citas existentes con campos faltantes
async function updateExistingAppointments() {
  try {
    console.log('🔄 Actualizando citas existentes...');

    const appointmentsSnapshot = await db.collection('appointments').get();
    
    if (appointmentsSnapshot.empty) {
      console.log('⚠️ No hay citas para actualizar');
      return;
    }

    let updatedCount = 0;

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointment = appointmentDoc.data();
      
      // Verificar si necesita campos faltantes
      const needsUpdate = !appointment.bookedBy || !appointment.bookedByRole;
      
      if (needsUpdate) {
        await appointmentDoc.ref.update({
          bookedBy: appointment.patientId, // Asumir que el paciente agendó
          bookedByRole: 'patient',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCount++;
        console.log(`✓ Actualizada cita ${appointment.id}`);
      }
    }

    console.log(`✓ Actualizadas ${updatedCount} citas`);

  } catch (error) {
    console.error('❌ Error actualizando citas:', error);
    throw error;
  }
}

// Función principal
async function addMissingCollections() {
  try {
    console.log('🔧 Agregando colecciones faltantes a la base de datos existente...\n');

    // 1. Actualizar citas existentes
    await updateExistingAppointments();

    // 2. Crear notas médicas para citas existentes
    await createAppointmentNotes();

    // 3. Crear historial médico adicional
    await createMedicalHistory();

    console.log('\n🎉 ¡Colecciones agregadas exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   📝 Notas médicas creadas');
    console.log('   📋 Historial médico agregado');
    console.log('   🔄 Citas actualizadas');

    console.log('\n✅ La aplicación ahora debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error agregando colecciones:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
addMissingCollections();
