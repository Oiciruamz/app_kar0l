import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { registerUser } from '@/lib/api/auth';
import { UserRole } from '@/lib/types';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    role: 'patient' as UserRole,
    specialty: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.displayName) {
      newErrors.displayName = 'El nombre es requerido';
    }

    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Teléfono inválido (10 dígitos)';
    }

    if (formData.role === 'doctor' && !formData.specialty) {
      newErrors.specialty = 'La especialidad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser(formData);
      Alert.alert('Éxito', 'Cuenta creada correctamente', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, formData.role === 'patient' && styles.roleButtonActive]}
              onPress={() => setFormData({ ...formData, role: 'patient' })}
            >
              <Text style={[styles.roleButtonText, formData.role === 'patient' && styles.roleButtonTextActive]}>
                Paciente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, formData.role === 'doctor' && styles.roleButtonActive]}
              onPress={() => setFormData({ ...formData, role: 'doctor' })}
            >
              <Text style={[styles.roleButtonText, formData.role === 'doctor' && styles.roleButtonTextActive]}>
                Doctor
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={formData.displayName}
            onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            error={errors.displayName}
          />

          <TextInput
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <TextInput
            label="Teléfono"
            placeholder="5551234567"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          {formData.role === 'doctor' && (
            <TextInput
              label="Especialidad"
              placeholder="Ortodoncista, Endodoncista, etc."
              value={formData.specialty}
              onChangeText={(text) => setFormData({ ...formData, specialty: text })}
              error={errors.specialty}
            />
          )}

          <TextInput
            label="Contraseña"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <TextInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <Button onPress={handleRegister} loading={loading}>
            Registrarse
          </Button>

          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
               <Text style={styles.linkBold}>Regresar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F4F4F5',
    borderRadius: 999,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#73506E',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkBold: {
    color: '#73506E',
    fontWeight: '600',
  },
});

