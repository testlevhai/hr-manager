import { StyleSheet, Text, View } from 'react-native';
import { EMPLOYMENT_STATUS } from '@/constants/employment';
import { colors, radius, spacing } from '@/constants/theme';
import type { StatusBadgeProps } from '@/types/components';

const BADGE_COLORS: Record<string, { text: string; background: string }> = {
  [EMPLOYMENT_STATUS.ACTIVE]: {
    text: colors.activeBadge,
    background: colors.activeBadgeBackground,
  },
  [EMPLOYMENT_STATUS.ON_LEAVE]: {
    text: colors.onLeaveBadge,
    background: colors.onLeaveBadgeBackground,
  },
  [EMPLOYMENT_STATUS.TERMINATED]: {
    text: colors.terminatedBadge,
    background: colors.terminatedBadgeBackground,
  },
};

const FALLBACK_BADGE = {
  text: colors.terminatedBadge,
  background: colors.terminatedBadgeBackground,
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const badge = BADGE_COLORS[status] ?? FALLBACK_BADGE;

  return (
    <View style={[styles.badge, { backgroundColor: badge.background }]}>
      <Text style={[styles.label, { color: badge.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
