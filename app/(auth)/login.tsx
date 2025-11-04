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
import { loginUser } from '@/lib/api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('🔵 Intentando login con:', email);
    
    if (!validate()) {
      console.log('❌ Validación falló');
      return;
    }

    console.log('✅ Validación exitosa, iniciando...');
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      console.log('✅ Login exitoso:', user?.uid);
      // Navigation handled by root layout
    } catch (error: any) {
      console.log('❌ Error en login:', error);
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
          <Text style={styles.title}>Martínez Cantú</Text>
          <Text style={styles.subtitle}>Especialistas Dentales</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Usuario"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <TextInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button 
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password || loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
          
          {(!email || !password) && (
            <Text style={styles.hintText}>
              Por favor completa todos los campos
            </Text>
          )}

          <TouchableOpacity 
            onPress={() => {
              console.log('🟢 Navegando a registro...');
              try {
                router.push('/(auth)/register');
                console.log('✅ Push a registro exitoso');
              } catch (error) {
                console.error('❌ Error al navegar:', error);
              }
            }}
            style={styles.linkContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text>
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
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
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
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(115, 80, 110, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(115, 80, 110, 0.2)',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkBold: {
    color: '#73506E',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  hintText: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});

