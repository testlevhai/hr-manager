import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import type { EmptyStateProps } from '@/types/components';

export const EmptyState = ({ message }: EmptyStateProps) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
});
