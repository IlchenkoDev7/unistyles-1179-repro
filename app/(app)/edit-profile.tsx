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
      note="The Tabs navigator (two levels below) is now FROZEN. ① Log out — the auth gate unmounts the whole (app) group while it's frozen, so unistyles never unlinks those families. Navigation flow: log back in and repeat Profile tab → Settings → Edit profile → Log out until it crashes. Theme flow: toggle the theme on the sign-in screen."
    >
      <Text style={styles.section}>Repro · step ①</Text>
      <Pressable style={styles.btnDanger} onPress={logout}>
        <Text style={styles.btnText}>① Log out — unmount (app) while tabs frozen</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
