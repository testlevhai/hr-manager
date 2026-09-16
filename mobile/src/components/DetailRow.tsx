import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import type { DetailRowProps } from '@/types/components';

export const DetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
});
