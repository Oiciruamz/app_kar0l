import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput as RNTextInput, 
  TextInputProps as RNTextInputProps,
  StyleSheet 
} from 'react-native';

interface TextInputProps extends RNTextInputProps {
  label: string;
  helperText?: string;
  error?: string;
}

export function TextInput({ 
  label, 
  helperText, 
  error,
  style,
  ...props 
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          style
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#6B7280"
        accessibilityLabel={label}
        {...props}
      />
      {(helperText || error) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFDDDF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    minHeight: 44, // accessibility
  },
  inputFocused: {
    borderColor: '#73506E',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
  },
});

