import { ScreenScaffold } from '../../../src/repro/ScreenScaffold';

export default function Search() {
  return (
    <ScreenScaffold
      title="Search"
      seed={5}
      note="Another tab that freezes when blurred. All four tab screens stay mounted (and frozen) inside the Tabs navigator."
    />
  );
}
