# unistyles-1179-repro

Reproduction for [jpudysz/react-native-unistyles#1179](https://github.com/jpudysz/react-native-unistyles/issues/1179):
a native crash (use-after-free of a `ShadowNodeFamily*`) with the crashing
frames inside react-native-unistyles' native code
(`ShadowTreeManager::updateShadowTree`).

Two deterministic flows crash this app on **unistyles 3.3.0**, on a physical
device, Release build:

1. **Navigation only — no theme change involved.** A **3.3.0 regression**:
   `HybridShadowRegistry::link` of a previously-suspended (frozen) family now
   queues a pending shadow update and commits the shadow tree, so stale
   pending entries detonate during ordinary navigation. One button in the app
   drives the whole flow hands-free.
2. **Theme change after a logout** — the original flow of this repo; it also
   crashes on 3.2.5 (this repo's previous state, git commit `69305d5`).

We hit this in an app we are currently building. This repo is a cut-down
version of that app — same navigation shape, only public dependencies.

## Environment

|                            |                                          |
| -------------------------- | ---------------------------------------- |
| react-native-unistyles     | **3.3.0** (flow ① needs 3.3.0; flow ② also crashes on 3.2.5) |
| react-native-nitro-modules | 0.35.10                                  |
| react-native               | 0.83.6, New Architecture, Hermes         |
| expo                       | 55.0.27 (SDK 55), expo-router 55.0.16    |
| react-native-screens       | 4.23.0, `enableFreeze(true)`             |
| react-native-reanimated    | 4.2.1, react-native-worklets 0.7.4       |
| Crashed on                 | iPhone 14 Pro (`iPhone15,2`), iOS 26.5 (23F77) |
| Build                      | Release, EAS, internal distribution      |

## What the app does

expo-router with an auth gate: root `Stack` → `(app)` `Stack` → `(tabs)` `Tabs`.
`enableFreeze(true)` is set, so blurred screens are frozen (react-freeze).
Screens are deliberately heavy: lots of views colored from `theme.colors.*`,
plus a few continuously animating reanimated views.

## Mechanism (from reading the installed 3.3.0 sources)

- When a screen freezes, unistyles' ref cleanup takes the `suspend()` branch
  (not `unlink`) — the family stays in the registry
  (`src/specs/ShadowRegistry/index.ts`).
- Unfreezing re-links the suspended families. **Since 3.3.0** that `link()`
  call also queues a pending shadow update for each re-linked family
  (`HybridShadowRegistry.cpp:100-102`) and then commits via
  `ShadowTreeManager::updateShadowTree(rt)` (`HybridShadowRegistry.cpp:111-113`).
- The pending-updates map is never drained after a commit
  (`ShadowTrafficController::restore()` has no callers); entries are erased
  only per-family on unlink/re-link.
- A frozen screen that is unmounted wholesale (the auth-gate `<Redirect>` on
  logout) never receives `unlink` — its ref cleanup already ran at freeze
  time. Fabric frees the families, and their queued entries keep dangling in
  the map.
- The next `updateShadowTree` walks the map and dereferences every family key
  (`family->getTag()`, the `nativeProps_DEPRECATED` read/update,
  `ShadowTreeManager.cpp:22-33`) → use-after-free. On 3.2.5 that walk only ran
  on a theme/dependency commit; **on 3.3.0 it runs on every unfreeze re-link,
  i.e. on plain navigation.** Depending on what the freed memory has become,
  it dies as a libmalloc invalid-free `abort()` or a `SIGSEGV`.

## Steps

Build Release on a physical device — see [Building](#building).

### Crash ① — navigation only (3.3.0 regression, hands-free)

On **Sign in**, tap **“🚀 Auto-run navigation repro (~30 s)”** and don't touch
the phone. The driver ([`src/repro/autoRepro.ts`](src/repro/autoRepro.ts))
runs three cycles of:

> log in → push Settings → push Edit profile (the nested Tabs freeze) →
> back (tabs unfreeze; the re-link queues pending updates) → push Edit profile
> again (tabs freeze again; the entries stay) → log out (the whole `(app)`
> group unmounts while the tabs are frozen → the entries dangle)

…then a final log in → Settings → Edit profile → **back**, whose unfreeze
walks the dangling entries. In our runs the process aborts within the first
auto-run, on one of the `back` steps; tap the button again if it survives —
every run adds another batch of dangling entries. No theme API is touched at
any point.

Manual equivalent: Log in → Settings → Edit profile → Back → Edit profile →
Log out → Log in → Settings → Edit profile → Back.

### Crash ② — theme change after a logout (also crashes on 3.2.5)

1. On **Sign in**, tap **“① Log in → app”**, go to **Settings** →
   **Edit profile**.
2. Tap **“① Log out — unmount (app) while tabs frozen”**.
3. On **Sign in**, tap **“② Toggle theme”** repeatedly. (Adaptive themes are
   on, so flipping the system appearance changes the theme the same way.)

In our runs the crash came within roughly 5–20 toggles, sometimes after one
more log-in → navigate → log-out round.

## Crash artifacts

[`crash/`](crash/) contains one unedited device crash report per flow, each
with the UUID-matching dSYM of the exact binary that crashed.

### 2026-07-13 — flow ① navigation only, unistyles 3.3.0

- [`unistyles1179repro-2026-07-13-190423.ips`](crash/unistyles1179repro-2026-07-13-190423.ips) —
  as exported from the device, unedited.
- [`unistyles1179repro-2026-07-13.app.dSYM.zip`](crash/unistyles1179repro-2026-07-13.app.dSYM.zip) —
  dSYM of that binary (EAS build `dde9cf9d-b70b-42a1-9b95-5d99fb6e396f`, git
  commit `4e863c5`). UUID `A5BAAE1F-CA07-3E1B-A061-E886E3B26FD5` matches the
  `slice_uuid` in the `.ips`.

From the `.ips`: `EXC_CRASH (SIGABRT)`, `abort() called`, faulting thread
`com.facebook.react.runtime.JavaScript`, with
`___BUG_IN_CLIENT_OF_LIBMALLOC_POINTER_BEING_FREED_WAS_NOT_ALLOCATED` directly
above three app frames. Unlike the theme-path crash below, these frames are
reached as a **JSI host function called from JS bytecode**
(`hermes::vm::NativeFunction::_nativeCall` → `HFContext::func` →
`std::__1::function<jsi::Value(…)>::operator()`) — i.e. the babel-injected
`ShadowRegistry` call during a React ref attach, not a platform listener. The
main thread is simultaneously inside the navigation mounting transaction
(`RCTMountingManager performTransaction` → `calculateShadowViewMutations`).
No theme change is involved.

The three app frames (imageOffsets `645864`, `397852`, `666908` at image base
`0x102ef0000`; unistyles is statically linked, so its code lives in the main
binary), symbolicated against the dSYM:

```
$ atos -arch arm64 -o unistyles1179repro.app.dSYM/Contents/Resources/DWARF/unistyles1179repro \
    -l 0x102ef0000 0x102f8dae8 0x102f5121c 0x102f92d1c

margelo::nitro::unistyles::shadow::ShadowTreeManager::updateShadowTree(facebook::jsi::Runtime&) (in unistyles1179repro) (ShadowTreeManager.cpp:12)
margelo::nitro::unistyles::HybridShadowRegistry::link(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long) (in unistyles1179repro) (HybridShadowRegistry.cpp:0)
margelo::nitro::HybridFunction margelo::nitro::HybridFunction::createRawHybridFunction<margelo::nitro::unistyles::HybridShadowRegistry>(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, unsigned long, facebook::jsi::Value (margelo::nitro::unistyles::HybridShadowRegistry::*)(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long))::'lambda'(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long)::operator()(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long) const (in unistyles1179repro) (HybridFunction.hpp:155)
```

That is, top → down: the abort fires inside
`ShadowTreeManager::updateShadowTree`, which was called **directly from
`HybridShadowRegistry::link`** (the nitro `HybridFunction` wrapper below it is
the JS→native entry) — the exact code path added in 3.3.0
(`HybridShadowRegistry.cpp:111-113`).

### 2026-07-06 — flow ② theme change, unistyles 3.2.5

- [`unistyles1179repro-2026-07-06-162511.ips`](crash/unistyles1179repro-2026-07-06-162511.ips) —
  as exported from the device, unedited.
- [`unistyles1179repro.app.dSYM.zip`](crash/unistyles1179repro.app.dSYM.zip) —
  dSYM of that binary (EAS build `f427b27a-117a-47a2-bfa9-bb5edadc32a0`, git
  commit `e3a3401` of the pre-publication history). UUID
  `55B768B9-5A42-3266-984A-17F69B2129A5` matches the `slice_uuid` in the `.ips`.

From the `.ips`: `EXC_CRASH (SIGABRT)`, `abort() called`, faulting thread
`com.facebook.react.runtime.JavaScript`, with
`___BUG_IN_CLIENT_OF_LIBMALLOC_POINTER_BEING_FREED_WAS_NOT_ALLOCATED` directly
above the app frames.

The three app frames (imageOffsets `644924`, `417996`, `439848` at image base
`0x102104000`), symbolicated against the dSYM:

```
$ atos -arch arm64 -o unistyles1179repro.app.dSYM/Contents/Resources/DWARF/unistyles1179repro \
    -l 0x102104000 0x1021A173C 0x10216A0CC 0x10216F628

margelo::nitro::unistyles::shadow::ShadowTreeManager::updateShadowTree(facebook::jsi::Runtime&) (in unistyles1179repro) (ShadowTreeManager.cpp:12)
HybridStyleSheet::applyDependencyChanges(facebook::jsi::Runtime&, std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>&, std::__1::optional<margelo::nitro::unistyles::UnistylesNativeMiniRuntime>) (in unistyles1179repro) (HybridStyleSheet.cpp:0)
std::__1::__function::__func<HybridStyleSheet::onPlatformDependenciesChange(std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>)::$_0, std::__1::allocator<HybridStyleSheet::onPlatformDependenciesChange(std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>)::$_0>, void (facebook::jsi::Runtime&)>::operator()(facebook::jsi::Runtime&) (in unistyles1179repro) (function.h:319)
```

Below these, the stack is React's `RuntimeScheduler` executing a task on the
JS thread. Reanimated does not appear on either crashing stack (it is a
separate framework in these builds).

## Building

Only public npm dependencies — no secrets or environment variables.

Device build, signed with local credentials (see [CREDENTIALS.md](CREDENTIALS.md)):

```bash
npm install
eas build --profile preview --platform ios
```

Simulator build, no signing:

```bash
eas build --profile preview-sim --platform ios
# or locally:
npx expo run:ios --configuration Release
```

`app.json` carries our EAS `projectId`/`owner`; to build under your own Expo
account, re-run `eas init` (or replace `extra.eas.projectId` and `owner`).

## Layout

- `index.js` — entry order: `enableFreeze(true)` → `expo-router/entry` → unistyles config
- `app/` — routes: `(auth)/sign-in`, `(app)/(tabs)` (4 tabs), `settings`, `edit-profile`
- `app/index.tsx` + `app/(app)/_layout.tsx` — the auth gate (`<Redirect>` on a session flip)
- `src/session/` — minimal in-memory session store (login/logout)
- `src/theme/` — unistyles config (light/dark, adaptive) and the theme applier
- `src/repro/` — the heavy themed + animated screen bodies
- `src/repro/autoRepro.ts` — the hands-free driver for the navigation-only flow
