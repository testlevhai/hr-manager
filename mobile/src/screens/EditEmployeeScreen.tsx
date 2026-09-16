import { useCallback } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchEmployee, updateEmployee } from '@/api/employeesApi';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { EmployeeForm } from '@/components/EmployeeForm';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { STRINGS } from '@/constants/strings';
import type { EmployeeDetail, EmployeeInput } from '@/types/employee';
import type { EmployeeFormValues } from '@/types/form';

const toFormValues = (employee: EmployeeDetail): EmployeeFormValues => ({
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  phone: employee.phone,
  dateOfBirth: employee.dateOfBirth,
  jobTitle: employee.jobTitle,
  departmentName: employee.department.name,
  managerId: employee.manager?.id ?? null,
  startDate: employee.startDate,
  employmentType: employee.employmentType,
  employmentStatus: employee.employmentStatus,
  salary: String(employee.salary),
});

export const EditEmployeeScreen = () => {
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

  const handleSubmit = useCallback(
    async (values: EmployeeInput) => {
      await updateEmployee(employeeId, values, token);
      router.back();
    },
    [employeeId, token, router],
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error || !employee) {
      return <ErrorState message={error ?? STRINGS.GENERIC_ERROR} onRetry={reload} />;
    }

    return (
      <EmployeeForm
        initialValues={toFormValues(employee)}
        onSubmit={handleSubmit}
        excludeManagerId={employeeId}
      />
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: STRINGS.EDIT_EMPLOYEE_TITLE }} />
      {renderContent()}
    </>
  );
};
