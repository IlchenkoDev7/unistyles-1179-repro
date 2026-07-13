import { router } from 'expo-router';

// Drives the full navigation-only repro sequence, hands-free. Each cycle:
// freeze the nested Tabs (two pushes), unfreeze them once (back → unistyles
// re-links the suspended families and queues pending shadow updates for them),
// freeze again, then log out — the auth gate unmounts the whole (app) group
// while the tabs are frozen, so those families are freed but their queued
// entries stay in unistyles' never-drained pending-updates map. Every later
// unfreeze re-link runs updateShadowTree, which walks that map and
// dereferences the freed families → crash. Cycles compound: each one both
// retries the detonation (its first `back`) and mints a fresh batch of
// dangling entries for the next attempt.
//
// Timings are deliberately generous (~2.5× the stack transition) so freeze /
// unfreeze commits fully settle between steps on any device.

type SessionActions = Readonly<{
  login: () => void;
  logout: () => void;
}>;

const STEP_MS = 900;
const GATE_MS = 1300;
const CYCLES = 3;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let running = false;

export async function runAutoRepro({ login, logout }: SessionActions): Promise<void> {
  if (running) {
    return;
  }

  running = true;

  try {
    for (let cycle = 0; cycle < CYCLES; cycle += 1) {
      login();
      await sleep(GATE_MS);
      router.push('/settings');
      await sleep(STEP_MS);
      // Tabs go two levels deep → the whole navigator freezes.
      router.push('/edit-profile');
      await sleep(STEP_MS);
      // Unfreeze: suspended families re-link, queueing pending updates.
      // From cycle 2 on this walk also dereferences the previous cycle's
      // dangling entries — the expected crash point.
      router.back();
      await sleep(STEP_MS);
      // Freeze again; the queued entries stay in the map.
      router.push('/edit-profile');
      await sleep(STEP_MS);
      // Unmounts (app) while the tabs are frozen → entries dangle.
      logout();
      await sleep(GATE_MS);
    }

    // Final detonation pass for the last cycle's zombies.
    login();
    await sleep(GATE_MS);
    router.push('/settings');
    await sleep(STEP_MS);
    router.push('/edit-profile');
    await sleep(STEP_MS);
    router.back();
  } finally {
    running = false;
  }
}
