import { Pressable, Text } from 'react-native';

import { ScreenScaffold } from '../../src/repro/ScreenScaffold';
import { styles } from '../../src/repro/styles';
import { useSession } from '../../src/session/SessionContext';
import { toggleTheme } from '../../src/theme/applyTheme';

export default function SignIn() {
  const { login } = useSession();

  return (
    <ScreenScaffold
      title="Sign in"
      seed={1}
      note="Full cycle: ① Log in → Profile tab → Open Settings → Edit profile → ① Log out (lands back here) → ② Toggle theme (or flip OS appearance) repeatedly. In our runs the crash comes within ~5–20 toggles after a logout; repeat the whole cycle if it doesn't."
    >
      <Text style={styles.section}>Step ① · start the cycle</Text>
      <Pressable style={styles.btn} onPress={login}>
        <Text style={styles.btnText}>Log in → app</Text>
      </Pressable>

      <Text style={styles.section}>Step ② · trigger (or a control before logout)</Text>
      <Pressable style={styles.btnDanger} onPress={toggleTheme}>
        <Text style={styles.btnText}>② Toggle theme (repeat after a logout)</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
