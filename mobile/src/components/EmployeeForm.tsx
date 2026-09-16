import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { fetchDepartments } from '@/api/departmentsApi';
import { fetchEmployees } from '@/api/employeesApi';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { useIsMounted } from '@/hooks/useIsMounted';
import { FormField } from './FormField';
import { PillSelector } from './PillSelector';
import { ManagerPicker } from './ManagerPicker';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EMPLOYEE_FIELD } from '@/constants/formFields';
import { EMPLOYMENT_STATUSES, EMPLOYMENT_TYPES } from '@/constants/employment';
import { FIRST_PAGE } from '@/constants/pagination';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import { DATE_PATTERN, EMAIL_PATTERN, MANAGER_OPTIONS_PAGE_SIZE } from '@/constants/validation';
import type { EmployeeFormProps, FormFieldProps } from '@/types/components';
import type { EmployeeFormErrors, EmployeeFormValues } from '@/types/form';
import type { Department, EmployeeListItem, ManagerSummary } from '@/types/employee';
import type { Paginated } from '@/types/pagination';

type TextFieldConfig = {
  name: keyof EmployeeFormValues;
  label: string;
  keyboardType?: FormFieldProps['keyboardType'];
  placeholder?: string;
};

const TEXT_FIELDS: TextFieldConfig[] = [
  { name: 'firstName', label: STRINGS.FIELD_FIRST_NAME },
  { name: 'lastName', label: STRINGS.FIELD_LAST_NAME },
  { name: 'email', label: STRINGS.FIELD_EMAIL, keyboardType: 'email-address' },
  { name: 'phone', label: STRINGS.FIELD_PHONE, keyboardType: 'phone-pad' },
  {
    name: 'dateOfBirth',
    label: STRINGS.FIELD_DATE_OF_BIRTH,
    placeholder: STRINGS.DATE_PLACEHOLDER,
  },
  { name: 'jobTitle', label: STRINGS.FIELD_JOB_TITLE },
  { name: 'startDate', label: STRINGS.FIELD_START_DATE, placeholder: STRINGS.DATE_PLACEHOLDER },
  { name: 'salary', label: STRINGS.FIELD_SALARY, keyboardType: 'numeric' },
];

const REQUIRED_TEXT_FIELDS = [
  EMPLOYEE_FIELD.FIRST_NAME,
  EMPLOYEE_FIELD.LAST_NAME,
  EMPLOYEE_FIELD.PHONE,
  EMPLOYEE_FIELD.JOB_TITLE,
];

const validate = (values: EmployeeFormValues): EmployeeFormErrors => {
  const errors: EmployeeFormErrors = {};

  REQUIRED_TEXT_FIELDS.forEach((field) => {
    const value = values[field as keyof EmployeeFormValues];
    if (typeof value === 'string' && !value.trim()) {
      errors[field] = STRINGS.REQUIRED_FIELD;
    }
  });

  if (!values.departmentName) errors[EMPLOYEE_FIELD.DEPARTMENT_NAME] = STRINGS.REQUIRED_FIELD;
  if (!values.employmentType) errors[EMPLOYEE_FIELD.EMPLOYMENT_TYPE] = STRINGS.REQUIRED_FIELD;
  if (!values.employmentStatus) errors[EMPLOYEE_FIELD.EMPLOYMENT_STATUS] = STRINGS.REQUIRED_FIELD;

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors[EMPLOYEE_FIELD.EMAIL] = STRINGS.INVALID_EMAIL;
  }

  if (!DATE_PATTERN.test(values.dateOfBirth.trim())) {
    errors[EMPLOYEE_FIELD.DATE_OF_BIRTH] = STRINGS.INVALID_DATE;
  }

  if (!DATE_PATTERN.test(values.startDate.trim())) {
    errors[EMPLOYEE_FIELD.START_DATE] = STRINGS.INVALID_DATE;
  }

  const salary = Number(values.salary);
  if (!values.salary.trim() || Number.isNaN(salary) || salary < 0) {
    errors[EMPLOYEE_FIELD.SALARY] = STRINGS.INVALID_SALARY;
  }

  return errors;
};

export const EmployeeForm = ({ initialValues, onSubmit, excludeManagerId }: EmployeeFormProps) => {
  const { token } = useAuth();
  const isMounted = useIsMounted();

  const [values, setValues] = useState<EmployeeFormValues>(initialValues);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const departmentsRequest = useFetch<{ items: Department[] }>(
    (signal) => fetchDepartments(token, signal),
    [token],
  );

  const employeesRequest = useFetch<Paginated<EmployeeListItem>>(
    (signal) =>
      fetchEmployees(
        { search: STRINGS.EMPTY, page: FIRST_PAGE, pageSize: MANAGER_OPTIONS_PAGE_SIZE },
        token,
        signal,
      ),
    [token],
  );

  const departments = departmentsRequest.data?.items;
  const departmentNames = useMemo(
    () => (departments ?? []).map((department) => department.name),
    [departments],
  );

  const employeeItems = employeesRequest.data?.items;
  const managers = useMemo<ManagerSummary[]>(
    () =>
      (employeeItems ?? [])
        .filter((employee) => employee.id !== excludeManagerId)
        .map((employee) => ({
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
        })),
    [employeeItems, excludeManagerId],
  );

  const handleChange = useCallback((name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const handleManagerSelect = useCallback((managerId: number | null) => {
    setValues((current) => ({ ...current, managerId }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const department = (departments ?? []).find((item) => item.name === values.departmentName);
    if (!department) {
      setErrors({ [EMPLOYEE_FIELD.DEPARTMENT_NAME]: STRINGS.REQUIRED_FIELD });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        dateOfBirth: values.dateOfBirth.trim(),
        jobTitle: values.jobTitle.trim(),
        departmentId: department.id,
        managerId: values.managerId,
        startDate: values.startDate.trim(),
        employmentType: values.employmentType,
        employmentStatus: values.employmentStatus,
        salary: Number(values.salary),
      });
    } catch (caught) {
      if (isMounted.current) {
        setSubmitError(caught instanceof Error ? caught.message : STRINGS.GENERIC_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [values, departments, onSubmit, isMounted]);

  if (departmentsRequest.isLoading || employeesRequest.isLoading) {
    return <LoadingState />;
  }

  const loadError = departmentsRequest.error ?? employeesRequest.error;
  if (loadError) {
    return <ErrorState message={loadError} onRetry={departmentsRequest.reload} />;
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: 'padding' })}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {TEXT_FIELDS.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            value={String(values[field.name] ?? STRINGS.EMPTY)}
            onChange={handleChange}
            error={errors[field.name]}
            placeholder={field.placeholder}
            keyboardType={field.keyboardType}
            editable={!isSubmitting}
          />
        ))}

        <PillSelector
          name={EMPLOYEE_FIELD.DEPARTMENT_NAME}
          label={STRINGS.FIELD_DEPARTMENT}
          options={departmentNames}
          selected={values.departmentName}
          onSelect={handleChange}
          error={errors[EMPLOYEE_FIELD.DEPARTMENT_NAME]}
          disabled={isSubmitting}
        />
        <PillSelector
          name={EMPLOYEE_FIELD.EMPLOYMENT_TYPE}
          label={STRINGS.FIELD_EMPLOYMENT_TYPE}
          options={EMPLOYMENT_TYPES}
          selected={values.employmentType}
          onSelect={handleChange}
          error={errors[EMPLOYEE_FIELD.EMPLOYMENT_TYPE]}
          disabled={isSubmitting}
        />
        <PillSelector
          name={EMPLOYEE_FIELD.EMPLOYMENT_STATUS}
          label={STRINGS.FIELD_EMPLOYMENT_STATUS}
          options={EMPLOYMENT_STATUSES}
          selected={values.employmentStatus}
          onSelect={handleChange}
          error={errors[EMPLOYEE_FIELD.EMPLOYMENT_STATUS]}
          disabled={isSubmitting}
        />
        <ManagerPicker
          label={STRINGS.FIELD_MANAGER}
          managers={managers}
          selectedManagerId={values.managerId}
          onSelect={handleManagerSelect}
          disabled={isSubmitting}
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Pressable
          style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitLabel}>{isSubmitting ? STRINGS.SAVING : STRINGS.SAVE}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submitError: {
    fontSize: 14,
    color: colors.danger,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 16,
  },
});
