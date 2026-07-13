import { HeavyContent } from '../../../src/repro/HeavyContent';
import { ScreenScaffold } from '../../../src/repro/ScreenScaffold';

export default function Feed() {
  return (
    <ScreenScaffold
      title="Feed"
      seed={2}
      note="You're in the app — 4 tabs inside a nested Tabs navigator. The Auto-run button on the sign-in screen drives the whole navigation-only repro; manual: push Settings → Edit profile over the tabs (freezes this navigator), go Back once (unfreeze), push Edit profile again, then log out — and repeat the pushes + Back after re-logging in."
    >
      {/* Extra styled volume on the initially-active tab: more families re-link
          on every unfreeze → more pending entries that can dangle. */}
      <HeavyContent title="Feed · extra volume" seed={12} />
    </ScreenScaffold>
  );
}
