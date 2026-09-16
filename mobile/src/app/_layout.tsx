import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';

const RootLayout = () => (
  <AuthProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false }} />
  </AuthProvider>
);

export default RootLayout;
