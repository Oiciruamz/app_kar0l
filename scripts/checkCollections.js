// Script para verificar que las colecciones existen en la base de datos
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Cargar la clave de servicio
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró serviceAccountKey.json');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function checkCollections() {
  try {
    console.log('🔍 Verificando colecciones en la base de datos...\n');

    // Verificar colección users
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log(`✅ Colección 'users': ${usersSnapshot.empty ? 'Vacía' : 'Con datos'}`);

    // Verificar colección appointments
    const appointmentsSnapshot = await db.collection('appointments').limit(1).get();
    console.log(`✅ Colección 'appointments': ${appointmentsSnapshot.empty ? 'Vacía' : 'Con datos'}`);

    // Verificar colección slots
    const slotsSnapshot = await db.collection('slots').limit(1).get();
    console.log(`✅ Colección 'slots': ${slotsSnapshot.empty ? 'Vacía' : 'Con datos'}`);

    // Verificar colección appointmentNotes
    const notesSnapshot = await db.collection('appointmentNotes').limit(1).get();
    console.log(`✅ Colección 'appointmentNotes': ${notesSnapshot.empty ? 'Vacía' : 'Con datos'}`);

    // Contar documentos en cada colección
    console.log('\n📊 Conteo de documentos:');
    
    const usersCount = await db.collection('users').get();
    console.log(`   👥 Usuarios: ${usersCount.size}`);

    const appointmentsCount = await db.collection('appointments').get();
    console.log(`   📋 Citas: ${appointmentsCount.size}`);

    const slotsCount = await db.collection('slots').get();
    console.log(`   📅 Slots: ${slotsCount.size}`);

    const notesCount = await db.collection('appointmentNotes').get();
    console.log(`   📝 Notas médicas: ${notesCount.size}`);

    // Verificar algunos documentos específicos
    console.log('\n🔍 Verificando documentos específicos:');
    
    // Verificar doctores
    const doctorsSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .limit(3)
      .get();
    console.log(`   👨‍⚕️ Doctores encontrados: ${doctorsSnapshot.size}`);
    
    if (!doctorsSnapshot.empty) {
      doctorsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.displayName} (${data.specialty})`);
      });
    }

    // Verificar pacientes
    const patientsSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .limit(3)
      .get();
    console.log(`   👤 Pacientes encontrados: ${patientsSnapshot.size}`);
    
    if (!patientsSnapshot.empty) {
      patientsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`      - ${data.displayName}`);
      });
    }

    // Verificar algunas notas médicas
    const sampleNotesSnapshot = await db.collection('appointmentNotes')
      .limit(3)
      .get();
    console.log(`   📝 Notas médicas de muestra: ${sampleNotesSnapshot.size}`);
    
    if (!sampleNotesSnapshot.empty) {
      sampleNotesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`      - Diagnóstico: ${data.diagnosis || 'N/A'}`);
        console.log(`      - Paciente: ${data.patientId}`);
        console.log(`      - Doctor: ${data.doctorId}`);
      });
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error verificando colecciones:', error);
  } finally {
    process.exit(0);
  }
}

checkCollections();

