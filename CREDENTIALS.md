# iOS signing (local credentials)

The `preview` profile uses `credentialsSource: "local"` — EAS signs with files
from this repo and never asks for an Apple login.

Put in place (all three are git-ignored):

1. `credentials/dist-cert.p12` — an Apple Distribution certificate exported
   from Keychain together with its private key.
2. `credentials/profile.mobileprovision` — an Ad Hoc provisioning profile for
   `com.reprolab.unistyles1179` that includes your device's UDID.
3. `credentials.json` — `cp credentials.example.json credentials.json`, then
   set the p12 password in it.

Both signing artifacts are created at developer.apple.com → Certificates,
Identifiers & Profiles (paid developer account required). Then:

```bash
eas build --profile preview --platform ios
```

No signing at all: `eas build --profile preview-sim --platform ios`
(simulator), or `npx expo run:ios --configuration Release` locally.
