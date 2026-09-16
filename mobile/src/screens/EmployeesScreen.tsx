import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { fetchEmployees } from '@/api/employeesApi';
import { useAuth } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { EmployeeRow } from '@/components/EmployeeRow';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { APP_ROUTE, employeeRoute } from '@/constants/appRoutes';
import { FIRST_PAGE, PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/constants/pagination';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import type { EmployeeListItem } from '@/types/employee';

const keyExtractor = (employee: EmployeeListItem) => String(employee.id);

export const EmployeesScreen = () => {
  const router = useRouter();
  const { token, signOut } = useAuth();

  const [search, setSearch] = useState(STRINGS.EMPTY);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [page, setPage] = useState(FIRST_PAGE);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    setPage(FIRST_PAGE);
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadEmployees = async () => {
      if (page === FIRST_PAGE) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const result = await fetchEmployees(
          { search: debouncedSearch, page, pageSize: PAGE_SIZE },
          token,
          controller.signal,
        );

        if (!isActive) {
          return;
        }

        setTotal(result.total);
        setEmployees((previous) =>
          page === FIRST_PAGE ? result.items : [...previous, ...result.items],
        );
      } catch (caught) {
        if (isActive && !controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : STRINGS.GENERIC_ERROR);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
      }
    };

    loadEmployees();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [debouncedSearch, page, reloadCount, token]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(FIRST_PAGE);
    setReloadCount((count) => count + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setPage(FIRST_PAGE);
    setReloadCount((count) => count + 1);
  }, []);

  useRefreshOnFocus(handleRetry);

  const handleAddPress = useCallback(() => router.push(APP_ROUTE.NEW_EMPLOYEE), [router]);

  const handleEndReached = useCallback(() => {
    if (isLoading || isLoadingMore || employees.length >= total) {
      return;
    }
    setPage((currentPage) => currentPage + 1);
  }, [isLoading, isLoadingMore, employees.length, total]);

  const handleEmployeePress = useCallback(
    (employeeId: number) => router.push(employeeRoute(employeeId)),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<EmployeeListItem>) => (
      <EmployeeRow employee={item} onPress={handleEmployeePress} />
    ),
    [handleEmployeePress],
  );

  const renderContent = () => {
    if (isLoading && employees.length === 0) {
      return <LoadingState />;
    }

    if (error && employees.length === 0) {
      return <ErrorState message={error} onRetry={handleRetry} />;
    }

    if (employees.length === 0) {
      return (
        <EmptyState message={debouncedSearch ? STRINGS.NO_SEARCH_RESULTS : STRINGS.NO_EMPLOYEES} />
      );
    }

    return (
      <FlatList
        data={employees}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          isLoadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null
        }
      />
    );
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: STRINGS.EMPLOYEES_TITLE,
          headerLeft: () => (
            <Pressable onPress={signOut} hitSlop={spacing.md}>
              <Text style={styles.signOutButton}>{STRINGS.SIGN_OUT}</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleAddPress} hitSlop={spacing.md}>
              <Text style={styles.addButton}>{STRINGS.ADD_EMPLOYEE}</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={STRINGS.SEARCH_PLACEHOLDER}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  addButton: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.primary,
  },
  signOutButton: {
    fontSize: 15,
    color: colors.primary,
  },
});
