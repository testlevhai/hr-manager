import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '@/constants/theme';

const EmployeeProfileRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>{id}</Text>
    </View>
  );
};

export default EmployeeProfileRoute;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  text: {
    fontSize: 18,
    color: colors.text,
  },
});
