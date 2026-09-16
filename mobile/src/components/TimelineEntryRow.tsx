import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import type { TimelineEntryRowProps } from '@/types/components';

export const TimelineEntryRow = memo(({ entry }: TimelineEntryRowProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.typeBadge}>
        <Text style={styles.typeLabel}>{entry.eventType}</Text>
      </View>
      <Text style={styles.date}>{entry.eventDate}</Text>
    </View>
    <Text style={styles.title}>{entry.title}</Text>
    <Text style={styles.content}>{entry.content}</Text>
    <Text style={styles.author}>
      {STRINGS.ENTRY_AUTHOR_PREFIX} {entry.author.name}
    </Text>
  </View>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
