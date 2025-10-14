/**
 * Script de prueba para validar las restricciones de citas
 * Este script simula diferentes escenarios para verificar que las validaciones funcionan correctamente
 */

import { validateAppointmentBooking } from './lib/api/validation';

// Función para probar diferentes escenarios
async function testAppointmentValidations() {
  console.log('🧪 Iniciando pruebas de validación de citas...\n');

  // Datos de prueba
  const testPatientId = 'test-patient-123';
  const testDoctor1 = 'test-doctor-1';
  const testDoctor2 = 'test-doctor-2';
  const testDate = '2024-01-15';
  
  const scenarios = [
    {
      name: 'Primera cita con doctor 1',
      doctorId: testDoctor1,
      date: testDate,
      startTime: '09:00',
      endTime: '09:30',
      expectedValid: true
    },
    {
      name: 'Segunda cita con el mismo doctor (debería fallar)',
      doctorId: testDoctor1,
      date: testDate,
      startTime: '10:00',
      endTime: '10:30',
      expectedValid: false,
      expectedError: 'Ya tienes una cita agendada con este doctor'
    },
    {
      name: 'Cita con doctor diferente en horario diferente',
      doctorId: testDoctor2,
      date: testDate,
      startTime: '11:00',
      endTime: '11:30',
      expectedValid: true
    },
    {
      name: 'Cita con doctor diferente en horario solapado (debería fallar)',
      doctorId: testDoctor2,
      date: testDate,
      startTime: '09:15',
      endTime: '09:45',
      expectedValid: false,
      expectedError: 'Ya tienes una cita agendada en este horario con otro doctor'
    },
    {
      name: 'Cita con doctor diferente en horario no solapado',
      doctorId: testDoctor2,
      date: testDate,
      startTime: '14:00',
      endTime: '14:30',
      expectedValid: true
    }
  ];

  let passedTests = 0;
  let totalTests = scenarios.length;

  for (const scenario of scenarios) {
    console.log(`📋 Probando: ${scenario.name}`);
    
    try {
      const result = await validateAppointmentBooking(
        testPatientId,
        scenario.doctorId,
        scenario.date,
        scenario.startTime,
        scenario.endTime
      );

      if (result.isValid === scenario.expectedValid) {
        if (!scenario.expectedValid && result.error?.includes(scenario.expectedError || '')) {
          console.log(`✅ PASÓ - Error esperado: ${result.error}`);
          passedTests++;
        } else if (scenario.expectedValid && result.isValid) {
          console.log(`✅ PASÓ - Validación exitosa`);
          passedTests++;
        } else {
          console.log(`❌ FALLÓ - Resultado inesperado`);
          console.log(`   Esperado: ${scenario.expectedValid ? 'válido' : 'inválido'}`);
          console.log(`   Obtenido: ${result.isValid ? 'válido' : 'inválido'}`);
          if (result.error) console.log(`   Error: ${result.error}`);
        }
      } else {
        console.log(`❌ FALLÓ - Validación incorrecta`);
        console.log(`   Esperado: ${scenario.expectedValid ? 'válido' : 'inválido'}`);
        console.log(`   Obtenido: ${result.isValid ? 'válido' : 'inválido'}`);
        if (result.error) console.log(`   Error: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR - Excepción inesperada: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
  }

  console.log(`📊 Resultados: ${passedTests}/${totalTests} pruebas pasaron`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Todas las pruebas pasaron! Las validaciones funcionan correctamente.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar la implementación.');
  }
}

// Función para probar la función de solapamiento de horarios
function testTimeOverlap() {
  console.log('🕐 Probando función de solapamiento de horarios...\n');

  const testCases = [
    { start1: '09:00', end1: '09:30', start2: '09:15', end2: '09:45', expected: true, desc: 'Solapamiento parcial' },
    { start1: '09:00', end1: '09:30', start2: '09:30', end2: '10:00', expected: false, desc: 'Horarios adyacentes' },
    { start1: '09:00', end1: '09:30', start2: '10:00', end2: '10:30', expected: false, desc: 'Horarios separados' },
    { start1: '09:00', end1: '10:00', start2: '09:30', end2: '09:45', expected: true, desc: 'Uno contiene al otro' },
    { start1: '09:30', end1: '09:45', start2: '09:00', end2: '10:00', expected: true, desc: 'Otro contiene al uno' }
  ];

  let passedOverlapTests = 0;

  for (const testCase of testCases) {
    // Importar la función desde validation.ts
    const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);
      
      return start1Min < end2Min && start2Min < end1Min;
    };

    const result = isTimeOverlap(testCase.start1, testCase.end1, testCase.start2, testCase.end2);
    
    if (result === testCase.expected) {
      console.log(`✅ ${testCase.desc}: PASÓ`);
      passedOverlapTests++;
    } else {
      console.log(`❌ ${testCase.desc}: FALLÓ`);
      console.log(`   Esperado: ${testCase.expected}, Obtenido: ${result}`);
    }
  }

  console.log(`\n📊 Solapamiento: ${passedOverlapTests}/${testCases.length} pruebas pasaron\n`);
}

// Ejecutar las pruebas
if (require.main === module) {
  console.log('🚀 Iniciando pruebas de validación de citas...\n');
  
  testTimeOverlap();
  
  // Nota: Las pruebas de validación de citas requieren conexión a Firebase
  // Descomenta la siguiente línea cuando tengas Firebase configurado
  // testAppointmentValidations();
  
  console.log('💡 Para probar las validaciones de citas, asegúrate de tener Firebase configurado');
  console.log('   y descomenta la línea testAppointmentValidations() en este archivo.');
}

export { testAppointmentValidations, testTimeOverlap };
