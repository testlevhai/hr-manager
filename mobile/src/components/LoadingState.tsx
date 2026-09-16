import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export const LoadingState = () => (
  <View style={styles.container}>
    <ActivityIndicator color={colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
