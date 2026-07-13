# unistyles-1179-repro

A native use-after-free crash in react-native-unistyles:
`ShadowTreeManager::updateShadowTree` dereferences `ShadowNodeFamily*` entries
that Fabric has already freed. This repo was originally the reproduction for
[jpudysz/react-native-unistyles#1179](https://github.com/jpudysz/react-native-unistyles/issues/1179)
(crash on a theme change); on **unistyles 3.3.0** the same dangling entries
also detonate during **plain navigation**, with no theme API involved.

Both flows crash a Release build on a physical device:

1. **Navigation only** — new in 3.3.0: `HybridShadowRegistry::link` of a
   previously-suspended (frozen) family now commits the shadow tree, so the
   crash fires during ordinary navigation. One button drives the whole flow
   hands-free.
2. **Theme change after a logout** — the original flow, recorded on 3.2.5
   (this repo's previous state, commit `69305d5`); the theme-commit path it
   dies on is unchanged in 3.3.0.

We hit both in an app we are currently building. This repo is a cut-down
version of that app — same navigation shape, only public dependencies.

## Environment

|                            |                                                |
| -------------------------- | ---------------------------------------------- |
| react-native-unistyles     | **3.3.0** (pinned exact; flow ② recorded on 3.2.5) |
| react-native-nitro-modules | 0.35.10                                        |
| react-native               | 0.83.6, New Architecture, Hermes               |
| expo                       | 55.0.27 (SDK 55), expo-router 55.0.16          |
| react-native-screens       | 4.23.0, `enableFreeze(true)`                   |
| react-native-reanimated    | 4.2.1, react-native-worklets 0.7.4             |
| Crashed on                 | iPhone 14 Pro (`iPhone15,2`), iOS 26.5 (23F77) |
| Build                      | Release, EAS, internal distribution            |

## What the app does

expo-router with an auth gate: root `Stack` → `(app)` `Stack` → `(tabs)` `Tabs`
(4 tabs). `settings` and `edit-profile` are pushed **over** the tabs; two
pushes put the whole Tabs navigator two levels deep, which freezes it
(react-freeze via `enableFreeze(true)`). On logout the auth-gate `<Redirect>`
unmounts the whole `(app)` group — including the frozen tabs. Screens are
deliberately heavy: lots of views colored from `theme.colors.*` plus a few
continuously animating reanimated views.

- `index.js` — entry order: `enableFreeze(true)` → `expo-router/entry` → unistyles config
- `app/index.tsx` + `app/(app)/_layout.tsx` — the auth gate (`<Redirect>` on a session flip)
- `src/repro/` — the heavy screen bodies; `autoRepro.ts` — the hands-free driver
- `src/session/`, `src/theme/` — in-memory session store; unistyles config (light/dark, adaptive)

## Mechanism (from reading the installed 3.3.0 sources)

- When a screen freezes, unistyles' ref cleanup takes the `suspend()` branch
  instead of `unlink` (`src/specs/ShadowRegistry/index.ts`) — the family stays
  registered.
- Unfreezing re-links the suspended families. **Since 3.3.0** `link()` of a
  suspended family also computes a shadow update for it
  (`cxx/hybridObjects/HybridShadowRegistry.cpp:100-102`), stores it in the
  pending-updates map (`cxx/core/UnistylesRegistry.cpp:83-88`), and commits via
  `ShadowTreeManager::updateShadowTree(rt)` (`HybridShadowRegistry.cpp:111-113`).
  On 3.2.5, `link()` never committed the shadow tree.
- The pending-updates map is never drained after a commit
  (`ShadowTrafficController::restore()` has no callers); entries are erased
  only per-family, on `unlink`/re-link.
- A screen that is unmounted **while frozen** (the auth-gate `<Redirect>` on
  logout) never receives `unlink` — its ref cleanup already ran at freeze time.
  Fabric frees the families, and everything keyed by those `ShadowNodeFamily*`
  (registry, suspended set, queued map entries) keeps dangling.
- The suspended set is keyed by the raw pointer, so after a frozen unmount it
  still contains freed addresses. A later mount whose new family happens to
  reuse one of them passes the `isSuspended` check and takes the
  `wasSuspended` path on its **first** `link()` — so on 3.3.0 even plain
  mounts can queue an entry and trigger the commit, no unfreeze needed.
- Every later `updateShadowTree` walks the pending-updates map and dereferences
  each family key (`family->getTag()`, the `nativeProps_DEPRECATED`
  read/update — `cxx/shadowTree/ShadowTreeManager.cpp:22-33`) → use-after-free.
  On 3.2.5 that walk ran only on a theme/dependency commit; **on 3.3.0 it runs
  on every suspended-family `link()`, i.e. during plain navigation.**
  Depending on what the freed memory has become, it dies as a libmalloc
  invalid-free `abort()` or a `SIGSEGV`.

## Steps

Build Release on a physical device — see [Building](#building).

### Crash ① — navigation only (3.3.0, hands-free)

On **Sign in**, tap **“🚀 Auto-run navigation repro (~40 s)”** and don't touch
the phone. The driver ([`src/repro/autoRepro.ts`](src/repro/autoRepro.ts))
runs seven rounds of *log in → Profile tab → push Settings → push Edit profile
(the tabs freeze) → log out (the frozen tabs unmount; their families dangle)*,
then one final log in → Profile tab so the last round's entries get a walk to
detonate on — in our runs 3–5 rounds were usually enough, the rest is
headroom. Every round adds another batch of dangling entries; if a run
survives, tap the button again. No theme API is touched at any point.

Manual equivalent, one round: **Log in → Profile tab → Open Settings → Open
Edit profile → Log out** — repeat the round until it crashes. No Back step is
needed, and no theme change.

### Crash ② — theme change after a logout (recorded on 3.2.5)

1. Tap **“① Log in → app”**, go to the **Profile** tab → **Open Settings** →
   **Open Edit profile**.
2. Tap **“① Log out — unmount (app) while tabs frozen”**.
3. On **Sign in**, tap **“② Toggle theme”** repeatedly. (Adaptive themes are
   on, so flipping the system appearance works the same way.)

In our 3.2.5 runs the crash came within roughly 5–20 toggles, sometimes after
one more log-in → navigate → log-out round.

## Crash artifacts

[`crash/`](crash/) contains unedited device crash reports, each with the app
dSYM of the exact build that produced it (its UUID matches the `slice_uuid`
in the corresponding `.ips`): two for the navigation-only flow — it has died
both ways, `SIGSEGV` and libmalloc `SIGABRT` — and one for the theme flow.

### Flow ① — navigation only, unistyles 3.3.0 (2026-07-13)

**SIGSEGV — the current driver, no Back steps:**

- [`unistyles1179repro-2026-07-13-203234.ips`](crash/unistyles1179repro-2026-07-13-203234.ips)
- [`unistyles1179repro-2026-07-13-203234.app.dSYM.zip`](crash/unistyles1179repro-2026-07-13-203234.app.dSYM.zip) —
  EAS local build, git commit `24b9e0e`, app dSYM UUID
  `9F1A0467-F788-3CE5-8E49-C8D224265069`.

`EXC_BAD_ACCESS (SIGSEGV)`, `KERN_INVALID_ADDRESS at 0x000000000000000d`,
faulting thread `com.facebook.react.runtime.JavaScript`. The three app frames
(imageOffsets `3435624`, `3205020`, `3455360` at image base `0x104078000`;
unistyles is statically linked, so its code lives in the main binary):

```
$ atos -arch arm64 -o unistyles1179repro.app.dSYM/Contents/Resources/DWARF/unistyles1179repro \
    -l 0x104078000 0x1043bec68 0x10438679c 0x1043c3980

margelo::nitro::unistyles::shadow::ShadowTreeManager::updateShadowTree(facebook::jsi::Runtime&) (in unistyles1179repro) (ShadowTreeManager.cpp:12)
margelo::nitro::unistyles::HybridShadowRegistry::link(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long) (in unistyles1179repro) (HybridShadowRegistry.cpp:0)
margelo::nitro::HybridFunction margelo::nitro::HybridFunction::createRawHybridFunction<margelo::nitro::unistyles::HybridShadowRegistry>(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, unsigned long, facebook::jsi::Value (margelo::nitro::unistyles::HybridShadowRegistry::*)(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long))::'lambda'(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long)::operator()(facebook::jsi::Runtime&, facebook::jsi::Value const&, facebook::jsi::Value const*, unsigned long) const (in unistyles1179repro) (HybridFunction.hpp:155)
```

`updateShadowTree` is called **directly from `HybridShadowRegistry::link`** —
the code path added in 3.3.0. Above these frames (in the `.ips`) the fault is
already inside React's side of that commit — `UIManager::updateShadowTree` →
`ShadowTreeRegistry::enumerate` → its transaction lambda — i.e. the
`UIManagerBinding` call unistyles makes at `ShadowTreeManager.cpp:36`. Below
them, Hermes is executing JS bytecode into a JSI host function
(`hermes::vm::NativeFunction::_nativeCall` → `HFContext::func`) — the
babel-injected `ShadowRegistry` call of a React ref attach, not a platform
listener. No theme change is involved.

**SIGABRT — an earlier shape of the same driver (extra Back steps between the
pushes; same loop otherwise):**

- [`unistyles1179repro-2026-07-13-190423.ips`](crash/unistyles1179repro-2026-07-13-190423.ips)
- [`unistyles1179repro-2026-07-13.app.dSYM.zip`](crash/unistyles1179repro-2026-07-13.app.dSYM.zip) —
  EAS build `dde9cf9d-b70b-42a1-9b95-5d99fb6e396f`, git commit `4e863c5`, app
  dSYM UUID `A5BAAE1F-CA07-3E1B-A061-E886E3B26FD5`.

Same entry: atos against that dSYM resolves its three app frames
(imageOffsets `645864`, `397852`, `666908` at image base `0x102ef0000`) to
the identical `updateShadowTree` ← `link` ← nitro-wrapper chain. This time
the walk died in libmalloc — `abort()` under
`___BUG_IN_CLIENT_OF_LIBMALLOC_POINTER_BEING_FREED_WAS_NOT_ALLOCATED` —
with the main thread simultaneously inside a navigation mounting transaction
(`RCTMountingManager performTransaction` → `calculateShadowViewMutations`).

### Flow ② — theme change after a logout, unistyles 3.2.5 (2026-07-06)

- [`unistyles1179repro-2026-07-06-162511.ips`](crash/unistyles1179repro-2026-07-06-162511.ips)
- [`unistyles1179repro.app.dSYM.zip`](crash/unistyles1179repro.app.dSYM.zip) —
  EAS build `f427b27a-117a-47a2-bfa9-bb5edadc32a0`, git commit `e3a3401` of the
  pre-publication history, app dSYM UUID `55B768B9-5A42-3266-984A-17F69B2129A5`.

Same signature — `SIGABRT`, libmalloc invalid-free on the
`com.facebook.react.runtime.JavaScript` thread — but here `updateShadowTree`
is reached from `HybridStyleSheet::applyDependencyChanges` (the theme-change
path), inside a React `RuntimeScheduler` task. The three app frames
(imageOffsets `644924`, `417996`, `439848` at image base `0x102104000`):

```
$ atos -arch arm64 -o unistyles1179repro.app.dSYM/Contents/Resources/DWARF/unistyles1179repro \
    -l 0x102104000 0x1021A173C 0x10216A0CC 0x10216F628

margelo::nitro::unistyles::shadow::ShadowTreeManager::updateShadowTree(facebook::jsi::Runtime&) (in unistyles1179repro) (ShadowTreeManager.cpp:12)
HybridStyleSheet::applyDependencyChanges(facebook::jsi::Runtime&, std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>&, std::__1::optional<margelo::nitro::unistyles::UnistylesNativeMiniRuntime>) (in unistyles1179repro) (HybridStyleSheet.cpp:0)
std::__1::__function::__func<HybridStyleSheet::onPlatformDependenciesChange(std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>)::$_0, std::__1::allocator<HybridStyleSheet::onPlatformDependenciesChange(std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>)::$_0>, void (facebook::jsi::Runtime&)>::operator()(facebook::jsi::Runtime&) (in unistyles1179repro) (function.h:319)
```

Reanimated appears on neither crashing stack (it is a separate framework in
these builds).

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
