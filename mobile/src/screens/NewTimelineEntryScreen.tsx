import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { createTimelineEntry } from '@/api/timelineApi';
import { useAuth } from '@/context/AuthContext';
import { useIsMounted } from '@/hooks/useIsMounted';
import { FormField } from '@/components/FormField';
import { PillSelector } from '@/components/PillSelector';
import { TIMELINE_EVENT_TYPE, TIMELINE_EVENT_TYPES } from '@/constants/employment';
import { TIMELINE_FIELD } from '@/constants/formFields';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import { DATE_PATTERN } from '@/constants/validation';
import type { EmployeeFormErrors } from '@/types/form';
import type { TimelineEntryInput } from '@/types/timeline';

const padNumber = (value: number) => String(value).padStart(2, '0');

const todayAsIsoDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${padNumber(now.getMonth() + 1)}-${padNumber(now.getDate())}`;
};

export const NewTimelineEntryScreen = () => {
  const router = useRouter();
  const { token } = useAuth();
  const isMounted = useIsMounted();
  const { id } = useLocalSearchParams<{ id: string }>();
  const employeeId = Number(id);

  const [values, setValues] = useState<TimelineEntryInput>({
    eventType: TIMELINE_EVENT_TYPE.GENERAL_NOTE,
    eventDate: todayAsIsoDate(),
    title: STRINGS.EMPTY,
    content: STRINGS.EMPTY,
  });
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = useCallback(async () => {
    const nextErrors: EmployeeFormErrors = {};

    if (!values.eventType) nextErrors[TIMELINE_FIELD.EVENT_TYPE] = STRINGS.REQUIRED_FIELD;
    if (!values.title.trim()) nextErrors[TIMELINE_FIELD.TITLE] = STRINGS.REQUIRED_FIELD;
    if (!values.content.trim()) nextErrors[TIMELINE_FIELD.CONTENT] = STRINGS.REQUIRED_FIELD;
    if (!DATE_PATTERN.test(values.eventDate.trim())) {
      nextErrors[TIMELINE_FIELD.EVENT_DATE] = STRINGS.INVALID_DATE;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createTimelineEntry(
        employeeId,
        {
          eventType: values.eventType,
          eventDate: values.eventDate.trim(),
          title: values.title.trim(),
          content: values.content.trim(),
        },
        token,
      );
      router.back();
    } catch (caught) {
      if (isMounted.current) {
        setSubmitError(caught instanceof Error ? caught.message : STRINGS.GENERIC_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [values, employeeId, token, router, isMounted]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.select({ ios: 'padding' })}>
      <Stack.Screen options={{ title: STRINGS.NEW_TIMELINE_ENTRY_TITLE }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PillSelector
          name={TIMELINE_FIELD.EVENT_TYPE}
          label={STRINGS.FIELD_EVENT_TYPE}
          options={TIMELINE_EVENT_TYPES}
          selected={values.eventType}
          onSelect={handleChange}
          error={errors[TIMELINE_FIELD.EVENT_TYPE]}
          disabled={isSubmitting}
        />
        <FormField
          name={TIMELINE_FIELD.EVENT_DATE}
          label={STRINGS.FIELD_EVENT_DATE}
          value={values.eventDate}
          onChange={handleChange}
          error={errors[TIMELINE_FIELD.EVENT_DATE]}
          placeholder={STRINGS.DATE_PLACEHOLDER}
          editable={!isSubmitting}
        />
        <FormField
          name={TIMELINE_FIELD.TITLE}
          label={STRINGS.FIELD_TITLE}
          value={values.title}
          onChange={handleChange}
          error={errors[TIMELINE_FIELD.TITLE]}
          editable={!isSubmitting}
        />
        <FormField
          name={TIMELINE_FIELD.CONTENT}
          label={STRINGS.FIELD_CONTENT}
          value={values.content}
          onChange={handleChange}
          error={errors[TIMELINE_FIELD.CONTENT]}
          multiline
          editable={!isSubmitting}
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
