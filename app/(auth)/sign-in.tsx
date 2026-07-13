import { Pressable, Text } from 'react-native';

import { runAutoRepro } from '../../src/repro/autoRepro';
import { ScreenScaffold } from '../../src/repro/ScreenScaffold';
import { styles } from '../../src/repro/styles';
import { useSession } from '../../src/session/SessionContext';
import { toggleTheme } from '../../src/theme/applyTheme';

export default function SignIn() {
  const { login, logout } = useSession();

  return (
    <ScreenScaffold
      title="Sign in"
      seed={1}
      note="Crash ① — navigation only (new in 3.3.0): tap Auto-run and don't touch the phone (~30 s). It logs in, freezes the nested Tabs (two pushes), unfreezes them once with a back (the re-link queues pending shadow updates), freezes again and logs out — the frozen tabs unmount, their queued entries dangle — then repeats; every later unfreeze walks unistyles' never-drained map and dereferences the freed families. Manual steps: Log in → Settings → Edit profile → Back → Edit profile → Log out → Log in → Settings → Edit profile → Back. Crash ② — theme (same as on 3.2.5): ① Log in → Settings → Edit profile → Log out, then ② toggle theme here repeatedly (~5–20 toggles)."
    >
      <Text style={styles.section}>Crash ① · navigation only — hands-free</Text>
      <Pressable style={styles.btnDanger} onPress={() => void runAutoRepro({ login, logout })}>
        <Text style={styles.btnText}>🚀 Auto-run navigation repro (~30 s)</Text>
      </Pressable>

      <Text style={styles.section}>Crash ② · theme path — manual</Text>
      <Pressable style={styles.btn} onPress={login}>
        <Text style={styles.btnText}>① Log in → app</Text>
      </Pressable>
      <Pressable style={styles.btnGhost} onPress={toggleTheme}>
        <Text style={styles.btnGhostText}>② Toggle theme (repeat after a logout)</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
