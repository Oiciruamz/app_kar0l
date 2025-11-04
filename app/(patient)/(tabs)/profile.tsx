import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { AppBar } from '@/components/AppBar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/api/auth';
import { uploadProfilePhoto } from '@/lib/services/userPhoto';

export default function PatientProfileScreen() {
  const { profile } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <AppBar title="Perfil" />
      
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            { (profile as any).photoURL ? (
              <Image source={{ uri: (profile as any).photoURL }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {profile.displayName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Button onPress={async () => {
            try {
              setUploadingPhoto(true);
              const ImagePicker = await import('expo-image-picker');
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a tus fotos');
                setUploadingPhoto(false);
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
              if (result.canceled || !result.assets?.length) {
                setUploadingPhoto(false);
                return;
              }
              const uri = result.assets[0].uri;
              await uploadProfilePhoto(profile.uid, uri);
              Alert.alert('Éxito', 'Foto de perfil actualizada');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo actualizar la foto');
            } finally {
              setUploadingPhoto(false);
            }
          }} loading={uploadingPhoto} style={{ marginTop: 12 }}>
            Cambiar foto
          </Button>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{profile.displayName}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{profile.phone}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>Paciente</Text>
          </View>
        </View>

        <Button variant="secondary" onPress={handleSignOut}>
          Cerrar Sesión
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDDDE9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#73506E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#0F172A',
  },
});

