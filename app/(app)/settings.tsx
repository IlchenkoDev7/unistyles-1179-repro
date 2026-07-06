import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { ScreenScaffold } from '../../src/repro/ScreenScaffold';
import { styles } from '../../src/repro/styles';
import { toggleTheme } from '../../src/theme/applyTheme';

export default function Settings() {
  const router = useRouter();

  return (
    <ScreenScaffold
      title="Settings"
      seed={6}
      note="Pushed over the tabs. Push Edit profile next — then the Tabs navigator is two levels below the top and freezes."
    >
      <Text style={styles.section}>Go deeper</Text>
      <Pressable style={styles.btn} onPress={() => router.push('/edit-profile')}>
        <Text style={styles.btnText}>Open Edit profile →</Text>
      </Pressable>

      <Text style={styles.section}>Theme · control (never crashed here before a logout)</Text>
      <Pressable style={styles.btnGhost} onPress={toggleTheme}>
        <Text style={styles.btnGhostText}>Toggle theme here</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
