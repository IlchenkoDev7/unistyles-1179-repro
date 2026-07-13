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
      note="Crash ① — navigation only (new in 3.3.0): tap Auto-run and don't touch the phone (~40 s). Manual equivalent, one round: Log in → Profile tab → Open Settings → Open Edit profile → Log out; repeat the round until it crashes — no Back step and no theme change needed. Crash ② — theme (recorded on 3.2.5): ① Log in → Profile tab → Settings → Edit profile → ① Log out, then ② toggle theme here repeatedly (~5–20 toggles)."
    >
      <Text style={styles.section}>Crash ① · navigation only — hands-free</Text>
      <Pressable style={styles.btnDanger} onPress={() => void runAutoRepro({ login, logout })}>
        <Text style={styles.btnText}>🚀 Auto-run navigation repro (~40 s)</Text>
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
