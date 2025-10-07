import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from '@/lib/utils/responsive';

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  paddingTop?: boolean;
  paddingBottom?: boolean;
}

export function SafeAreaView({ 
  children, 
  style, 
  backgroundColor = '#EDDDE9',
  paddingTop = true,
  paddingBottom = false 
}: SafeAreaViewProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = {
    paddingTop: paddingTop ? insets.top + scale(8) : 0,
    paddingBottom: paddingBottom ? insets.bottom + scale(8) : 0,
    backgroundColor,
  };

  return (
    <View style={[styles.container, safeAreaStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
