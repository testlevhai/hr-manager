import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchTimeline } from '@/api/timelineApi';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { TimelineEntryRow } from '@/components/TimelineEntryRow';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { newTimelineEntryRoute } from '@/constants/appRoutes';
import { STRINGS } from '@/constants/strings';
import { colors, spacing } from '@/constants/theme';
import type { TimelineEntry } from '@/types/timeline';
import type { Paginated } from '@/types/pagination';

const keyExtractor = (entry: TimelineEntry) => String(entry.id);

const renderItem = ({ item }: ListRenderItemInfo<TimelineEntry>) => <TimelineEntryRow entry={item} />;

export const EmployeeTimelineScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const employeeId = Number(id);

  const { data, error, isLoading, reload } = useFetch<Paginated<TimelineEntry>>(
    (signal) => fetchTimeline(employeeId, token, signal),
    [employeeId, token],
  );

  useRefreshOnFocus(reload);

  const handleAddPress = useCallback(
    () => router.push(newTimelineEntryRoute(employeeId)),
    [router, employeeId],
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={reload} />;
    }

    const entries = data?.items ?? [];
    if (entries.length === 0) {
      return <EmptyState message={STRINGS.NO_TIMELINE_ENTRIES} />;
    }

    return (
      <FlatList
        data={entries}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: STRINGS.TIMELINE_TITLE,
          headerRight: () => (
            <Pressable onPress={handleAddPress} hitSlop={spacing.md}>
              <Text style={styles.addButton}>{STRINGS.ADD_TIMELINE_ENTRY}</Text>
            </Pressable>
          ),
        }}
      />
      {renderContent()}
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  addButton: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.primary,
  },
});
