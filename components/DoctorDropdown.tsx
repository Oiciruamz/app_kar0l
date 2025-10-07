import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  FlatList 
} from 'react-native';
import { Doctor } from '@/lib/types';
import { scale, scaleFont } from '@/lib/utils/responsive';

interface DoctorDropdownProps {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doctor: Doctor) => void;
  placeholder?: string;
}

export function DoctorDropdown({ 
  doctors, 
  selectedDoctor, 
  onSelectDoctor, 
  placeholder = "Seleccionar dentista" 
}: DoctorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectDoctor = (doctor: Doctor) => {
    onSelectDoctor(doctor);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dropdownText, 
          !selectedDoctor && styles.placeholderText
        ]}>
          {selectedDoctor ? selectedDoctor.displayName : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Dentista</Text>
              <TouchableOpacity 
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.doctorItem,
                    selectedDoctor?.uid === item.uid && styles.selectedDoctorItem
                  ]}
                  onPress={() => handleSelectDoctor(item)}
                >
                  <Text style={[
                    styles.doctorName,
                    selectedDoctor?.uid === item.uid && styles.selectedDoctorName
                  ]}>
                    {item.displayName}
                  </Text>
                  {item.specialty && (
                    <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.doctorList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: scale(48),
  },
  dropdownText: {
    fontSize: scaleFont(16),
    color: '#0F172A',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  arrow: {
    fontSize: scaleFont(12),
    color: '#6B7280',
    marginLeft: scale(8),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#0F172A',
  },
  closeButton: {
    width: scale(32),
    height: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: scaleFont(18),
    color: '#6B7280',
  },
  doctorList: {
    maxHeight: scale(300),
  },
  doctorItem: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedDoctorItem: {
    backgroundColor: '#F3F4F6',
  },
  doctorName: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: scale(4),
  },
  selectedDoctorName: {
    color: '#73506E',
    fontWeight: '600',
  },
  doctorSpecialty: {
    fontSize: scaleFont(14),
    color: '#6B7280',
  },
});
