# unistyles-1179-repro

Reproduction for [jpudysz/react-native-unistyles#1179](https://github.com/jpudysz/react-native-unistyles/issues/1179):
a native `SIGABRT` on a theme change, with the crashing frames inside
react-native-unistyles' native code (`ShadowTreeManager::updateShadowTree`).

We hit this in an app we are currently building. There the crash fires on the
**first** theme switch after a logout, every time, and it is blocking the app
from passing client acceptance. This repo is a cut-down version of that app —
same navigation shape, only public dependencies — and it reaches the same crash
on a physical device.

## Environment

|                            |                                          |
| -------------------------- | ---------------------------------------- |
| react-native-unistyles     | 3.2.5                                    |
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

The sequence that sets the crash up:

1. Log in, then push `settings` and `edit-profile` over the tabs. The whole
   `(tabs)` navigator is now two screens below the top and frozen.
2. Log out. The session flips to guest and the guard `<Redirect>` in
   `app/(app)/_layout.tsx` unmounts the entire `(app)` group while the tabs
   inside it are still frozen.
3. Change the theme.

Step 3 is what kills the process. Toggling the theme before step 2 never
crashed in our runs.

## Steps

Build Release on a physical device — see [Building](#building). In the app:

1. On **Sign in**, tap **“Log in → app”**. You land on the **Feed** tab.
2. Go to the **Profile** tab → **“Open Settings →”** → **“Open Edit profile →”**.
3. Tap **“① Log out — unmount (app) while tabs frozen”**. You are back on **Sign in**.
4. Tap **“② Toggle theme”** repeatedly. (Adaptive themes are on, so flipping
   the system appearance in Control Center changes the theme the same way.)

In our runs the crash came within roughly 5–20 toggles, sometimes after one
more log-in → navigate → log-out round. There is no JS error — the process
aborts. In the full app this repo was extracted from, step 4 crashes on the
first toggle.

## Crash artifacts

[`crash/`](crash/) contains one crash of this repo, captured 2026-07-06:

- [`unistyles1179repro-2026-07-06-162511.ips`](crash/unistyles1179repro-2026-07-06-162511.ips) —
  the crash report as exported from the device, unedited.
- [`unistyles1179repro.app.dSYM.zip`](crash/unistyles1179repro.app.dSYM.zip) —
  the dSYM of the binary that crashed (EAS build
  `f427b27a-117a-47a2-bfa9-bb5edadc32a0`, git commit `e3a3401`). Its UUID
  `55B768B9-5A42-3266-984A-17F69B2129A5` matches the `slice_uuid` in the `.ips`.

From the `.ips`: `EXC_CRASH (SIGABRT)`, `abort() called`, faulting thread
`com.facebook.react.runtime.JavaScript`, with
`___BUG_IN_CLIENT_OF_LIBMALLOC_POINTER_BEING_FREED_WAS_NOT_ALLOCATED` directly
above the app frames.

The three app frames (imageOffsets `644924`, `417996`, `439848` at image base
`0x102104000`; unistyles is statically linked, so its code lives in the main
binary), symbolicated against the dSYM:

```
$ atos -arch arm64 -o unistyles1179repro.app.dSYM/Contents/Resources/DWARF/unistyles1179repro \
    -l 0x102104000 0x1021A173C 0x10216A0CC 0x10216F628

margelo::nitro::unistyles::shadow::ShadowTreeManager::updateShadowTree(facebook::jsi::Runtime&) (in unistyles1179repro) (ShadowTreeManager.cpp:12)
HybridStyleSheet::applyDependencyChanges(facebook::jsi::Runtime&, std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>&, std::__1::optional<margelo::nitro::unistyles::UnistylesNativeMiniRuntime>) (in unistyles1179repro) (HybridStyleSheet.cpp:0)
std::__1::__function::__func<HybridStyleSheet::onPlatformDependenciesChange(std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>)::$_0, std::__1::allocator<HybridStyleSheet::onPlatformDependenciesChange(std::__1::vector<margelo::nitro::unistyles::UnistyleDependency, std::__1::allocator<margelo::nitro::unistyles::UnistyleDependency>>)::$_0>, void (facebook::jsi::Runtime&)>::operator()(facebook::jsi::Runtime&) (in unistyles1179repro) (function.h:319)
```

Below these, the stack is React's `RuntimeScheduler` executing a task on the
JS thread. Reanimated does not appear on the crashing stack (it is a separate
framework in this build).

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
