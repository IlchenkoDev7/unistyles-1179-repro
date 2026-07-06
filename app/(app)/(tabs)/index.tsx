import { ScreenScaffold } from '../../../src/repro/ScreenScaffold';

export default function Feed() {
  return (
    <ScreenScaffold
      title="Feed"
      seed={2}
      note="You're in the app — 4 tabs inside a nested Tabs navigator. To arm the repro: open the Profile tab → Open Settings → Edit profile (that pushes two screens over the tabs and freezes this whole navigator), then log out."
    />
  );
}
