import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  TouchableOpacityProps,
  StyleSheet 
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md';
  loading?: boolean;
  children: React.ReactNode;
  textStyle?: any;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  textStyle,
  ...props 
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0F172A'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // pill
    minHeight: 44, // accessibility
  },
  primary: {
    backgroundColor: '#73506E', // brand-strong
  },
  secondary: {
    backgroundColor: '#E9E9E9', // neutral-100
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#0F172A',
  },
  ghostText: {
    color: '#73506E',
  },
});

