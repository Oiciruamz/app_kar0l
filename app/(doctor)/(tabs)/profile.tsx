import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { AppBar } from '@/components/AppBar';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from '@/lib/api/auth';
import { getDoctorSchedule, updateDoctorSchedule, updateDoctorProfile, DoctorDailySchedule } from '@/lib/api/doctors';
import { uploadProfilePhoto } from '@/lib/services/userPhoto';
import { generateSlotsFromSchedule } from '@/lib/api/slots';

export default function DoctorProfileScreen() {
  const { profile } = useAuth();

  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [bio, setBio] = useState('');
  const weekDays = useMemo(() => ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'], []);
  const defaultDay = useMemo<DoctorDailySchedule>(() => ({ day: '', enabled: false, startTime: '09:00', endTime: '18:00' }), []);
  const [days, setDays] = useState<DoctorDailySchedule[]>(weekDays.map(d => ({ ...defaultDay, day: d })));

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

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      setLoadingSchedule(true);
      try {
        const schedule = await getDoctorSchedule(profile.uid);
        if (schedule?.days?.length) {
          // Merge to ensure all days exist
          const incoming = schedule.days;
          const merged = weekDays.map(dayName => {
            const found = incoming.find(d => d.day === dayName);
            return found ? found : { ...defaultDay, day: dayName };
          });
          setDays(merged);
        } else {
          setDays(weekDays.map(d => ({ ...defaultDay, day: d })));
        }
        setBio(((profile as any).bio as string) || '');
      } catch (e: any) {
        Alert.alert('Error', e.message || 'No se pudo cargar el horario');
      } finally {
        setLoadingSchedule(false);
      }
    };
    load();
  }, [profile, weekDays, defaultDay]);

  const toggleDay = (index: number) => {
    setDays(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      return copy;
    });
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    // Simple HH:mm guard (optional: strengthen later)
    const sanitized = value.replace(/[^0-9:]/g, '').slice(0,5);
    setDays(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: sanitized } as DoctorDailySchedule;
      return copy;
    });
  };

  const handleSaveSchedule = async () => {
    if (!profile) return;
    setSavingSchedule(true);
    try {
      // Basic validation: if enabled, times must be present and plausible
      for (const d of days) {
        if (d.enabled) {
          if (!/^\d{2}:\d{2}$/.test(d.startTime) || !/^\d{2}:\d{2}$/.test(d.endTime)) {
            Alert.alert('Formato inválido', `Revisa horas de ${d.day} (HH:MM)`);
            setSavingSchedule(false);
            return;
          }
        }
      }

      await updateDoctorSchedule(profile.uid, { days });
      Alert.alert('Éxito', 'Horario actualizado');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el horario');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <AppBar title="Perfil" />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
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

          {(profile as any).specialty && (
            <View style={styles.field}>
              <Text style={styles.label}>Especialidad</Text>
              <Text style={styles.value}>{(profile as any).specialty}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>Doctor</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <TextInput
            label="Bio"
            placeholder="Cuéntales a tus pacientes sobre tu experiencia y servicios"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
          <Button onPress={async () => {
            try {
              if (!profile) return;
              await updateDoctorProfile(profile.uid, { bio: bio.trim() });
              Alert.alert('Éxito', 'Perfil actualizado');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo actualizar el perfil');
            }
          }} style={{ marginTop: 8 }}>
            Guardar perfil
          </Button>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mi Horario</Text>
          {loadingSchedule ? (
            <Text style={styles.muted}>Cargando horario...</Text>
          ) : (
            <View>
              {days.map((d, idx) => (
                <View key={d.day} style={styles.dayRow}>
                  <TouchableOpacity onPress={() => toggleDay(idx)} style={[styles.toggle, d.enabled ? styles.toggleOn : styles.toggleOff]}>
                    <Text style={d.enabled ? styles.toggleOnText : styles.toggleOffText}>
                      {d.enabled ? 'Activo' : 'Inactivo'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.dayLabel}>{d.day}</Text>
                  <View style={styles.timeGroup}>
                    <TextInput
                      label="Inicio"
                      placeholder="09:00"
                      value={d.startTime}
                      onChangeText={(v) => updateTime(idx, 'startTime', v)}
                    />
                  </View>
                  <View style={styles.timeGroup}>
                    <TextInput
                      label="Fin"
                      placeholder="18:00"
                      value={d.endTime}
                      onChangeText={(v) => updateTime(idx, 'endTime', v)}
                    />
                  </View>
                </View>
              ))}
              <Button onPress={handleSaveSchedule} loading={savingSchedule}>
                Guardar horario
              </Button>
            </View>
          )}
        </View>

        <Button variant="secondary" onPress={handleSignOut}>
          Cerrar Sesión
        </Button>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  muted: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  dayRow: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  timeGroup: {
    marginBottom: 8,
  },
  toggle: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  toggleOn: {
    backgroundColor: '#DCFCE7',
  },
  toggleOff: {
    backgroundColor: '#F3F4F6',
  },
  toggleOnText: {
    color: '#166534',
    fontWeight: '600',
  },
  toggleOffText: {
    color: '#374151',
    fontWeight: '600',
  },
});

