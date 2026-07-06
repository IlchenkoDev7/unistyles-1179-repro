import { ScreenScaffold } from '../../../src/repro/ScreenScaffold';

export default function Chat() {
  return (
    <ScreenScaffold
      title="Chat"
      seed={3}
      note="A blurred tab freezes (react-freeze) as soon as you switch away. Heavy + animated content stays mounted underneath while frozen."
    />
  );
}
