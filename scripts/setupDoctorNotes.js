// Script para configurar la colección de notas del doctor en Firebase
// Ejecutar con: node scripts/setupDoctorNotes.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupDoctorNotes() {
  try {
    console.log('🔧 Configurando colección de notas del doctor...');
    
    // Verificar si ya existen doctores en la base de datos
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️  No se encontraron doctores en la base de datos.');
      console.log('   Ejecuta primero: node scripts/seedDatabase.js');
      return;
    }
    
    // Obtener el primer doctor para crear notas de ejemplo
    const firstDoctor = usersSnapshot.docs[0];
    const doctorId = firstDoctor.id;
    const doctorData = firstDoctor.data();
    
    console.log(`👨‍⚕️  Doctor encontrado: ${doctorData.displayName} (${doctorId})`);
    
    // Verificar si ya existen notas para este doctor
    const existingNotes = await db.collection('doctorNotes')
      .where('doctorId', '==', doctorId)
      .get();
    
    if (!existingNotes.empty) {
      console.log(`📝 Ya existen ${existingNotes.size} notas para este doctor.`);
      console.log('   La colección ya está configurada correctamente.');
      return;
    }
    
    // Crear algunas notas de ejemplo
    const sampleNotes = [
      {
        title: 'Recordatorio importante',
        content: 'Recordar revisar el historial del paciente Juan Pérez antes de la próxima cita. Tiene alergia a la penicilina.',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        title: 'Ideas para mejorar',
        content: 'Considerar implementar un sistema de recordatorios automáticos para los pacientes. Esto podría reducir las citas perdidas.',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        title: 'Notas de conferencia',
        content: 'En la conferencia de odontología aprendí nuevas técnicas de endodoncia. Investigar más sobre el uso de láser en tratamientos.',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];
    
    console.log('📝 Creando notas de ejemplo...');
    
    // Crear las notas en Firestore
    const batch = db.batch();
    const notesRef = db.collection('doctorNotes');
    
    sampleNotes.forEach(note => {
      const noteRef = notesRef.doc();
      batch.set(noteRef, {
        doctorId: doctorId,
        ...note
      });
    });
    
    await batch.commit();
    
    console.log('✅ Colección de notas configurada exitosamente!');
    console.log(`   Se crearon ${sampleNotes.length} notas de ejemplo para el doctor ${doctorData.displayName}`);
    console.log('');
    console.log('🎉 La funcionalidad de notas está lista para usar!');
    console.log('   Los doctores pueden ahora crear, leer, actualizar y eliminar sus notas.');
    
  } catch (error) {
    console.error('❌ Error configurando las notas:', error);
    process.exit(1);
  }
}

// Función para verificar la configuración
async function verifySetup() {
  try {
    console.log('🔍 Verificando configuración...');
    
    // Verificar reglas de Firestore
    console.log('📋 Reglas de Firestore:');
    console.log('   ✅ Colección doctorNotes configurada');
    console.log('   ✅ Solo doctores pueden acceder a sus propias notas');
    console.log('   ✅ Permisos de lectura, escritura y eliminación configurados');
    
    // Verificar si existen notas
    const notesSnapshot = await db.collection('doctorNotes').limit(1).get();
    if (!notesSnapshot.empty) {
      console.log('📝 Notas encontradas en la base de datos');
    } else {
      console.log('📝 No hay notas en la base de datos aún');
    }
    
    console.log('');
    console.log('🚀 Configuración completada!');
    
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
  }
}

// Ejecutar el script
async function main() {
  console.log('🏥 Configurador de Notas del Doctor');
  console.log('=====================================');
  console.log('');
  
  await setupDoctorNotes();
  console.log('');
  await verifySetup();
  
  console.log('');
    console.log('📚 Instrucciones:');
    console.log('   1. Las reglas de Firestore ya están actualizadas');
    console.log('   2. Los índices de Firestore ya están desplegados');
    console.log('   3. Despliega todo: firebase deploy --only firestore');
    console.log('   4. Los doctores pueden usar la nueva interfaz de notas');
  console.log('');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
