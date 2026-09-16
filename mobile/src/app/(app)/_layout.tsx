import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/LoadingState';
import { APP_ROUTE } from '@/constants/appRoutes';
import { colors } from '@/constants/theme';

const AppLayout = () => {
  const { token, isRestoring } = useAuth();

  if (isRestoring) {
    return <LoadingState />;
  }

  if (!token) {
    return <Redirect href={APP_ROUTE.LOGIN} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
};

export default AppLayout;
