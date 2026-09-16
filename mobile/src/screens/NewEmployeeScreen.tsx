import { useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { createEmployee } from '@/api/employeesApi';
import { useAuth } from '@/context/AuthContext';
import { EmployeeForm } from '@/components/EmployeeForm';
import { employeeRoute } from '@/constants/appRoutes';
import { EMPLOYMENT_STATUS, EMPLOYMENT_TYPE } from '@/constants/employment';
import { STRINGS } from '@/constants/strings';
import type { EmployeeInput } from '@/types/employee';
import type { EmployeeFormValues } from '@/types/form';

const EMPTY_EMPLOYEE: EmployeeFormValues = {
  firstName: STRINGS.EMPTY,
  lastName: STRINGS.EMPTY,
  email: STRINGS.EMPTY,
  phone: STRINGS.EMPTY,
  dateOfBirth: STRINGS.EMPTY,
  jobTitle: STRINGS.EMPTY,
  departmentName: STRINGS.EMPTY,
  managerId: null,
  startDate: STRINGS.EMPTY,
  employmentType: EMPLOYMENT_TYPE.FULL_TIME,
  employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
  salary: STRINGS.EMPTY,
};

export const NewEmployeeScreen = () => {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = useCallback(
    async (values: EmployeeInput) => {
      const createdEmployee = await createEmployee(values, token);
      router.replace(employeeRoute(createdEmployee.id));
    },
    [token, router],
  );

  return (
    <>
      <Stack.Screen options={{ title: STRINGS.NEW_EMPLOYEE_TITLE }} />
      <EmployeeForm initialValues={EMPTY_EMPLOYEE} onSubmit={handleSubmit} />
    </>
  );
};
