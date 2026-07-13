import { Pressable, Text } from 'react-native';

import { ScreenScaffold } from '../../src/repro/ScreenScaffold';
import { styles } from '../../src/repro/styles';
import { useSession } from '../../src/session/SessionContext';

export default function EditProfile() {
  const { logout } = useSession();

  return (
    <ScreenScaffold
      title="Edit profile"
      seed={7}
      note="The Tabs navigator (two levels below) is now FROZEN. Navigation-only variant: go Back once (the unfreeze re-links the suspended tab families and queues pending shadow updates for them), open Edit profile again, then ① Log out — after re-logging in, push Settings → Edit profile and go Back: the unfreeze walks the dangling entries → crash. Theme variant: just ① Log out and toggle the theme on the sign-in screen."
    >
      <Text style={styles.section}>Repro · step ①</Text>
      <Pressable style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnText}>① Log out — unmount (app) while tabs frozen</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
