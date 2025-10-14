// Script para actualizar las imágenes de doctores existentes en la base de datos
// Ejecutar con: node scripts/updateDoctorImages.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// URLs de imágenes de doctores profesionales de Unsplash
const DOCTOR_IMAGES = [
  // Odontología General
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  
  // Ortodoncia
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  
  // Endodoncia
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  
  // Periodoncia
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  
  // Cirugía Maxilofacial
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
  
  // Odontopediatría
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
];

// Función para obtener imagen de doctor por especialidad
function getDoctorImageBySpecialty(specialty) {
  const specialtyMap = {
    'Odontología General': 0,
    'Ortodoncia': 3,
    'Endodoncia': 5,
    'Periodoncia': 7,
    'Cirugía Maxilofacial': 9,
    'Odontopediatría': 11,
  };
  
  const index = specialtyMap[specialty] || 0;
  return DOCTOR_IMAGES[index];
}

// Función para actualizar imágenes de doctores
async function updateDoctorImages() {
  try {
    console.log('🔄 Iniciando actualización de imágenes de doctores...\n');

    // Obtener todos los doctores
    const doctorsSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .get();

    if (doctorsSnapshot.empty) {
      console.log('❌ No se encontraron doctores en la base de datos');
      return;
    }

    console.log(`📋 Encontrados ${doctorsSnapshot.size} doctores\n`);

    // Actualizar cada doctor
    const batch = db.batch();
    let updateCount = 0;

    doctorsSnapshot.forEach((doc) => {
      const doctorData = doc.data();
      const newImageUrl = getDoctorImageBySpecialty(doctorData.specialty);
      
      console.log(`🔄 Actualizando ${doctorData.displayName} (${doctorData.specialty})`);
      console.log(`   Imagen anterior: ${doctorData.photoURL || 'Sin imagen'}`);
      console.log(`   Imagen nueva: ${newImageUrl}\n`);
      
      batch.update(doc.ref, {
        photoURL: newImageUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      updateCount++;
    });

    // Ejecutar la actualización
    await batch.commit();
    
    console.log(`✅ ¡Actualización completada exitosamente!`);
    console.log(`📊 Resumen:`);
    console.log(`   - Doctores actualizados: ${updateCount}`);
    console.log(`   - Imágenes nuevas aplicadas: ${updateCount}`);

  } catch (error) {
    console.error('❌ Error actualizando imágenes de doctores:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar la actualización
updateDoctorImages();

