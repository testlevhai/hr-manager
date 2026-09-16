import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { colors, radius, spacing } from '@/constants/theme';
import type { EmployeeRowProps } from '@/types/components';

export const EmployeeRow = memo(({ employee, onPress }: EmployeeRowProps) => (
  <Pressable style={styles.row} onPress={() => onPress(employee.id)}>
    <View style={styles.details}>
      <Text style={styles.name}>
        {employee.firstName} {employee.lastName}
      </Text>
      <Text style={styles.jobTitle}>{employee.jobTitle}</Text>
      <Text style={styles.department}>{employee.departmentName}</Text>
    </View>
    <StatusBadge status={employee.employmentStatus} />
  </Pressable>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  jobTitle: {
    fontSize: 14,
    color: colors.text,
  },
  department: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
