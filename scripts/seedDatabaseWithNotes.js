// Script para poblar la base de datos con datos de prueba incluyendo appointmentNotes
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

// Datos de doctores
const doctors = [
  {
    email: 'dr.garcia@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dr. Carlos García',
    phone: '8112345601',
    specialty: 'Odontología General',
    bio: 'Especialista en odontología general con más de 10 años de experiencia.',
    photoURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'dra.martinez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dra. Ana Martínez',
    phone: '8112345602',
    specialty: 'Ortodoncia',
    bio: 'Especialista en ortodoncia y corrección de mordidas.',
    photoURL: 'https://images.unsplash.com/photo-1594824388852-7b1b0b5f8b8c?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'dr.lopez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dr. Miguel López',
    phone: '8112345603',
    specialty: 'Endodoncia',
    bio: 'Especialista en tratamientos de conducto y endodoncia.',
    photoURL: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'dra.rodriguez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dra. María Rodríguez',
    phone: '8112345604',
    specialty: 'Periodoncia',
    bio: 'Especialista en enfermedades de las encías y periodoncia.',
    photoURL: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'dr.hernandez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dr. Roberto Hernández',
    phone: '8112345605',
    specialty: 'Cirugía Maxilofacial',
    bio: 'Especialista en cirugía oral y maxilofacial.',
    photoURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'dra.torres@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dra. Laura Torres',
    phone: '8112345606',
    specialty: 'Odontopediatría',
    bio: 'Especialista en odontología infantil.',
    photoURL: 'https://images.unsplash.com/photo-1594824388852-7b1b0b5f8b8c?w=150&h=150&fit=crop&crop=face'
  }
];

// Datos de pacientes
const patients = [
  {
    email: 'paciente1@email.com',
    password: 'Paciente123!',
    displayName: 'Miguel Pérez',
    phone: '8112345671'
  },
  {
    email: 'paciente2@email.com',
    password: 'Paciente123!',
    displayName: 'Sofia González',
    phone: '8112345672'
  },
  {
    email: 'paciente3@email.com',
    password: 'Paciente123!',
    displayName: 'Daniel Ramírez',
    phone: '8112345673'
  },
  {
    email: 'paciente4@email.com',
    password: 'Paciente123!',
    displayName: 'Carmen Flores',
    phone: '8112345674'
  },
  {
    email: 'paciente5@email.com',
    password: 'Paciente123!',
    displayName: 'Fernando Morales',
    phone: '8112345675'
  }
];

// Razones comunes para citas
const appointmentReasons = [
  'Limpieza dental',
  'Revisión general',
  'Dolor de muela',
  'Ajuste de brackets',
  'Blanqueamiento dental',
  'Extracción de muela del juicio',
  'Tratamiento de conducto',
  'Colocación de implante',
  'Revisión de ortodoncia',
  'Consulta inicial',
  'Emergencia dental',
  'Sensibilidad dental',
  'Caries dental',
  'Problemas de encías'
];

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

// Función para crear usuarios en Firebase Auth y Firestore
async function createUser(userData, role) {
  try {
    // Verificar si el usuario ya existe
    let user;
    try {
      user = await admin.auth().getUserByEmail(userData.email);
      console.log(`✓ Usuario ya existe: ${userData.email}`);
      return user.uid;
    } catch (error) {
      // Usuario no existe, crear uno nuevo
      user = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });
      console.log(`✓ Usuario creado: ${userData.email}`);
    }

    // Crear perfil en Firestore
    const userProfile = {
      uid: user.uid,
      email: userData.email,
      role: role,
      displayName: userData.displayName,
      phone: userData.phone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Agregar campos adicionales para doctores
    if (role === 'doctor') {
      userProfile.specialty = userData.specialty;
      userProfile.bio = userData.bio;
      userProfile.photoURL = userData.photoURL;
    }

    await db.collection('users').doc(user.uid).set(userProfile);
    console.log(`✓ Perfil creado en Firestore para: ${userData.displayName}`);

    return user.uid;
  } catch (error) {
    console.error(`✗ Error creando usuario ${userData.email}:`, error.message);
    throw error;
  }
}

// Función para generar slots de tiempo para un doctor
async function createSlotsForDoctor(doctorId, startDate, endDate) {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Solo crear slots para lunes a viernes
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Crear slots de 9:00 AM a 6:00 PM, cada 30 minutos
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotRef = db.collection('slots').doc();
          const slotData = {
            id: slotRef.id,
            doctorId: doctorId,
            date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
            startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            endTime: `${hour.toString().padStart(2, '0')}:${(minute + 30).toString().padStart(2, '0')}`,
            duration: 30,
            status: 'available',
            capacity: 1,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          await slotRef.set(slotData);
          slots.push(slotRef.id);
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

// Función para crear una cita
async function createAppointment(doctorId, doctorName, patientId, patientName, patientPhone, slot, reason) {
  const appointmentRef = db.collection('appointments').doc();
  
  const appointment = {
    doctorId: doctorId,
    doctorName: doctorName,
    patientId: patientId,
    patientName: patientName,
    patientPhone: patientPhone,
    slotId: slot.id,
    date: slot.data.date,
    startTime: slot.data.startTime,
    endTime: slot.data.endTime,
    reason: reason,
    status: 'Agendada',
    bookedBy: patientId, // Paciente agendó la cita
    bookedByRole: 'patient',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Crear la cita
  await appointmentRef.set(appointment);

  // Actualizar el slot para marcarlo como ocupado
  await slot.ref.update({
    status: 'booked',
    appointmentId: appointmentRef.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return appointmentRef.id;
}

// Función para crear notas médicas para citas
async function createAppointmentNote(appointmentId, doctorId, patientId, diagnosis, treatment, observations) {
  const noteRef = db.collection('appointmentNotes').doc();
  
  const note = {
    id: noteRef.id,
    appointmentId: appointmentId,
    doctorId: doctorId,
    patientId: patientId,
    diagnosis: diagnosis,
    treatment: treatment,
    observations: observations,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await noteRef.set(note);
  return noteRef.id;
}

// Función principal
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando poblamiento de la base de datos...\n');

    // 1. Crear doctores
    console.log('👨‍⚕️ Creando doctores...');
    const doctorIds = [];
    for (const doctorData of doctors) {
      const doctorId = await createUser(doctorData, 'doctor');
      doctorIds.push(doctorId);
    }

    // 2. Crear pacientes
    console.log('\n👤 Creando pacientes...');
    const patientIds = [];
    for (const patientData of patients) {
      const patientId = await createUser(patientData, 'patient');
      patientIds.push(patientId);
    }

    // 3. Crear slots para los próximos 30 días
    console.log('\n📅 Creando horarios disponibles...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const allSlots = [];
    for (const doctorId of doctorIds) {
      const slots = await createSlotsForDoctor(doctorId, startDate, endDate);
      allSlots.push(...slots);
    }
    console.log(`✓ Creados ${allSlots.length} horarios disponibles`);

    // 4. Crear algunas citas de ejemplo
    console.log('\n📋 Creando citas de ejemplo...');
    const appointments = [];
    
    // Obtener algunos slots disponibles para crear citas
    const availableSlots = await db.collection('slots')
      .where('status', '==', 'available')
      .limit(15)
      .get();

    let slotIndex = 0;
    for (let i = 0; i < Math.min(10, availableSlots.docs.length); i++) {
      const slot = availableSlots.docs[i];
      const slotData = slot.data();
      
      // Obtener información del doctor
      const doctorDoc = await db.collection('users').doc(slotData.doctorId).get();
      const doctorData = doctorDoc.data();
      
      // Seleccionar paciente aleatorio
      const patientId = patientIds[i % patientIds.length];
      const patientDoc = await db.collection('users').doc(patientId).get();
      const patientData = patientDoc.data();
      
      // Crear cita
      const appointmentId = await createAppointment(
        slotData.doctorId,
        doctorData.displayName,
        patientId,
        patientData.displayName,
        patientData.phone,
        slot,
        appointmentReasons[i % appointmentReasons.length]
      );
      
      appointments.push(appointmentId);
      
      // Crear nota médica para algunas citas
      if (i < 5) {
        await createAppointmentNote(
          appointmentId,
          slotData.doctorId,
          patientId,
          diagnoses[i % diagnoses.length],
          treatments[i % treatments.length],
          observations[i % observations.length]
        );
        console.log(`✓ Creada nota médica para cita ${appointmentId}`);
      }
    }

    console.log(`✓ Creadas ${appointments.length} citas de ejemplo`);

    // 5. Crear algunas notas médicas adicionales para historial
    console.log('\n📝 Creando historial médico adicional...');
    for (let i = 0; i < 3; i++) {
      const patientId = patientIds[i];
      const doctorId = doctorIds[i % doctorIds.length];
      
      // Crear nota de historial (sin appointmentId específico)
      const noteRef = db.collection('appointmentNotes').doc();
      const note = {
        id: noteRef.id,
        appointmentId: null, // Nota de historial general
        doctorId: doctorId,
        patientId: patientId,
        diagnosis: diagnoses[i % diagnoses.length],
        treatment: treatments[i % treatments.length],
        observations: observations[i % observations.length],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await noteRef.set(note);
      console.log(`✓ Creada nota de historial para paciente ${patientId}`);
    }

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   👨‍⚕️ ${doctorIds.length} doctores`);
    console.log(`   👤 ${patientIds.length} pacientes`);
    console.log(`   📅 ${allSlots.length} horarios disponibles`);
    console.log(`   📋 ${appointments.length} citas creadas`);
    console.log(`   📝 ${appointments.length + 3} notas médicas`);

    console.log('\n🔑 Credenciales de prueba:');
    console.log('\n👨‍⚕️ Doctores:');
    doctors.forEach(doctor => {
      console.log(`   ${doctor.email} / ${doctor.password} (${doctor.specialty})`);
    });
    
    console.log('\n👤 Pacientes:');
    patients.forEach(patient => {
      console.log(`   ${patient.email} / ${patient.password}`);
    });

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
seedDatabase();

