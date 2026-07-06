import { Redirect, Stack } from 'expo-router';

import { useSessionRouteTarget } from '../../src/session/SessionContext';

export default function AuthLayout() {
  const target = useSessionRouteTarget();

  if (target === 'app') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
