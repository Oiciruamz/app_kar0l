// Script para poblar la base de datos con datos de prueba
// Ejecutar con: node scripts/seedDatabase.js

const admin = require('firebase-admin');
const { format, addDays, addMinutes, startOfDay, setHours, setMinutes } = require('date-fns');

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

// Función para obtener imagen de doctor por índice
function getDoctorImage(index) {
  return DOCTOR_IMAGES[index % DOCTOR_IMAGES.length];
}

// Inicializar Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Datos de médicos
const doctors = [
  {
    email: 'dr.garcia@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dr. Carlos García',
    phone: '8111234567',
    specialty: 'Odontología General',
    bio: 'Especialista en odontología general con 15 años de experiencia. Enfoque en tratamientos preventivos y estética dental.',
    photoURL: getDoctorImage(0)
  },
  {
    email: 'dra.martinez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dra. María Martínez',
    phone: '8111234568',
    specialty: 'Ortodoncia',
    bio: 'Ortodoncista certificada especializada en brackets invisibles y ortodoncia digital. Más de 1000 casos exitosos.',
    photoURL: getDoctorImage(3)
  },
  {
    email: 'dr.lopez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dr. Juan López',
    phone: '8111234569',
    specialty: 'Endodoncia',
    bio: 'Endodoncista con maestría internacional. Especialista en tratamientos de conducto y cirugía endodóntica.',
    photoURL: getDoctorImage(5)
  },
  {
    email: 'dra.rodriguez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dra. Ana Rodríguez',
    phone: '8111234570',
    specialty: 'Periodoncia',
    bio: 'Periodoncista experta en salud de las encías y colocación de implantes dentales.',
    photoURL: getDoctorImage(7)
  },
  {
    email: 'dr.hernandez@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dr. Roberto Hernández',
    phone: '8111234571',
    specialty: 'Cirugía Maxilofacial',
    bio: 'Cirujano maxilofacial con especialización en cirugía reconstructiva y estética facial.',
    photoURL: getDoctorImage(9)
  },
  {
    email: 'dra.torres@clinica.com',
    password: 'Doctor123!',
    displayName: 'Dra. Laura Torres',
    phone: '8111234572',
    specialty: 'Odontopediatría',
    bio: 'Odontopediatra dedicada al cuidado dental de niños y adolescentes. Ambiente amigable y sin estrés.',
    photoURL: getDoctorImage(11)
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
  },
  {
    email: 'paciente6@email.com',
    password: 'Paciente123!',
    displayName: 'Patricia Vargas',
    phone: '8112345676'
  },
  {
    email: 'paciente7@email.com',
    password: 'Paciente123!',
    displayName: 'Ricardo Méndez',
    phone: '8112345677'
  },
  {
    email: 'paciente8@email.com',
    password: 'Paciente123!',
    displayName: 'Gabriela Castro',
    phone: '8112345678'
  },
  {
    email: 'paciente9@email.com',
    password: 'Paciente123!',
    displayName: 'José Jiménez',
    phone: '8112345679'
  },
  {
    email: 'paciente10@email.com',
    password: 'Paciente123!',
    displayName: 'Lucía Reyes',
    phone: '8112345680'
  },
  {
    email: 'paciente11@email.com',
    password: 'Paciente123!',
    displayName: 'Antonio Ruiz',
    phone: '8112345681'
  },
  {
    email: 'paciente12@email.com',
    password: 'Paciente123!',
    displayName: 'Elena Ortiz',
    phone: '8112345682'
  },
  {
    email: 'paciente13@email.com',
    password: 'Paciente123!',
    displayName: 'Manuel Sánchez',
    phone: '8112345683'
  },
  {
    email: 'paciente14@email.com',
    password: 'Paciente123!',
    displayName: 'Isabel Moreno',
    phone: '8112345684'
  },
  {
    email: 'paciente15@email.com',
    password: 'Paciente123!',
    displayName: 'Pedro Gutiérrez',
    phone: '8112345685'
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

// Función para crear usuarios en Firebase Auth y Firestore
async function createUser(userData, role) {
  try {
    // Verificar si el usuario ya existe
    let user;
    try {
      user = await auth.getUserByEmail(userData.email);
      console.log(`✓ Usuario ya existe: ${userData.email}`);
      return user.uid;
    } catch (error) {
      // Usuario no existe, crear uno nuevo
      user = await auth.createUser({
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
  const timeSlots = [
    { startTime: '09:00', endTime: '09:30' },
    { startTime: '09:30', endTime: '10:00' },
    { startTime: '10:00', endTime: '10:30' },
    { startTime: '10:30', endTime: '11:00' },
    { startTime: '11:00', endTime: '11:30' },
    { startTime: '11:30', endTime: '12:00' },
    { startTime: '12:00', endTime: '12:30' },
    { startTime: '12:30', endTime: '13:00' },
    { startTime: '14:00', endTime: '14:30' },
    { startTime: '14:30', endTime: '15:00' },
    { startTime: '15:00', endTime: '15:30' },
    { startTime: '15:30', endTime: '16:00' },
    { startTime: '16:00', endTime: '16:30' },
    { startTime: '16:30', endTime: '17:00' },
    { startTime: '17:00', endTime: '17:30' },
    { startTime: '17:30', endTime: '18:00' }
  ];

  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Solo crear slots de lunes a viernes (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      for (const timeSlot of timeSlots) {
        const slotRef = db.collection('slots').doc();
        const slot = {
          doctorId: doctorId,
          date: dateStr,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration: 30,
          status: 'available',
          capacity: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        slots.push({ id: slotRef.id, ref: slotRef, data: slot });
      }
    }
    
    currentDate = addDays(currentDate, 1);
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

// Función principal
async function seedDatabase() {
  try {
    console.log('🚀 Iniciando población de la base de datos...\n');

    // 1. Crear doctores
    console.log('📋 Creando doctores...');
    const doctorIds = [];
    for (const doctor of doctors) {
      const doctorId = await createUser(doctor, 'doctor');
      doctorIds.push({ id: doctorId, ...doctor });
    }
    console.log(`✓ ${doctorIds.length} doctores creados\n`);

    // 2. Crear pacientes
    console.log('📋 Creando pacientes...');
    const patientIds = [];
    for (const patient of patients) {
      const patientId = await createUser(patient, 'patient');
      patientIds.push({ id: patientId, ...patient });
    }
    console.log(`✓ ${patientIds.length} pacientes creados\n`);

    // 3. Crear slots para cada doctor (próximos 30 días)
    console.log('📅 Creando horarios para doctores...');
    const today = new Date();
    const endDate = addDays(today, 30);
    
    const allSlots = {};
    for (const doctor of doctorIds) {
      console.log(`  Generando slots para ${doctor.displayName}...`);
      const slots = await createSlotsForDoctor(doctor.id, today, endDate);
      allSlots[doctor.id] = slots;
      
      // Guardar slots en lotes de 500 (límite de Firestore)
      const batchSize = 500;
      for (let i = 0; i < slots.length; i += batchSize) {
        const batch = db.batch();
        const batchSlots = slots.slice(i, i + batchSize);
        
        for (const slot of batchSlots) {
          batch.set(slot.ref, slot.data);
        }
        
        await batch.commit();
        console.log(`  ✓ Guardados ${Math.min(i + batchSize, slots.length)}/${slots.length} slots`);
      }
    }
    console.log(`✓ Horarios creados para todos los doctores\n`);

    // 4. Crear citas (mezclar pacientes con doctores)
    console.log('📝 Creando citas...');
    let appointmentCount = 0;
    
    // Crear entre 20-30 citas
    const numberOfAppointments = 25;
    
    for (let i = 0; i < numberOfAppointments; i++) {
      // Seleccionar doctor y paciente aleatorios
      const randomDoctor = doctorIds[Math.floor(Math.random() * doctorIds.length)];
      const randomPatient = patientIds[Math.floor(Math.random() * patientIds.length)];
      
      // Seleccionar un slot disponible aleatorio para este doctor
      const doctorSlots = allSlots[randomDoctor.id].filter(s => s.data.status === 'available');
      
      if (doctorSlots.length > 0) {
        const randomSlot = doctorSlots[Math.floor(Math.random() * doctorSlots.length)];
        const randomReason = appointmentReasons[Math.floor(Math.random() * appointmentReasons.length)];
        
        await createAppointment(
          randomDoctor.id,
          randomDoctor.displayName,
          randomPatient.id,
          randomPatient.displayName,
          randomPatient.phone,
          randomSlot,
          randomReason
        );
        
        // Marcar el slot como usado
        randomSlot.data.status = 'booked';
        appointmentCount++;
        console.log(`  ✓ Cita ${appointmentCount}: ${randomPatient.displayName} con ${randomDoctor.displayName}`);
      }
    }
    
    console.log(`✓ ${appointmentCount} citas creadas\n`);

    // Resumen
    console.log('✅ ¡Base de datos poblada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Doctores: ${doctorIds.length}`);
    console.log(`   - Pacientes: ${patientIds.length}`);
    console.log(`   - Citas: ${appointmentCount}`);
    console.log(`   - Slots totales: ~${Object.values(allSlots).reduce((sum, slots) => sum + slots.length, 0)}`);
    console.log('\n📧 Credenciales de prueba:');
    console.log('\n   DOCTORES:');
    doctors.forEach(d => {
      console.log(`   - ${d.email} / ${d.password} (${d.specialty})`);
    });
    console.log('\n   PACIENTES:');
    patients.slice(0, 5).forEach(p => {
      console.log(`   - ${p.email} / ${p.password}`);
    });
    console.log('   ... y más pacientes');

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar
seedDatabase();

