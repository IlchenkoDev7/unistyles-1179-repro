import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { ScreenScaffold } from '../../../src/repro/ScreenScaffold';
import { styles } from '../../../src/repro/styles';

export default function Profile() {
  const router = useRouter();

  return (
    <ScreenScaffold
      title="Profile"
      seed={4}
      note="Open Settings from here, then Edit profile — two pushes over the tabs, which freezes this whole Tabs navigator two levels down."
    >
      <Pressable style={styles.btn} onPress={() => router.push('/settings')}>
        <Text style={styles.btnText}>Open Settings →</Text>
      </Pressable>
    </ScreenScaffold>
  );
}
