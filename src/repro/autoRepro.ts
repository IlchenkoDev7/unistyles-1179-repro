import { router } from 'expo-router';

// Hands-free driver for the navigation-only flow — the same round as the
// manual steps in the README. Each round: log in → switch to the Profile tab
// → push Settings → push Edit profile (two pushes put the nested Tabs
// navigator two levels deep → react-freeze freezes it) → log out. The logout
// unmounts the whole (app) group while the tabs are frozen, so unistyles
// never unlinks their families — everything keyed by those ShadowNodeFamily*
// (registry, suspended set, pending-updates map) keeps dangling. Rounds
// compound: each one plants a fresh batch of dangling entries for a later
// updateShadowTree walk to die on. The trailing log in → Profile tab starts
// one more round so the last batch gets a walk too.
//
// Timings are deliberately generous (~2.5× the stack transition) so freeze /
// unfreeze commits fully settle between steps on any device.

type SessionActions = Readonly<{
  login: () => void;
  logout: () => void;
}>;

const STEP_MS = 900;
const GATE_MS = 1300;
// In our runs 3–5 rounds usually sufficed; the extra rounds are headroom.
const ROUNDS = 7;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let running = false;

export async function runAutoRepro({ login, logout }: SessionActions): Promise<void> {
  if (running) {
    return;
  }

  running = true;

  try {
    for (let round = 0; round < ROUNDS; round += 1) {
      login();
      await sleep(GATE_MS);
      // The Settings entry point lives on the Profile tab — mirror the manual path.
      router.navigate('/profile');
      await sleep(STEP_MS);
      router.push('/settings');
      await sleep(STEP_MS);
      // Tabs go two levels deep → the whole navigator freezes.
      router.push('/edit-profile');
      await sleep(STEP_MS);
      // Unmounts (app) while the tabs are frozen → their families dangle.
      logout();
      await sleep(GATE_MS);
    }

    // Start of one more round, so the last round's entries get a walk to detonate on.
    login();
    await sleep(GATE_MS);
    router.navigate('/profile');
  } finally {
    running = false;
  }
}
