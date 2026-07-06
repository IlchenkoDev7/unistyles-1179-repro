import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

// A minimal in-memory session store: a value held ABOVE the router that flips
// guest↔authed. When it flips, the
// route-target consumers (`app/index.tsx`, `app/(app)/_layout.tsx`) re-render and
// their `<Redirect>` moves the router — which is what unmounts the whole `(app)`
// group (with its frozen nested Tabs navigator) on logout.
export type SessionStatus = 'guest' | 'authed';
export type RouteTarget = 'auth' | 'app';

type SessionValue = Readonly<{
  status: SessionStatus;
  login: () => void;
  logout: () => void;
}>;

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('guest');

  const value = useMemo<SessionValue>(
    () => ({
      status,
      login: () => setStatus('authed'),
      logout: () => setStatus('guest'),
    }),
    [status],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);

  if (!ctx) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return ctx;
}

export function useSessionRouteTarget(): RouteTarget {
  return useSession().status === 'authed' ? 'app' : 'auth';
}
