import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from '../src/session/SessionContext';

// Root layout: the session store sits here, ABOVE the router, so a logout that
// flips it to guest re-renders the route-target consumers and unmounts the
// whole `(app)` group. Groups swap with `animation: 'none'`.
export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
        <Stack.Screen name="(app)" options={{ animation: 'none' }} />
      </Stack>
    </SessionProvider>
  );
}
