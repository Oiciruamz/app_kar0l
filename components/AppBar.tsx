import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, scaleFont } from '@/lib/utils/responsive';

interface AppBarProps {
  title: string;
  showBack?: boolean;
}

export function AppBar({ title, showBack = false }: AppBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} accessibilityRole="banner">
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Regresar"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDDDE9',
    minHeight: scale(56),
    justifyContent: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: scale(8),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: scale(12),
    width: scale(44),
    height: scale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: scaleFont(20),
    color: '#0F172A',
  },
  title: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: scale(16),
  },
});

