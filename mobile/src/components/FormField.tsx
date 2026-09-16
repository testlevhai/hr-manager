import { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { FormFieldProps } from '@/types/components';

export const FormField = memo(
  ({
    name,
    label,
    value,
    onChange,
    error,
    placeholder,
    keyboardType,
    multiline,
    editable,
  }: FormFieldProps) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.inputMultiline : null, error ? styles.inputError : null]}
        value={value}
        onChangeText={(text) => onChange(name, text)}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
      multiline={multiline}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  ),
);

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});
