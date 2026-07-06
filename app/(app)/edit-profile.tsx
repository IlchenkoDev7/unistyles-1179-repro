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
      note="The Tabs navigator (two levels below) is now FROZEN. Logging out flips the session to guest, which unmounts the whole (app) group WHILE the tabs are frozen."
    >
      <Text style={styles.section}>Repro · step ①</Text>
      <Pressable style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnText}>① Log out — unmount (app) while tabs frozen</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
