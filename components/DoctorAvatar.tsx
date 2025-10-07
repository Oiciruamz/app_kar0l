import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { getDoctorImageBySpecialty, getRandomDoctorImage, optimizeDoctorImageUrl } from '@/lib/services/doctorImages';

interface DoctorAvatarProps {
  doctor: {
    displayName: string;
    specialty?: string;
    photoURL?: string;
  };
  size?: number;
  style?: any;
}

export function DoctorAvatar({ doctor, size = 100, style }: DoctorAvatarProps) {
  // Si ya tiene una imagen, usarla
  if (doctor.photoURL) {
    return (
      <Image 
        source={{ uri: optimizeDoctorImageUrl(doctor.photoURL, size, size) }} 
        style={[styles.avatar, { width: size, height: size }, style]}
        resizeMode="cover"
      />
    );
  }

  // Si no tiene imagen, usar una basada en la especialidad
  const imageUrl = doctor.specialty 
    ? getDoctorImageBySpecialty(doctor.specialty)
    : getRandomDoctorImage();

  return (
    <Image 
      source={{ uri: optimizeDoctorImageUrl(imageUrl, size, size) }} 
      style={[styles.avatar, { width: size, height: size }, style]}
      resizeMode="cover"
    />
  );
}

interface DoctorAvatarPlaceholderProps {
  doctor: {
    displayName: string;
  };
  size?: number;
  style?: any;
}

export function DoctorAvatarPlaceholder({ doctor, size = 100, style }: DoctorAvatarPlaceholderProps) {
  return (
    <View style={[styles.placeholder, { width: size, height: size }, style]}>
      <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
        {doctor.displayName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontWeight: 'bold',
    color: '#666',
  },
});
