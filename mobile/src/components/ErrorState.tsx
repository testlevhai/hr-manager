import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { STRINGS } from '@/constants/strings';
import type { ErrorStateProps } from '@/types/components';

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <View style={styles.container}>
    <Text style={styles.message}>{message}</Text>
    <Pressable style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryLabel}>{STRINGS.RETRY}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  retryLabel: {
    color: colors.primaryText,
    fontWeight: '600',
  },
});
