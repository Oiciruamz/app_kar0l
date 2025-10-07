import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Doctor } from '@/lib/types';
import { Card } from './ui/Card';
import { scale, scaleFont, widthPercentage } from '@/lib/utils/responsive';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {doctor.photoURL ? (
            <Image source={{ uri: doctor.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {doctor.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name}>{doctor.displayName}</Text>
          {doctor.specialty && (
            <Text style={styles.specialty}>{doctor.specialty}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${doctor.displayName}`}
        >
          <Text style={styles.buttonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: scale(12),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: scale(12),
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
  },
  avatarPlaceholder: {
    backgroundColor: '#B7ACB4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: scale(3),
  },
  specialty: {
    fontSize: scaleFont(13),
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#73506E',
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    minHeight: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: scale(60),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
});

