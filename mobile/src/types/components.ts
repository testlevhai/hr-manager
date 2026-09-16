import type { EmployeeListItem } from './employee';

export type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export type EmptyStateProps = {
  message: string;
};

export type StatusBadgeProps = {
  status: string;
};

export type EmployeeRowProps = {
  employee: EmployeeListItem;
  onPress: (employeeId: number) => void;
};
