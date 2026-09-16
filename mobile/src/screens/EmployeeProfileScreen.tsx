import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchEmployee } from '@/api/employeesApi';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { DetailRow } from '@/components/DetailRow';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { editEmployeeRoute, employeeTimelineRoute } from '@/constants/appRoutes';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import type { EmployeeDetail } from '@/types/employee';

export const EmployeeProfileScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const employeeId = Number(id);

  const {
    data: employee,
    error,
    isLoading,
    reload,
  } = useFetch<EmployeeDetail>(
    (signal) => fetchEmployee(employeeId, token, signal),
    [employeeId, token],
  );

  useRefreshOnFocus(reload);

  const handleEditPress = useCallback(
    () => router.push(editEmployeeRoute(employeeId)),
    [router, employeeId],
  );

  const handleTimelinePress = useCallback(
    () => router.push(employeeTimelineRoute(employeeId)),
    [router, employeeId],
  );

  const headerTitle = employee
    ? `${employee.firstName} ${employee.lastName.charAt(0)}${STRINGS.NAME_INITIAL_SUFFIX}`
    : STRINGS.EMPTY;

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error || !employee) {
      return <ErrorState message={error ?? STRINGS.GENERIC_ERROR} onRetry={reload} />;
    }

    const managerName = employee.manager
      ? `${employee.manager.firstName} ${employee.manager.lastName}`
      : STRINGS.NO_MANAGER;

    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.name}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text style={styles.jobTitle}>{employee.jobTitle}</Text>
          <StatusBadge status={employee.employmentStatus} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>{STRINGS.PERSONAL_DETAILS}</Text>
          <DetailRow label={STRINGS.FIELD_EMAIL} value={employee.email} />
          <DetailRow label={STRINGS.FIELD_PHONE} value={employee.phone} />
          <DetailRow label={STRINGS.FIELD_DATE_OF_BIRTH} value={employee.dateOfBirth} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>{STRINGS.EMPLOYMENT_DETAILS}</Text>
          <DetailRow label={STRINGS.FIELD_DEPARTMENT} value={employee.department.name} />
          <DetailRow label={STRINGS.FIELD_MANAGER} value={managerName} />
          <DetailRow label={STRINGS.FIELD_START_DATE} value={employee.startDate} />
          <DetailRow label={STRINGS.FIELD_EMPLOYMENT_TYPE} value={employee.employmentType} />
          <DetailRow label={STRINGS.FIELD_SALARY} value={employee.salary.toLocaleString()} />
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={handleEditPress}>
            <Text style={styles.primaryButtonLabel}>{STRINGS.EDIT_EMPLOYEE}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleTimelinePress}>
            <Text style={styles.secondaryButtonLabel}>{STRINGS.VIEW_TIMELINE}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      {renderContent()}
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  jobTitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
