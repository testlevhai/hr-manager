import type { EmployeeInput, EmployeeListItem, ManagerSummary } from './employee';
import type { EmployeeFormValues } from './form';
import type { TimelineEntry } from './timeline';

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

export type DetailRowProps = {
  label: string;
  value: string;
};

export type TimelineEntryRowProps = {
  entry: TimelineEntry;
};

export type FormFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  editable: boolean;
};

export type PillSelectorProps = {
  name: string;
  label: string;
  options: string[];
  selected: string;
  onSelect: (name: string, option: string) => void;
  error?: string;
  disabled: boolean;
};

export type ManagerPickerProps = {
  label: string;
  managers: ManagerSummary[];
  selectedManagerId: number | null;
  onSelect: (managerId: number | null) => void;
  disabled: boolean;
};

export type EmployeeFormProps = {
  initialValues: EmployeeFormValues;
  onSubmit: (values: EmployeeInput) => Promise<void>;
  excludeManagerId?: number;
};
