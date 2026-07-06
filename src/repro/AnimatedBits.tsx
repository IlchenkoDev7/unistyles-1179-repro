import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

import { styles } from './styles';

// Continuously-animating reanimated views carrying unistyles styles: a running
// worklet keeps live animation traffic on the UI thread, and the frozen screens
// hold several of these.

// Geometry-only static style; the theme color flows through a shared value synced
// in an effect.
export function PulseDot({ phase = 0 }: { phase?: number }) {
  const { theme } = useUnistyles();
  const progress = useSharedValue(0);
  const color = useSharedValue(theme.colors.accent);

  useEffect(() => {
    color.value = theme.colors.accent;
  }, [theme.colors.accent, color]);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 800 + phase * 120, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress, phase]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: 0.35 + progress.value * 0.65,
      transform: [{ scale: 0.65 + progress.value * 0.5 }],
      backgroundColor: color.value,
    }),
    [],
  );

  return <Animated.View style={[styles.animDot, animatedStyle]} />;
}

// Unlike PulseDot, the static style (`animBarFill`) takes a theme color directly.
export function BreathingBar() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scaleX: 0.25 + progress.value * 0.75 }],
    }),
    [],
  );

  return (
    <View style={styles.animBarTrack}>
      <Animated.View style={[styles.animBarFill, animatedStyle]} />
    </View>
  );
}

export function Spinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }),
    [],
  );

  return <Animated.View style={[styles.animSpinner, animatedStyle]} />;
}

// One row bundling all three — several of these per heavy screen.
export function AnimatedRow() {
  return (
    <View style={styles.animRow}>
      <Spinner />
      <PulseDot phase={0} />
      <PulseDot phase={1} />
      <PulseDot phase={2} />
      <BreathingBar />
    </View>
  );
}
