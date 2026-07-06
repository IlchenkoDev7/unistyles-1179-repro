import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { HeavyContent } from './HeavyContent';
import { styles } from './styles';

// Shared scrollable screen shell: a title, an optional instruction card, the
// screen-specific action buttons (children), then the heavy themed + animated
// body. Every route in the repro is one of these.
export function ScreenScaffold({
  title,
  note,
  seed = 1,
  children,
}: {
  title: string;
  note?: string;
  seed?: number;
  children?: ReactNode;
}) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.h1}>{title}</Text>
      {note ? (
        <View style={styles.card}>
          <Text style={styles.badge}>{note}</Text>
        </View>
      ) : null}
      {children}
      <HeavyContent title={title} seed={seed} />
    </ScrollView>
  );
}
