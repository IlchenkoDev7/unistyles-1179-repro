import { StyleSheet } from 'react-native-unistyles';

// Shared theme-factory stylesheet, applied inside every screen (babel
// `root: 'src'`). Every container / label / badge takes its colors from the
// theme, and the heavy screens pull dozens of these per instance.
export const styles = StyleSheet.create((theme) => ({
  // --- screen shell -------------------------------------------------------
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 14,
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 14,
  },

  // --- typography ---------------------------------------------------------
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
    opacity: 0.75,
  },
  section: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.text,
    opacity: 0.5,
    marginTop: 12,
  },

  // --- primitives from the original repro ---------------------------------
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  badge: {
    fontSize: 13,
    color: theme.colors.text,
    opacity: 0.6,
  },
  btn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDanger: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnGhostText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },

  // --- heavy screen: banner ----------------------------------------------
  banner: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  bannerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text,
    opacity: 0.7,
  },

  // --- heavy screen: stat row --------------------------------------------
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },

  // --- heavy screen: feed card + nested rows ------------------------------
  feedCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedHeaderText: {
    flex: 1,
    gap: 2,
  },
  feedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  feedMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  feedBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
    opacity: 0.85,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAccent: { backgroundColor: theme.colors.accent },
  avatarSuccess: { backgroundColor: theme.colors.success },
  avatarWarning: { backgroundColor: theme.colors.warning },
  avatarDanger: { backgroundColor: theme.colors.danger },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  // --- heavy screen: tag badges (state variety) ---------------------------
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagAccent: { backgroundColor: theme.colors.accentSoft },
  tagAccentText: { color: theme.colors.accent },
  tagSuccess: { backgroundColor: theme.colors.successSoft },
  tagSuccessText: { color: theme.colors.success },
  tagWarning: { backgroundColor: theme.colors.warningSoft },
  tagWarningText: { color: theme.colors.warning },
  tagDanger: { backgroundColor: theme.colors.dangerSoft },
  tagDangerText: { color: theme.colors.danger },

  // --- heavy screen: card footer / action pills ---------------------------
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPill: {
    flex: 1,
    backgroundColor: theme.colors.cardAlt,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // --- heavy screen: block grid ------------------------------------------
  blockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  block: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockAccent: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockSuccess: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockWarning: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {
    fontSize: 9,
    color: theme.colors.text,
    opacity: 0.7,
  },

  // --- heavy screen: reanimated bits --------------------------------------
  animRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  // Geometry-only: the color arrives via a shared value (see AnimatedBits).
  animDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  // Static styles on an Animated.View that take theme colors directly.
  animBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.cardAlt,
    overflow: 'hidden',
  },
  animBarFill: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  animSpinner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: theme.colors.border,
    borderTopColor: theme.colors.accent,
  },
}));
