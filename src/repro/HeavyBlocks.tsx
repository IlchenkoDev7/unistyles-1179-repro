import { Text, View } from 'react-native';

import { styles } from './styles';

// Renders `count` separate theme-dependent nodes cycling through four themed
// variants — cheap bulk volume for the heavy screens.
const VARIANTS = [styles.block, styles.blockAccent, styles.block, styles.blockSuccess, styles.blockWarning] as const;

export function HeavyBlocks({ count }: { count: number }) {
  return (
    <View style={styles.blockGrid}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={VARIANTS[i % VARIANTS.length]}>
          <Text style={styles.blockText}>{i}</Text>
        </View>
      ))}
    </View>
  );
}
