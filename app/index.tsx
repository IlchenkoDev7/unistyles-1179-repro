import { Redirect } from 'expo-router';

import { useSessionRouteTarget } from '../src/session/SessionContext';

// The root gate: a conditional <Redirect> driven by the session route-target.
// Guest → auth, authed → app.
export default function Index() {
  const target = useSessionRouteTarget();

  if (target === 'app') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
