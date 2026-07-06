import { Text, View } from 'react-native';

import { AnimatedRow } from './AnimatedBits';
import { HeavyBlocks } from './HeavyBlocks';
import { styles } from './styles';

// A content-heavy, deeply-nested, fully-themed screen body. Every node takes its
// colors from the theme factory stylesheet. The point is volume + nesting + live
// animation — heavier frozen screens made the crash noticeably easier to hit.

const AVATAR_VARIANTS = [
  styles.avatarAccent,
  styles.avatarSuccess,
  styles.avatarWarning,
  styles.avatarDanger,
] as const;

const TAG_VARIANTS = [
  { box: styles.tagAccent, text: styles.tagAccentText, label: 'active' },
  { box: styles.tagSuccess, text: styles.tagSuccessText, label: 'online' },
  { box: styles.tagWarning, text: styles.tagWarningText, label: 'pending' },
  { box: styles.tagDanger, text: styles.tagDangerText, label: 'blocked' },
] as const;

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeedCard({ seed }: { seed: number }) {
  const avatar = AVATAR_VARIANTS[seed % AVATAR_VARIANTS.length];
  const tagCount = 2 + (seed % 3);

  return (
    <View style={styles.feedCard}>
      <View style={styles.feedHeaderRow}>
        <View style={[styles.avatar, avatar]}>
          <Text style={styles.avatarInitial}>{String.fromCharCode(65 + (seed % 26))}</Text>
        </View>
        <View style={styles.feedHeaderText}>
          <Text style={styles.feedTitle}>Item #{seed + 1}</Text>
          <Text style={styles.feedMeta}>nested rows · themed nodes</Text>
        </View>
      </View>

      <Text style={styles.feedBody}>
        A themed card with a nested header row, a tag row in several states, and a
        divided footer — every element takes its colors from the theme.
      </Text>

      <View style={styles.tagRow}>
        {Array.from({ length: tagCount }, (_, t) => {
          const tag = TAG_VARIANTS[(seed + t) % TAG_VARIANTS.length];
          return (
            <View key={t} style={[styles.tag, tag.box]}>
              <Text style={[styles.tagText, tag.text]}>{tag.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.actionPill}>
          <Text style={styles.actionPillText}>Like</Text>
        </View>
        <View style={styles.actionPill}>
          <Text style={styles.actionPillText}>Share</Text>
        </View>
        <View style={styles.actionPill}>
          <Text style={styles.actionPillText}>Save</Text>
        </View>
      </View>
    </View>
  );
}

type HeavyContentProps = {
  title: string;
  seed?: number;
  cardCount?: number;
};

export function HeavyContent({ title, seed = 0, cardCount = 8 }: HeavyContentProps) {
  return (
    <>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Heavy content · {title}</Text>
        <Text style={styles.bannerSubtitle}>
          Dozens of themed views + live reanimated worklets. This screen freezes
          (react-freeze) while blurred and unmounts together with its navigator on
          logout.
        </Text>
      </View>

      <View style={styles.statRow}>
        <StatCard value="128" label="views" />
        <StatCard value="15" label="tokens" />
        <StatCard value="worklets" label="live" />
      </View>

      <Text style={styles.section}>Animated · reanimated worklets</Text>
      <AnimatedRow />
      <AnimatedRow />
      <AnimatedRow />

      <Text style={styles.section}>Feed</Text>
      {Array.from({ length: cardCount }, (_, i) => (
        <FeedCard key={i} seed={seed * 10 + i} />
      ))}

      <Text style={styles.section}>Block grid</Text>
      <HeavyBlocks count={60} />
    </>
  );
}
