import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/LoadingState';
import { APP_ROUTE } from '@/constants/appRoutes';

const Index = () => {
  const { token, isRestoring } = useAuth();

  if (isRestoring) {
    return <LoadingState />;
  }

  return <Redirect href={token ? APP_ROUTE.EMPLOYEES : APP_ROUTE.LOGIN} />;
};

export default Index;
