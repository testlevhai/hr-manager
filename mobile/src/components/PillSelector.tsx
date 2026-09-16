import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { PillSelectorProps } from '@/types/components';

export const PillSelector = memo(
  ({ name, label, options, selected, onSelect, error, disabled }: PillSelectorProps) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pills}>
        {options.map((option) => {
          const isSelected = option === selected;

          return (
            <Pressable
              key={option}
              style={[styles.pill, isSelected ? styles.pillSelected : null]}
              onPress={() => onSelect(name, option)}
              disabled={disabled}
            >
              <Text style={[styles.pillLabel, isSelected ? styles.pillLabelSelected : null]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  ),
);

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pillLabel: {
    fontSize: 14,
    color: colors.text,
  },
  pillLabelSelected: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});
