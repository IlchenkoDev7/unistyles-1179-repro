import { Redirect, Stack } from 'expo-router';

import { useSessionRouteTarget } from '../../src/session/SessionContext';

// The `(app)` stack. Its guard is what actually fires on logout: when the
// session flips to guest, `target !== 'app'` and this <Redirect> unmounts the
// whole group — including the frozen nested Tabs navigator two levels below when
// the user is at edit-profile. `settings` and `edit-profile` are pushed OVER
// the tabs.
export default function AppLayout() {
  const target = useSessionRouteTarget();

  if (target !== 'app') {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen
        name="edit-profile"
        options={{ title: 'Edit profile', gestureEnabled: false }}
      />
    </Stack>
  );
}
