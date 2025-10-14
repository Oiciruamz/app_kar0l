import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  FlatList 
} from 'react-native';
import { AppBar } from '@/components/AppBar';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDoctorNotes, createDoctorNote, updateDoctorNote, deleteDoctorNote } from '@/lib/api/notes';
import { DoctorNote } from '@/lib/types';
import { format } from 'date-fns';

export default function NotesScreen() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      const data = await getDoctorNotes(user.uid);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'No se pudieron cargar las notas');
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const handleCreateNote = async () => {
    if (!user || !newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await createDoctorNote(user.uid, {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      });
      
      Alert.alert('Éxito', 'Nota creada correctamente');
      setNewNoteTitle('');
      setNewNoteContent('');
      loadNotes(); // Recargar las notas
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoctorNote(noteId);
              Alert.alert('Éxito', 'Nota eliminada correctamente');
              loadNotes(); // Recargar las notas
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderNote = ({ item }: { item: DoctorNote }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteNote(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.noteContent}>{item.content}</Text>
      <Text style={styles.noteDate}>
        {format(item.updatedAt.toDate(), 'dd/MM/yyyy HH:mm')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBar title="Mis Notas" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Nueva Nota</Text>
        <View style={styles.form}>
          <TextInput
            label="Título"
            placeholder="Ej: Recordatorio importante"
            value={newNoteTitle}
            onChangeText={setNewNoteTitle}
          />

          <TextInput
            label="Contenido"
            placeholder="Escribe tu nota aquí..."
            value={newNoteContent}
            onChangeText={setNewNoteContent}
            multiline
            numberOfLines={4}
          />

          <Button onPress={handleCreateNote} loading={loading}>
            Crear Nota
          </Button>
        </View>

        <Text style={styles.sectionTitle}>Mis Notas</Text>
        {loadingNotes ? (
          <Text style={styles.loadingText}>Cargando notas...</Text>
        ) : notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📝</Text>
            <Text style={styles.emptyMessage}>No tienes notas aún</Text>
            <Text style={styles.emptySubtext}>Crea tu primera nota usando el formulario de arriba</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  noteContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

