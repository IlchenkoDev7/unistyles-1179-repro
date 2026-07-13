import { HeavyContent } from '../../../src/repro/HeavyContent';
import { ScreenScaffold } from '../../../src/repro/ScreenScaffold';

export default function Feed() {
  return (
    <ScreenScaffold
      title="Feed"
      seed={2}
      note="You're in the app — 4 tabs inside a nested Tabs navigator. Go to the Profile tab to open Settings: Settings + Edit profile pushed over the tabs freeze this whole navigator two levels down."
    >
      {/* Extra styled volume on the initially-active tab: more families re-link
          on every unfreeze → more pending entries that can dangle. */}
      <HeavyContent title="Feed · extra volume" seed={12} />
    </ScreenScaffold>
  );
}
