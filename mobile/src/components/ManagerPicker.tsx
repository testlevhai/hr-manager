import { memo, useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { STRINGS } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import type { ManagerPickerProps } from '@/types/components';
import type { ManagerSummary } from '@/types/employee';

const keyExtractor = (manager: ManagerSummary) => String(manager.id);

export const ManagerPicker = memo(
  ({ label, managers, selectedManagerId, onSelect, disabled }: ManagerPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedManager = managers.find((manager) => manager.id === selectedManagerId);
    const selectedLabel = selectedManager
      ? `${selectedManager.firstName} ${selectedManager.lastName}`
      : STRINGS.NO_MANAGER_OPTION;

    const handleOpen = useCallback(() => setIsOpen(true), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    const handleSelect = useCallback(
      (managerId: number | null) => {
        onSelect(managerId);
        setIsOpen(false);
      },
      [onSelect],
    );

    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<ManagerSummary>) => (
        <Pressable style={styles.option} onPress={() => handleSelect(item.id)}>
          <Text style={styles.optionLabel}>
            {item.firstName} {item.lastName}
          </Text>
        </Pressable>
      ),
      [handleSelect],
    );

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.trigger} onPress={handleOpen} disabled={disabled}>
          <Text style={styles.triggerLabel}>{selectedLabel}</Text>
        </Pressable>

        <Modal visible={isOpen} animationType="slide" transparent onRequestClose={handleClose}>
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{STRINGS.SELECT_MANAGER}</Text>
              <Pressable style={styles.option} onPress={() => handleSelect(null)}>
                <Text style={styles.optionLabel}>{STRINGS.NO_MANAGER_OPTION}</Text>
              </Pressable>
              <FlatList data={managers} keyExtractor={keyExtractor} renderItem={renderItem} />
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeLabel}>{STRINGS.CANCEL}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  trigger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  triggerLabel: {
    fontSize: 15,
    color: colors.text,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
    gap: spacing.xs,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabel: {
    fontSize: 15,
    color: colors.text,
  },
  closeButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
